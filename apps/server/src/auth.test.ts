import { describe, it, expect, vi, beforeEach } from "vitest";
import { app } from "./app";

// Mock DB
const mockQueryResult = { rows: [], rowCount: 0 };
const mockClient = {
  connect: vi.fn().mockResolvedValue(undefined),
  query: vi.fn().mockResolvedValue(mockQueryResult),
  end: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
};

vi.mock("pg", () => {
  return {
    Client: vi.fn(function () {
      return mockClient;
    }),
  };
});

// Mock Drizzle
vi.mock("drizzle-orm/node-postgres", async () => {
  const actual = (await vi.importActual("drizzle-orm/node-postgres")) as any;
  return {
    ...actual,
    drizzle: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      // Mocking the execution
      then: vi.fn(function (this: any, resolve: any) {
        // Default behavior: return an empty array for selects, or a single object for inserts
        resolve([]);
      }),
    })),
  };
});

// Since mocking the chain is hard, let's use a more stateful mock for the tests
const dbState = {
  users: [] as any[],
  sessions: [] as any[],
};

import { drizzle } from "drizzle-orm/node-postgres";
import { users, authSessions } from "./schema";

vi.mocked(drizzle).mockReturnValue({
  select: vi.fn().mockImplementation(() => ({
    from: vi.fn().mockImplementation((table) => ({
      where: vi.fn().mockImplementation((condition) => ({
        then: (resolve: any) => {
          if (table === users) {
            // Very simplified: return a user if we are in login/refresh tests
            resolve(dbState.users);
          } else if (table === authSessions) {
            resolve(dbState.sessions);
          } else {
            resolve([]);
          }
        },
      })),
    })),
  })),
  insert: vi.fn().mockImplementation((table) => {
    const insertObj = {
      values: vi.fn().mockImplementation((values) => {
        const valuesObj = {
          returning: vi.fn().mockImplementation(() => {
            return {
              then: (resolve: any) => {
                if (table === users) {
                  const newUser = {
                    ...values,
                    id: "test-user-id",
                    hasCompletedOnboarding: false,
                  };
                  dbState.users = [newUser];
                  resolve([newUser]);
                } else if (table === authSessions) {
                  dbState.sessions = [values];
                  resolve([values]);
                } else {
                  resolve([{}]);
                }
              },
            };
          }),
          then: (resolve: any) => {
            // Handle case without .returning()
            if (table === authSessions) {
              dbState.sessions = [values];
            } else if (table === users) {
              dbState.users = [{ ...values, id: "test-user-id" }];
            }
            resolve();
          },
        };
        return valuesObj;
      }),
    };
    return insertObj;
  }),
  delete: vi.fn().mockImplementation((table) => ({
    where: vi.fn().mockImplementation(() => ({
      then: (resolve: any) => {
        if (table === authSessions) {
          dbState.sessions = [];
        }
        resolve();
      },
    })),
  })),
} as any);

// Since mocking drizzle internals is hard, let's just mock the auth routes' dependencies if possible,
// or provide a mock env that satisfies dbMiddleware.

describe("Auth Flow", () => {
  const testUser = {
    username: `testuser_${Date.now()}`,
    password: "password123",
  };

  const env = {
    HYPERDRIVE: {
      connectionString: "postgres://localhost:5432/test",
    },
  };

  it("should signup a new user", async () => {
    const res = await app.request(
      "/api/auth/signup",
      {
        method: "POST",
        body: JSON.stringify(testUser),
        headers: {
          "Content-Type": "application/json",
        },
      },
      env,
    );

    expect(res.status).toBe(201);
    const body: any = await res.json();
    expect(body).toHaveProperty("accessToken");
    expect(body.user).toHaveProperty("username", testUser.username);

    const cookie = res.headers.get("set-cookie");
    expect(cookie).toContain("refresh_token");
  });

  it("should login an existing user", async () => {
    const res = await app.request(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify(testUser),
        headers: {
          "Content-Type": "application/json",
        },
      },
      env,
    );

    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body).toHaveProperty("accessToken");

    const cookie = res.headers.get("set-cookie");
    expect(cookie).toContain("refresh_token");
  });

  it("should refresh the access token", async () => {
    // First login to get a cookie
    const loginRes = await app.request(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify(testUser),
        headers: {
          "Content-Type": "application/json",
        },
      },
      env,
    );
    const setCookie = loginRes.headers.get("set-cookie") || "";
    const cookie = setCookie.split(";")[0]; // Extract "refresh_token=..."

    // Now call refresh with the cookie
    const res = await app.request(
      "/api/auth/refresh",
      {
        method: "POST",
        headers: {
          Cookie: cookie,
        },
      },
      env,
    );

    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body).toHaveProperty("accessToken");
    expect(body.user).toHaveProperty("username", testUser.username);
  });

  it("should fail refresh with invalid cookie", async () => {
    const res = await app.request(
      "/api/auth/refresh",
      {
        method: "POST",
        headers: {
          Cookie: "refresh_token=invalid-token",
        },
      },
      env,
    );

    expect(res.status).toBe(401);
  });

  it("should logout and invalidate refresh token", async () => {
    // First login to get a cookie
    const loginRes = await app.request(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify(testUser),
        headers: {
          "Content-Type": "application/json",
        },
      },
      env,
    );
    const setCookie = loginRes.headers.get("set-cookie") || "";
    const cookie = setCookie.split(";")[0];

    // Logout
    const logoutRes = await app.request(
      "/api/auth/logout",
      {
        method: "POST",
        headers: {
          Cookie: cookie,
        },
      },
      env,
    );
    expect(logoutRes.status).toBe(200);

    // Refresh should now fail
    const res = await app.request(
      "/api/auth/refresh",
      {
        method: "POST",
        headers: {
          Cookie: cookie,
        },
      },
      env,
    );
    expect(res.status).toBe(401);
  });
});
