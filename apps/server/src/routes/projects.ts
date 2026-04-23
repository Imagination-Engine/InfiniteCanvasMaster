import { Hono } from "hono";
import { eq, desc, asc } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { workspaces, messages, canvases, nodes, edges } from "@iem/db";

const projectsRouter = new Hono();

const getSecrets = (c: any) => {
  return {
    JWT_SECRET:
      c.env?.JWT_SECRET ||
      process.env.JWT_SECRET ||
      "super-secret-fallback-key",
  };
};

// Auth Middleware
projectsRouter.use("*", async (c, next) => {
  const { JWT_SECRET } = getSecrets(c);
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("[PROJECTS AUTH] Missing or invalid Authorization header");
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    c.set("user", payload);
    await next();
  } catch (err) {
    console.error("[PROJECTS AUTH] JWT Verify failed:", err);
    return c.json({ error: "Invalid token" }, 401);
  }
});

projectsRouter.get("/", async (c) => {
  const db = c.get("db") as any;
  const user = c.get("user") as any;

  try {
    const userWorkspaces = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.ownerId, user.sub))
      .orderBy(desc(workspaces.updatedAt));

    const projects = userWorkspaces.map((s: any) => ({
      id: s.id,
      name: s.name || "Untitled Project",
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
  const { name } = await c.req.json();

  try {
    const [newWorkspace] = await db
      .insert(workspaces)
      .values({
        ownerId: user.sub,
        name: name || "New Project",
      })
      .returning();

    return c.json(
      {
        project: {
          id: newWorkspace.id,
          name: newWorkspace.name,
          created_at: newWorkspace.createdAt,
          updated_at: newWorkspace.updatedAt,
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
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, projectId));
    if (!workspace || workspace.ownerId !== user.sub) {
      return c.json({ error: "Project not found" }, 404);
    }

    const projectMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.workspaceId, projectId))
      .orderBy(asc(messages.createdAt));

    return c.json({
      project: {
        id: workspace.id,
        name: workspace.name,
        created_at: workspace.createdAt,
        updated_at: workspace.updatedAt,
      },
      messages: projectMessages.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        toolInvocations: m.toolCalls ? (m.toolCalls as any[]).map(tc => ({
          state: 'result',
          toolCallId: tc.id,
          toolName: tc.function.name,
          args: JSON.parse(tc.function.arguments),
          result: { success: true }
        })) : undefined
      })),
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
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, projectId));
    if (!workspace || workspace.ownerId !== user.sub) {
      return c.json({ error: "Project not found" }, 404);
    }

    let [canvas] = await db
      .select()
      .from(canvases)
      .where(eq(canvases.workspaceId, projectId));

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
          workspaceId: projectId,
          name: "Main Canvas",
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

    // We fetch blocks from `nodes` and `edges` tables.
    const canvasNodes = await db.select().from(nodes).where(eq(nodes.canvasId, canvas.id));
    const canvasEdges = await db.select().from(edges).where(eq(edges.canvasId, canvas.id));

    const document = {
      nodes: canvasNodes.map((n: any) => ({
        id: n.id,
        type: n.type,
        position: { x: n.positionX, y: n.positionY },
        data: n.data,
      })),
      edges: canvasEdges.map((e: any) => ({
        id: e.id,
        source: e.sourceId,
        target: e.targetId,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        data: e.data,
      })),
      viewport: { x: 0, y: 0, zoom: 1 }, // we removed viewport from schema for simplicity or just provide default
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
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, projectId));
    if (!workspace || workspace.ownerId !== user.sub) {
      return c.json({ error: "Project not found" }, 404);
    }

    const [canvas] = await db
      .select()
      .from(canvases)
      .where(eq(canvases.workspaceId, projectId));
    if (!canvas) {
      return c.json({ error: "Canvas not found" }, 404);
    }

    // Since we are overriding the document for now we can just clear and re-insert nodes/edges
    // A better approach would be to upsert
    await db.delete(nodes).where(eq(nodes.canvasId, canvas.id));
    await db.delete(edges).where(eq(edges.canvasId, canvas.id));

    if (document.nodes && document.nodes.length > 0) {
      await db.insert(nodes).values(
        document.nodes.map((n: any) => ({
          id: n.id,
          canvasId: canvas.id,
          type: n.type,
          positionX: n.position.x,
          positionY: n.position.y,
          data: n.data || {},
        }))
      );
    }

    if (document.edges && document.edges.length > 0) {
      await db.insert(edges).values(
        document.edges.map((e: any) => ({
          id: e.id,
          canvasId: canvas.id,
          sourceId: e.source,
          targetId: e.target,
          sourceHandle: e.sourceHandle || null,
          targetHandle: e.targetHandle || null,
          data: e.data || {},
        }))
      );
    }

    const [updatedCanvas] = await db
      .update(canvases)
      .set({ updatedAt: new Date() })
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

projectsRouter.post("/:id/execute", async (c) => {
  const db = c.get("db") as any;
  const user = c.get("user") as any;
  const projectId = c.req.param("id");
  const { document, triggerData } = await c.req.json();

  if (!projectId || !document) {
    return c.json({ error: "Project ID and document are required" }, 400);
  }

  // 1. Verify ownership
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, projectId));
    
  if (!workspace || workspace.ownerId !== user.sub) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  // 2. Compile to Mastra Workflow
  const { compileGraphToWorkflow } = await import('@iem/agents');
  const workflow = compileGraphToWorkflow(document);

  // 3. Execute via Mastra
  try {
    const { runId, results } = await workflow.execute({ triggerData } as any);
    return c.json({ success: true, runId, results }, 200);
  } catch (error) {
    console.error("Workflow execution failed:", error);
    return c.json({ error: "Workflow execution failed" }, 500);
  }
});

projectsRouter.delete("/:id", async (c) => {
  const db = c.get("db") as any;
  const projectId = c.req.param("id");

  try {
    await db.delete(workspaces).where(eq(workspaces.id, projectId));
    return c.json({ success: true }, 200);
  } catch (error) {
    console.error("Delete project error:", error);
    return c.json({ error: "Failed to delete project" }, 500);
  }
});

export { projectsRouter };