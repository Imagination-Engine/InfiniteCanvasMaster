// @ts-nocheck
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const VERSION = "v1";

export function deriveKey(masterKey: string, service: string): string {
  const salt = crypto.createHash("sha256").update(service).digest();
  return crypto
    .pbkdf2Sync(masterKey, salt, 100000, 32, "sha256")
    .toString("hex")
    .slice(0, 64);
}

export function encrypt(
  plaintext: string,
  masterKey: string,
  service: string,
): string {
  const serviceKeyHex = deriveKey(masterKey, service);
  // Ensure the buffer is exactly 32 bytes (256 bits)
  const serviceKey = Buffer.from(serviceKeyHex, "hex").subarray(0, 32);
  if (serviceKey.length !== 32) throw new Error("Invalid key length derived");

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, serviceKey, iv);

  let ciphertext = cipher.update(plaintext, "utf8", "hex");
  ciphertext += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  // Format: v1.service.iv.tag.ciphertext
  return `${VERSION}.${service}.${iv.toString("hex")}.${authTag}.${ciphertext}`;
}

export function decrypt(encryptedString: string, masterKey: string): string {
  const parts = encryptedString.split(".");
  if (parts.length !== 5 || parts[0] !== VERSION) {
    throw new Error("Invalid encrypted string format");
  }

  const [_, service, ivHex, authTagHex, ciphertext] = parts;
  const serviceKeyHex = deriveKey(masterKey, service);
  const serviceKey = Buffer.from(serviceKeyHex, "hex").subarray(0, 32);

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    serviceKey,
    Buffer.from(ivHex, "hex"),
  );

  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let plaintext = decipher.update(ciphertext, "hex", "utf8");
  plaintext += decipher.final("utf8");

  return plaintext;
}
