import { describe, it, expect, vi } from "vitest";
import { chatRouter } from "../chat.js";

// Mock Mastra and Agent
vi.mock("@iem/agents", () => ({
  mastra: {
    getAgent: vi.fn().mockReturnValue({
      stream: vi.fn().mockImplementation(async (messages) => {
        // Adversarial condition: throw an error if the user tries to break it
        if (messages.some((m: any) => m.content === "throw_error")) {
          throw new Error("Simulated Agent Failure");
        }
        return {
          textStream: (async function* () {
            yield "Mocked response chunk";
          })(),
          toolCalls: [],
          toolResults: [],
        };
      }),
    }),
  },
}));

// Mock DB and Auth
const mockC = (body: any, token = "valid-token") => {
  return {
    env: { JWT_SECRET: "test-secret" },
    req: {
      header: (key: string) =>
        key === "Authorization" ? `Bearer ${token}` : null,
      json: async () => body,
    },
    set: vi.fn(),
    get: (key: string) => {
      if (key === "db")
        return {
          select: vi.fn().mockReturnThis(),
          from: vi.fn().mockReturnThis(),
          where: vi
            .fn()
            .mockResolvedValue([{ id: "draft-123", ownerId: "test-user" }]),
        };
      if (key === "user") return { sub: "test-user" };
      return null;
    },
    json: (data: any, status: number) => ({ data, status }),
  } as any;
};

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: () => ({ sub: "test-user" }),
  },
}));

describe("Chat Router (Mastra Integration)", () => {
  it("gracefully handles missing parameters", async () => {
    // We bypass middleware for unit testing the post handler directly by simulating the request object.
    // However, hono requires a bit more setup to test routes directly.
    // We can test the handler logic or the Hono app directly.
    const res = await chatRouter.request("/", {
      method: "POST",
      headers: {
        Authorization: "Bearer valid",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Session ID is required");
  });

  it("adversarial: handles agent stream failures gracefully", async () => {
    const res = await chatRouter.request("/", {
      method: "POST",
      headers: {
        Authorization: "Bearer valid",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: "draft-123",
        messages: [{ role: "user", content: "throw_error" }],
      }),
    });

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Agent orchestration failed");
    expect(data.message).toBe("Simulated Agent Failure");
  });
});
