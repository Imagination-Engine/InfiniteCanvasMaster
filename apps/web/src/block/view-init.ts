import { viewRegistry } from "./ViewRegistry";
import { ProseView } from "../blocks/scribe/ProseView";
import { RefinerView } from "../blocks/RefinerView";
import { JoystickView } from "../blocks/playable/JoystickView";
import { SpriteView } from "../blocks/playable/SpriteView";
import { PhysicsEntityView } from "../blocks/playable/PhysicsEntityView";
import { ColliderView } from "../blocks/playable/ColliderView";
import { ReelMediaView } from "../blocks/reel/ReelMediaView";
import { VideoStudioForgeView } from "../blocks/reel/VideoStudioForgeView";

export function initializeViewRegistry() {
  // Scribe Surface
  viewRegistry.register("iem.scribe.prose", ProseView);
  viewRegistry.register("scribe.prose", ProseView); // Legacy compat

  // Playable Surface
  viewRegistry.register("iem.playable.joystick", JoystickView);
  viewRegistry.register("joystick", JoystickView); // Legacy compat
  viewRegistry.register("iem.playable.sprite", SpriteView);
  viewRegistry.register("iem.playable.physicsEntity", PhysicsEntityView);
  viewRegistry.register("iem.playable.collider", ColliderView);

  // Reel Surface
  viewRegistry.register("iem.reel.scene", ReelMediaView);
  viewRegistry.register("iem.reel.character", ReelMediaView);
  viewRegistry.register("iem.reel.textToImage", ReelMediaView);
  viewRegistry.register("iem.studio.video", VideoStudioForgeView);
  viewRegistry.register("reel.forge", VideoStudioForgeView);

  // Register reel views on the infinite canvas kit (do not override iem.studio.video —
  // kit already registers VideoStudioBlock which reads connection + object stores).
  import("@iem/imagination-canvas-kit")
    .then(({ BlockRegistry }) => {
      if (BlockRegistry) {
        BlockRegistry.register("iem.reel.scene", ReelMediaView as any);
        BlockRegistry.register("iem.reel.character", ReelMediaView as any);
        BlockRegistry.register("iem.reel.textToImage", ReelMediaView as any);
        BlockRegistry.register("reel.forge", VideoStudioForgeView as any);
      }
    })
    .catch((e) => console.warn("Could not load BlockRegistry", e));

  // Creative Core
  viewRegistry.register("iem.core.refiner", RefinerView);
  viewRegistry.register("refiner", RefinerView); // Legacy compat

  console.log(
    `[VIEW REGISTRY] Initialized with ${viewRegistry.list().length} views.`,
  );
}
