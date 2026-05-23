import type { BalnceBlockSpec } from "../blocks/core/BalnceBlockSpec";
import type { BalnceBlockRuntime } from "../blocks/core/BalnceBlockRuntime";

/**
 * Registry mapping block specs and active instances.
 */
class BlockRuntimeRegistryClass {
  private specs: Map<string, BalnceBlockSpec> = new Map();
  private runtimes: Map<string, BalnceBlockRuntime> = new Map();

  /**
   * Registers a block specification schema.
   */
  public registerSpec(spec: BalnceBlockSpec): void {
    this.specs.set(spec.id, spec);
  }

  /**
   * Retrieves a registered specification by ID.
   */
  public getSpec(specId: string): BalnceBlockSpec | undefined {
    return this.specs.get(specId);
  }

  /**
   * Lists all registered specifications.
   */
  public listSpecs(): BalnceBlockSpec[] {
    return Array.from(this.specs.values());
  }

  /**
   * Registers an active block runtime instance bound to the canvas.
   */
  public registerInstance(
    instanceId: string,
    runtime: BalnceBlockRuntime,
  ): void {
    this.runtimes.set(instanceId, runtime);
  }

  /**
   * Unregisters an active runtime instance.
   */
  public unregisterInstance(instanceId: string): void {
    this.runtimes.delete(instanceId);
  }

  /**
   * Retrieves an active runtime environment by block instance ID.
   */
  public getRuntime(instanceId: string): BalnceBlockRuntime | undefined {
    return this.runtimes.get(instanceId);
  }

  /**
   * Lists all active runtime environments.
   */
  public listRuntimes(): BalnceBlockRuntime[] {
    return Array.from(this.runtimes.values());
  }

  /**
   * Clears the registry memory.
   */
  public clear(): void {
    this.specs.clear();
    this.runtimes.clear();
  }
}

export const BlockRuntimeRegistry = new BlockRuntimeRegistryClass();
