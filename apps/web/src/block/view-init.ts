import { viewRegistry } from "./ViewRegistry";
import { ProseView } from "../blocks/scribe/ProseView";
import { RefinerView } from "../blocks/RefinerView";
import { JoystickView } from "../blocks/playable/JoystickView";
import { SpriteView } from "../blocks/playable/SpriteView";
import { PhysicsEntityView } from "../blocks/playable/PhysicsEntityView";
import { ColliderView } from "../blocks/playable/ColliderView";

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

  // Creative Core
  viewRegistry.register("iem.core.refiner", RefinerView);
  viewRegistry.register("refiner", RefinerView); // Legacy compat

  console.log(
    `[VIEW REGISTRY] Initialized with ${viewRegistry.list().length} views.`,
  );
}
