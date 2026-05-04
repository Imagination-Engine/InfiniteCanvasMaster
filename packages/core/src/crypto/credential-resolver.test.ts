// @ts-nocheck
import { describe, it, expect, vi } from "vitest";
import { CredentialResolver } from "./credential-resolver";
import { encrypt } from "./index";

describe("CredentialResolver (Red/Green Phase)", () => {
  const masterKey = Buffer.alloc(32, "a").toString("hex");
  const userId = "user_123";
  const service = "slack";
  const plaintextToken = "mock-secret-token-that-passes-scanner";
  const encryptedToken = encrypt(plaintextToken, masterKey, service);

  it("stores a credential encrypted", async () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ id: "1" }]),
      }),
    };

    const resolver = new CredentialResolver(mockDb as any, masterKey);
    await resolver.store(userId, service, plaintextToken);

    // Verify it called insert with the encrypted string, not plaintext
    const insertedValues = mockDb.insert().values.mock.calls[0][0];
    expect(insertedValues.encryptedToken).toBeDefined();
    expect(insertedValues.encryptedToken).not.toBe(plaintextToken);
    expect(insertedValues.encryptedToken).toContain(`v1.${service}`);
  });

  it("resolves a credential by decrypting it", async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi
            .fn()
            .mockResolvedValue([
              { encryptedToken, expiresAt: Date.now() + 10000 },
            ]),
        }),
      }),
    };

    const resolver = new CredentialResolver(mockDb as any, masterKey);
    const result = await resolver.resolve(userId, service);
    expect(result).toBe(plaintextToken);
  });

  it("throws an error if credential has expired", async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi
            .fn()
            .mockResolvedValue([
              { encryptedToken, expiresAt: Date.now() - 10000 },
            ]),
        }),
      }),
    };

    const resolver = new CredentialResolver(mockDb as any, masterKey);
    await expect(resolver.resolve(userId, service)).rejects.toThrow(
      "Credential expired for service: slack",
    );
  });

  it("triggers refresh hook and throws an error if credential has expired", async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi
            .fn()
            .mockResolvedValue([
              { encryptedToken, expiresAt: Date.now() - 10000 },
            ]),
        }),
      }),
    };

    const refreshHook = vi.fn().mockResolvedValue(undefined);
    const resolver = new CredentialResolver(
      mockDb as any,
      masterKey,
      refreshHook,
    );
    await expect(resolver.resolve(userId, service)).rejects.toThrow(
      "Credential expired and refresh triggered for service: slack",
    );
    expect(refreshHook).toHaveBeenCalledWith(userId, service);
  });

  it("throws an error if credential not found", async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      }),
    };

    const resolver = new CredentialResolver(mockDb as any, masterKey);
    await expect(resolver.resolve(userId, service)).rejects.toThrow(
      "Credential not found for service: slack",
    );
  });
});
