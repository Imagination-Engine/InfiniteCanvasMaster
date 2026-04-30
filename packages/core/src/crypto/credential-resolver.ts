import { encrypt, decrypt } from "./index";
import { pgTable, text, bigint } from "drizzle-orm/pg-core";
import { eq, and } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export const userIntegrations = pgTable("userIntegrations", {
  userId: text("userId").notNull(),
  service: text("service").notNull(),
  encryptedToken: text("encryptedToken").notNull(),
  expiresAt: bigint("expiresAt", { mode: "number" }),
});

export class CredentialResolver {
  constructor(
    private db: NodePgDatabase<any>,
    private masterKey: string,
    private onRefreshHook?: (userId: string, service: string) => Promise<void>,
  ) {}

  async store(
    userId: string,
    service: string,
    plaintextToken: string,
    expiresAt?: number,
  ): Promise<void> {
    const encryptedToken = encrypt(plaintextToken, this.masterKey, service);

    await this.db.insert(userIntegrations).values({
      userId,
      service,
      encryptedToken,
      expiresAt: expiresAt || null,
    });
  }

  async resolve(userId: string, service: string): Promise<string> {
    const result = await this.db
      .select()
      .from(userIntegrations)
      .where(
        and(
          eq(userIntegrations.userId, userId),
          eq(userIntegrations.service, service),
        ),
      );

    if (!result || result.length === 0) {
      throw new Error(`Credential not found for service: ${service}`);
    }

    const row = result[0];

    if (row.expiresAt && Date.now() > row.expiresAt) {
      if (this.onRefreshHook) {
        await this.onRefreshHook(userId, service);
        throw new Error(
          `Credential expired and refresh triggered for service: ${service}`,
        );
      }
      throw new Error(`Credential expired for service: ${service}`);
    }

    return decrypt(row.encryptedToken, this.masterKey);
  }
}
