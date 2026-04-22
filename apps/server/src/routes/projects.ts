import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { sessions, messages, canvases } from "../schema.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-fallback-key";

const projectsRouter = new Hono();

// Auth Middleware
projectsRouter.use("*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    c.set("user", payload);
    await next();
  } catch (err) {
    return c.json({ error: "Invalid token" }, 401);
  }
});

projectsRouter.get("/", async (c) => {
  const db = c.get("db") as any;
  const user = c.get("user") as any;

  try {
    const userSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.ownerId, user.sub))
      .orderBy(desc(sessions.updatedAt));

    const projects = userSessions.map((s: any) => ({
      id: s.id,
      name: s.title || "Untitled Project",
      created_at: s.createdAt,
      updated_at: s.updatedAt,
    }));

    return c.json({ projects });
  } catch (error) {
    console.error("Fetch projects error:", error);
    return c.json({ error: "Failed to fetch projects" }, 500);
  }
});

projectsRouter.post("/", async (c) => {
  const db = c.get("db") as any;
  const user = c.get("user") as any;
  const { name, story } = await c.req.json();

  try {
    const [newSession] = await db
      .insert(sessions)
      .values({
        ownerId: user.sub,
        title: name || "New Project",
      })
      .returning();

    // If a story is provided, seed it as the first message
    if (story) {
      await db.insert(messages).values({
        sessionId: newSession.id,
        role: "user",
        content: story,
      });
    }

    return c.json(
      {
        project: {
          id: newSession.id,
          name: newSession.title,
          created_at: newSession.createdAt,
          updated_at: newSession.updatedAt,
        },
      },
      201,
    );
  } catch (error) {
    console.error("Create project error:", error);
    return c.json({ error: "Failed to create project" }, 500);
  }
});

projectsRouter.get("/:id", async (c) => {
  const db = c.get("db") as any;
  const user = c.get("user") as any;
  const projectId = c.req.param("id");

  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, projectId));
    if (!session || session.ownerId !== user.sub) {
      return c.json({ error: "Project not found" }, 404);
    }

    const projectMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, projectId))
      .orderBy(messages.createdAt);

    return c.json({
      project: {
        id: session.id,
        name: session.title,
        created_at: session.createdAt,
        updated_at: session.updatedAt,
      },
      messages: projectMessages,
    });
  } catch (error) {
    console.error("Fetch project error:", error);
    return c.json({ error: "Failed to fetch project" }, 500);
  }
});

projectsRouter.get("/:id/canvas", async (c) => {
  const db = c.get("db") as any;
  const user = c.get("user") as any;
  const projectId = c.req.param("id");

  try {
    // Check auth
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, projectId));
    if (!session || session.ownerId !== user.sub) {
      return c.json({ error: "Project not found" }, 404);
    }

    let [canvas] = await db
      .select()
      .from(canvases)
      .where(eq(canvases.sessionId, projectId));

    // Create an empty canvas if it doesn't exist
    if (!canvas) {
      const defaultDoc = {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      };
      [canvas] = await db
        .insert(canvases)
        .values({
          sessionId: projectId,
          name: "Main Canvas",
          viewport: defaultDoc.viewport,
        })
        .returning();

      return c.json({
        canvas: {
          id: canvas.id,
          kind: "creativity",
          name: canvas.name,
          document: defaultDoc,
          updated_at: canvas.updatedAt,
        },
      });
    }

    // We'd ideally fetch blocks from `blocks` table here.
    // For now, we simulate the `document` structure from `canvas.viewport` and `canvas.id`
    // In a fully built app, this would reconstruct the UnifiedCanvasDocument from the `blocks` table.
    // If the blocks table isn't populated, we just return an empty doc.
    const document = {
      nodes: [],
      edges: [],
      viewport: canvas.viewport || { x: 0, y: 0, zoom: 1 },
    };

    return c.json({
      canvas: {
        id: canvas.id,
        kind: "creativity",
        name: canvas.name,
        document,
        updated_at: canvas.updatedAt,
      },
    });
  } catch (error) {
    console.error("Fetch canvas error:", error);
    return c.json({ error: "Failed to fetch canvas" }, 500);
  }
});

projectsRouter.put("/:id/canvas", async (c) => {
  const db = c.get("db") as any;
  const user = c.get("user") as any;
  const projectId = c.req.param("id");
  const { document } = await c.req.json();

  try {
    // Check auth
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, projectId));
    if (!session || session.ownerId !== user.sub) {
      return c.json({ error: "Project not found" }, 404);
    }

    const [canvas] = await db
      .select()
      .from(canvases)
      .where(eq(canvases.sessionId, projectId));
    if (!canvas) {
      return c.json({ error: "Canvas not found" }, 404);
    }

    // In a full implementation, we'd update the `blocks` table based on `document.nodes`.
    // Here we just update the viewport on the canvas record to represent the save.
    const [updatedCanvas] = await db
      .update(canvases)
      .set({ viewport: document.viewport, updatedAt: new Date() })
      .where(eq(canvases.id, canvas.id))
      .returning();

    return c.json({
      canvas: {
        id: updatedCanvas.id,
        kind: "creativity",
        name: updatedCanvas.name,
        document,
        updated_at: updatedCanvas.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update canvas error:", error);
    return c.json({ error: "Failed to update canvas" }, 500);
  }
});

projectsRouter.delete("/:id", async (c) => {
  const db = c.get("db") as any;
  const projectId = c.req.param("id");

  try {
    await db.delete(sessions).where(eq(sessions.id, projectId));
    return c.json({ success: true }, 200);
  } catch (error) {
    console.error("Delete project error:", error);
    return c.json({ error: "Failed to delete project" }, 500);
  }
});

export { projectsRouter };
