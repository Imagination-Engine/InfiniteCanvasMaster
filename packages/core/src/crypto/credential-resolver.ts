import { encrypt, decrypt } from "./index";

// Simplified mock types for Drizzle DB interactions
interface MockDb {
  insert: (table: any) => any;
  select: (columns?: any) => any;
}

export class CredentialResolver {
  constructor(
    private db: MockDb,
    private masterKey: string,
  ) {}

  async store(
    userId: string,
    service: string,
    plaintextToken: string,
    expiresAt?: number,
  ): Promise<void> {
    const encryptedToken = encrypt(plaintextToken, this.masterKey, service);

    // Stub implementation of Drizzle insert
    await this.db.insert("userIntegrations").values({
      userId,
      service,
      encryptedToken,
      expiresAt: expiresAt || null,
    });
  }

  async resolve(userId: string, service: string): Promise<string> {
    // Stub implementation of Drizzle select
    const result = await this.db
      .select()
      .from("userIntegrations")
      .where({ userId, service });

    if (!result || result.length === 0) {
      throw new Error(`Credential not found for service: ${service}`);
    }

    const row = result[0];

    if (row.expiresAt && Date.now() > row.expiresAt) {
      // In a real implementation, this is where we'd trigger the refresh hook
      throw new Error(`Credential expired for service: ${service}`);
    }

    return decrypt(row.encryptedToken, this.masterKey);
  }
}
