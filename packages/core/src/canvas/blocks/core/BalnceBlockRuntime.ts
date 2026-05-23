import type { BalnceBlockSpec } from "./BalnceBlockSpec";
import type {
  BalnceBlockInstance,
  BlockRuntimeStatus,
} from "./BalnceBlockInstance";
import { BalnceBlockEventType } from "./BlockEvents";
import {
  createEnvelope,
  upgradeLegacyEnvelope,
} from "../../../fabric/envelope";
import { messageBus } from "../../../bus/MessageBus";
import { RuntimeEventBus } from "../../runtime/RuntimeEventBus";

/**
 * Abstract class representing the dynamic execution environment of a canvas block.
 * Concrete block classes extend this runtime.
 */
export abstract class BalnceBlockRuntime {
  protected spec: BalnceBlockSpec;
  protected instance?: BalnceBlockInstance;
  protected inputBuffer: Record<string, unknown> = {};

  constructor(spec: BalnceBlockSpec) {
    this.spec = spec;
  }

  /**
   * Returns the specification schema defining this block.
   */
  public getSpec(): BalnceBlockSpec {
    return this.spec;
  }

  /**
   * Returns the current instance state loaded in the runtime.
   */
  public getInstance(): BalnceBlockInstance | undefined {
    return this.instance;
  }

  /**
   * Hydrates the runtime with a concrete block instance database representation.
   */
  public hydrate(instance: BalnceBlockInstance): void {
    this.instance = { ...instance };
    this.inputBuffer = { ...instance.props };
    this.emit(BalnceBlockEventType.CREATED, {
      blockId: instance.id,
      specId: this.spec.id,
      canvasId: instance.canvasId,
    });
  }

  /**
   * Receives incoming data from a connected upstream source on a specific input port.
   */
  public async receive(portName: string, data: unknown): Promise<void> {
    if (!this.instance) {
      throw new Error(
        `Runtime not hydrated. Cannot receive input on port: ${portName}`,
      );
    }

    const portDef = this.spec.inputPorts[portName];
    if (!portDef) {
      throw new Error(
        `Input port "${portName}" not defined in spec "${this.spec.id}"`,
      );
    }

    // Validate incoming data schema contract
    const validationResult = portDef.schema.safeParse(data);
    if (!validationResult.success) {
      const errorMsg = `Validation failed for port "${portName}" on block "${this.instance.id}": ${validationResult.error.message}`;
      this.setStatus("error");
      this.emit(BalnceBlockEventType.ERROR, {
        blockId: this.instance.id,
        error: errorMsg,
      });
      throw new Error(errorMsg);
    }

    // Store validated input
    this.inputBuffer[portName] = validationResult.data;
    this.instance.props = { ...this.inputBuffer };
    this.instance.updatedAt = new Date().toISOString();

    this.emit(BalnceBlockEventType.INPUT_RECEIVED, {
      blockId: this.instance.id,
      portName,
      value: validationResult.data,
    });

    // Auto-invoke block execution if triggered and all required inputs are present
    if (this.spec.inputPorts[portName]?.required !== false) {
      const requiredMissing = Object.values(this.spec.inputPorts).some(
        (port) => port.required && this.inputBuffer[port.name] === undefined,
      );
      if (!requiredMissing) {
        await this.runSequence();
      }
    }
  }

  /**
   * Builds the execution context, merging inputs, properties, and metadata.
   */
  public async buildContext(): Promise<Record<string, unknown>> {
    if (!this.instance) throw new Error("Runtime not hydrated");

    const context = {
      blockId: this.instance.id,
      specId: this.spec.id,
      canvasId: this.instance.canvasId,
      props: this.instance.props,
      inputs: this.inputBuffer,
      metadata: {
        title: this.spec.title,
        description: this.spec.description,
        agentConfiguration: this.spec.agentConfiguration,
      },
    };

    this.emit(BalnceBlockEventType.CONTEXT_BUILT, {
      blockId: this.instance.id,
      context,
    });

    return context;
  }

  /**
   * Builds a plan of action using reasoning models. Custom blocks override this method.
   */
  public async plan(context: Record<string, unknown>): Promise<unknown> {
    if (!this.instance) throw new Error("Runtime not hydrated");

    // Standard plan layout
    const planResult = {
      blockId: this.instance.id,
      steps: [
        {
          action: "invoke_agent",
          description: `Execute core LLM logic for spec ${this.spec.id}`,
        },
      ],
      timestamp: new Date().toISOString(),
    };

    this.emit(BalnceBlockEventType.PLAN_CREATED, {
      blockId: this.instance.id,
      plan: planResult,
    });

    return planResult;
  }

  /**
   * Abstract execution loop method to be implemented by concrete blocks.
   */
  public abstract execute(
    context: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;

  /**
   * Triggers the full hydrated runtime execution cycle: Context -> Plan -> Execute.
   */
  public async runSequence(): Promise<Record<string, unknown>> {
    if (!this.instance) throw new Error("Runtime not hydrated");

    this.setStatus("running");
    this.emit(BalnceBlockEventType.INVOKED, {
      blockId: this.instance.id,
      input: this.inputBuffer,
    });

    try {
      const context = await this.buildContext();
      await this.plan(context);

      const outputs = await this.execute(context);

      // Validate outputs against spec port declarations
      for (const [portName, portDef] of Object.entries(this.spec.outputPorts)) {
        if (portName in outputs) {
          const check = portDef.schema.safeParse(outputs[portName]);
          if (!check.success) {
            console.warn(
              `[Runtime] Warning: Output on port "${portName}" did not match output schema:`,
              check.error.message,
            );
          }
        }
      }

      this.instance.updatedAt = new Date().toISOString();
      this.setStatus("complete");

      this.emit(BalnceBlockEventType.OUTPUT_CREATED, {
        blockId: this.instance.id,
        output: outputs,
      });

      return outputs;
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.setStatus("error");
      this.emit(BalnceBlockEventType.ERROR, {
        blockId: this.instance.id,
        error: errorMsg,
      });
      throw err;
    }
  }

  /**
   * Emits an envelope event out to the local EventBus and the core Fabric messageBus.
   */
  public emit(
    eventType: BalnceBlockEventType | string,
    payload: unknown,
  ): void {
    if (!this.instance) return;

    // 1. Broadcast locally via the synchronous canvas RuntimeEventBus
    RuntimeEventBus.publish(eventType, payload);

    // 2. Broadcast globally across the monorepo via Balnce Fabric messageBus
    try {
      const envelope = createEnvelope({
        lane: "agent_stream",
        source: {
          type: "block",
          id: this.instance.id,
          name: this.spec.title,
          topic: eventType,
        },
        event: {
          type: eventType,
        },
        delivery: {
          class: "ephemeral",
        },
        payload,
      });
      messageBus.publish(envelope);
    } catch (e) {
      console.warn(
        "[Runtime] Failed to route block event to global fabric bus:",
        e,
      );
    }
  }

  /**
   * Inspectors trace metadata state of the running runtime instance.
   */
  public async inspect(): Promise<Record<string, unknown>> {
    if (!this.instance) {
      return { status: "unhydrated", specId: this.spec.id };
    }

    return {
      instanceId: this.instance.id,
      specId: this.spec.id,
      canvasId: this.instance.canvasId,
      status: this.instance.runtimeStatus,
      props: this.instance.props,
      inputBuffer: this.inputBuffer,
      specMetadata: {
        title: this.spec.title,
        version: this.spec.version,
        kind: this.spec.kind,
      },
      visual: this.spec.visualMetadata,
    };
  }

  /**
   * Internal status state setter.
   */
  protected setStatus(status: BlockRuntimeStatus): void {
    if (this.instance) {
      this.instance.runtimeStatus = status;
      this.instance.updatedAt = new Date().toISOString();
    }
  }
}
