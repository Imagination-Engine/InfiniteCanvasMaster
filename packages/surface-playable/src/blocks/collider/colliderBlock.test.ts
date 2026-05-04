import { describe, it, expect } from "vitest";
import { colliderBlock } from "./colliderBlock";

describe("Collider Block (Red/Green Phase)", () => {
  it("has valid metadata and schema", () => {
    expect(colliderBlock.id).toBe("iem.playable.collider");
    expect(colliderBlock.name).toBe("Hitbox Collider");

    const validIn = {
      shape: "rectangle",
      width: 64,
      height: 64,
      isTrigger: false,
      collisionGroup: "default",
    };
    expect(colliderBlock.input.parse(validIn)).toMatchObject({
      shape: "rectangle",
    });
  });

  it("executes agent binding successfully", async () => {
    const result = await colliderBlock.agent.invoke({ shape: "rectangle" });
    expect(result.isColliding).toBe(false);
  });

  it("adversarial: rejects invalid schema inputs", () => {
    expect(() => colliderBlock.input.parse({ shape: 123 })).toThrow();
  });
});
