import { InProcessTransport } from "../fabric/transports/InProcessTransport";
import { BalnceFabricRouter } from "../fabric/router";
export declare const localTransport: InProcessTransport;
export declare const fabricRouter: BalnceFabricRouter;
export declare const messageBus: BalnceFabricRouter;
export declare const legacyMessageBus: {
  publish: (topic: string, message: string) => void;
  subscribe: (topic: string, callback: (message: any) => void) => () => void;
};
//# sourceMappingURL=MessageBus.d.ts.map
