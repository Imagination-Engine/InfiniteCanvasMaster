import { describe, it, expect } from "vitest";
import { encrypt, decrypt, deriveKey } from "./index";

describe("Cryptographic Primitives (Red/Green Phase)", () => {
  const masterKey = Buffer.alloc(32, "a").toString("hex");

  it("generates a consistent 32-byte key for a given service", () => {
    const key1 = deriveKey(masterKey, "slack");
    const key2 = deriveKey(masterKey, "slack");
    expect(key1).toEqual(key2);
    // hex string of 32 bytes is 64 characters
    expect(key1.length).toBe(64);
  });

  it("encrypts and decrypts a string successfully", () => {
    const plaintext = "secret-token-123";
    const encrypted = encrypt(plaintext, masterKey, "slack");

    // Check format v1.service.iv.tag.ciphertext
    const parts = encrypted.split(".");
    expect(parts.length).toBe(5);
    expect(parts[0]).toBe("v1");
    expect(parts[1]).toBe("slack");

    const decrypted = decrypt(encrypted, masterKey);
    expect(decrypted).toBe(plaintext);
  });

  describe("Adversarial Scenarios", () => {
    it("fails to decrypt if the ciphertext is tampered with (auth tag validation)", () => {
      const plaintext = "secret-token-123";
      const encrypted = encrypt(plaintext, masterKey, "slack");

      const parts = encrypted.split(".");
      // Tamper with ciphertext
      parts[4] = Buffer.from(parts[4], "hex")
        .map((b) => b ^ 1)
        .toString("hex");
      const tampered = parts.join(".");

      expect(() => decrypt(tampered, masterKey)).toThrow(
        "Unsupported state or unable to authenticate data",
      );
    });

    it("fails to decrypt if attempting to use a different service subkey", () => {
      const plaintext = "secret-token-123";
      const encrypted = encrypt(plaintext, masterKey, "slack"); // encrypted with slack key

      // Manually tamper the string to trick it into using the 'notion' key during decryption
      const parts = encrypted.split(".");
      parts[1] = "notion";
      const tampered = parts.join(".");

      expect(() => decrypt(tampered, masterKey)).toThrow();
    });
  });
});
