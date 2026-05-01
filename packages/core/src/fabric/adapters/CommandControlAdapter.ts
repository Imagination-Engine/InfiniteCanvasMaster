import { createEnvelope } from "../envelope";
import { FabricRouter } from "../transport";
import { FabricTopics } from "../topics";

export interface CommandRequest<T = any> {
  id: string;
  command: string;
  targetId: string;
  payload: T;
}

export class CommandControlAdapter {
  constructor(private router: FabricRouter) {}

  async sendCommand(request: CommandRequest): Promise<void> {
    const envelope = createEnvelope<CommandRequest>({
      lane: "command_control",
      source: {
        type: "system",
        id: "cmd-dispatcher",
        topic: FabricTopics.commandControl(request.targetId),
      },
      event: { type: `cmd.${request.command}` },
      delivery: { class: "approval_required" },
      payload: request,
    });

    await this.router.publish(envelope);
  }

  async emitAcknowledgment(
    requestId: string,
    status: "ack" | "nack",
    payload?: any,
  ) {
    const envelope = createEnvelope({
      lane: "command_control",
      source: { type: "system", id: "ack-emitter" },
      event: { type: "cmd.ack" },
      delivery: { class: "ephemeral" },
      correlationId: requestId,
      payload: { requestId, status, ...payload },
    });
    await this.router.publish(envelope);
  }
}
