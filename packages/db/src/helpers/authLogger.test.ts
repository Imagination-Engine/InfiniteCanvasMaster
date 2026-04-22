import { describe, it, expect, vi } from "vitest";
import { logAuthEvent } from "./authLogger";

describe("auth_events schema & helpers (Red/Green Phase)", () => {
  it("logs a success event with IP tracking", async () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ id: 1 }]),
      }),
    };

    await logAuthEvent(mockDb as any, {
      status: "login_success",
      userId: "user_123",
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0",
    });

    const inserted = mockDb.insert().values.mock.calls[0][0];
    expect(inserted.status).toBe("login_success");
    expect(inserted.userId).toBe("user_123");
    expect(inserted.ipAddress).toBe("192.168.1.1");
  });

  it("logs a failure event", async () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ id: 2 }]),
      }),
    };

    await logAuthEvent(mockDb as any, {
      status: "login_failure",
      ipAddress: "10.0.0.1",
      userAgent: "curl/7.64.1",
    });

    const inserted = mockDb.insert().values.mock.calls[0][0];
    expect(inserted.status).toBe("login_failure");
    expect(inserted.userId).toBeNull();
  });

  it("adversarial: prevents logging massive payloads in metadata to avoid DOS", async () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn(),
      }),
    };

    const massiveMetadata = "x".repeat(10000); // 10kb string

    await expect(
      logAuthEvent(mockDb as any, {
        status: "login_failure",
        ipAddress: "127.0.0.1",
        metadata: massiveMetadata,
      }),
    ).rejects.toThrow("Metadata payload exceeds maximum allowed size");
  });
});
