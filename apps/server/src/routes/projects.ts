import { Hono } from "hono";
import { eq, desc, asc } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { workspaces, messages, canvases, nodes, edges } from "@iem/db";

const projectsRouter = new Hono();

import { authMiddleware } from "../middleware/auth.js";

projectsRouter.use("*", authMiddleware);

projectsRouter.get("/", async (c) => {
  const db = c.get("db") as any;
  const user = c.get("user") as any;

  try {
    const userWorkspaces = await db
      .select()
      .from(workspaces as any)
      .where(eq((workspaces as any).ownerId, user.sub))
      .orderBy(desc((workspaces as any).updatedAt));

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
      .insert(workspaces as any)
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
      .from(workspaces as any)
      .where(eq((workspaces as any).id, projectId));

    if (!workspace || workspace.ownerId !== user.sub) {
      return c.json({ error: "Project not found" }, 404);
    }

    let history: any[] = [];
    try {
      // @ts-ignore
      const { mastra } = await import("@iem/agents");
      // Safely fetch messages, falling back if storage is uninitialized or missing tables
      const { storage } = await import("@iem/agents");
      const fetchedHistory = await (storage as any)
        ?.getMessages({ threadId: projectId })
        .catch(() => []);
      history = fetchedHistory || [];
    } catch (mastraErr) {
      console.warn(
        "[PROJECTS] Mastra storage unavailable, defaulting to empty history.",
        mastraErr,
      );
    }

    return c.json({
      project: {
        id: workspace.id,
        name: workspace.name,
        created_at: workspace.createdAt,
        updated_at: workspace.updatedAt,
      },
      messages: history.map((m: any) => ({
        id: m.id,
        role: m.role,
        content:
          typeof m.content === "string" ? m.content : JSON.stringify(m.content),
        toolInvocations: m.toolCalls
          ? m.toolCalls.map((tc: any) => ({
              state: "result",
              toolCallId: tc.id,
              toolName: tc.function?.name || tc.toolName,
              args:
                typeof tc.function?.arguments === "string"
                  ? JSON.parse(tc.function.arguments)
                  : tc.args || {},
              result: { success: true },
            }))
          : undefined,
      })),
    });
  } catch (error: any) {
    console.error("Fetch project error:", error);
    return c.json({ error: error.message || "Failed to fetch project" }, 500);
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
      .from(workspaces as any)
      .where(eq((workspaces as any).id, projectId));
    if (!workspace || workspace.ownerId !== user.sub) {
      return c.json({ error: "Project not found" }, 404);
    }

    let [canvas] = await db
      .select()
      .from(canvases as any)
      .where(eq((canvases as any).workspaceId, projectId));

    // Create an empty canvas if it doesn't exist
    if (!canvas) {
      const defaultDoc = {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      };
      [canvas] = await db
        .insert(canvases as any)
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
    const canvasNodes = await db
      .select()
      .from(nodes as any)
      .where(eq((nodes as any).canvasId, canvas.id));
    const canvasEdges = await db
      .select()
      .from(edges as any)
      .where(eq((edges as any).canvasId, canvas.id));

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
      .from(workspaces as any)
      .where(eq((workspaces as any).id, projectId));
    if (!workspace || workspace.ownerId !== user.sub) {
      return c.json({ error: "Project not found" }, 404);
    }

    const [canvas] = await db
      .select()
      .from(canvases as any)
      .where(eq((canvases as any).workspaceId, projectId));
    if (!canvas) {
      return c.json({ error: "Canvas not found" }, 404);
    }

    // Since we are overriding the document for now we can just clear and re-insert nodes/edges
    // A better approach would be to upsert
    await db.delete(nodes as any).where(eq((nodes as any).canvasId, canvas.id));
    await db.delete(edges as any).where(eq((edges as any).canvasId, canvas.id));

    if (document.nodes && document.nodes.length > 0) {
      await db.insert(nodes as any).values(
        document.nodes.map((n: any) => ({
          id: n.id,
          canvasId: canvas.id,
          type: n.type,
          positionX: n.position.x,
          positionY: n.position.y,
          data: n.data || {},
        })),
      );
    }

    if (document.edges && document.edges.length > 0) {
      await db.insert(edges as any).values(
        document.edges.map((e: any) => ({
          id: e.id,
          canvasId: canvas.id,
          sourceId: e.source,
          targetId: e.target,
          sourceHandle: e.sourceHandle || null,
          targetHandle: e.targetHandle || null,
          data: e.data || {},
        })),
      );
    }

    const [updatedCanvas] = await db
      .update(canvases as any)
      .set({ updatedAt: new Date() })
      .where(eq((canvases as any).id, canvas.id))
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
    .from(workspaces as any)
    .where(eq((workspaces as any).id, projectId));

  if (!workspace || workspace.ownerId !== user.sub) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  // Ensure semantic blocks are registered (idempotent, helps in dev/hot-reload scenarios)
  try {
    const { initializeBlockRegistry } = await import("../registry-init.js");
    initializeBlockRegistry();
  } catch {
    // non-fatal
  }

  // Debug: confirm key blocks exist in registry during dev
  try {
    // @ts-ignore
    const { blockRegistry } = await import("@iem/core");
    console.log(
      "[EXECUTE] registry has iem.conductor.saas:",
      !!blockRegistry.get("iem.conductor.saas"),
    );
    console.log(
      "[EXECUTE] registry has iem.conductor.router:",
      !!blockRegistry.get("iem.conductor.router"),
    );
    console.log(
      "[EXECUTE] registry has iem.core.formatter:",
      !!blockRegistry.get("iem.core.formatter"),
    );
  } catch {}

  // 2. Compile to Mastra Workflow
  // @ts-ignore
  const { compileGraphToWorkflow, mastra } = await import("@iem/agents");
  const workflow = compileGraphToWorkflow(document, { mastra });

  // 3. Execute via Mastra (Run API)
  try {
    const run = await workflow.createRun({ disableScorers: true });
    const result = await run.start({
      inputData: { triggerData } as any,
    });

    return c.json(
      {
        success: result.status === "success",
        runId: run.runId,
        results: result.status === "success" ? result.result : undefined,
        steps: result.steps,
        error: result.status === "failed" ? result.error : undefined,
      },
      result.status === "success" ? 200 : 500,
    );
  } catch (error) {
    console.error("Workflow execution failed:", error);
    return c.json({ error: "Workflow execution failed" }, 500);
  }
});

projectsRouter.delete("/:id", async (c) => {
  const db = c.get("db") as any;
  const user = c.get("user") as any;
  const projectId = c.req.param("id");

  try {
    // 1. Verify ownership
    const [workspace] = await db
      .select()
      .from(workspaces as any)
      .where(eq((workspaces as any).id, projectId));

    if (!workspace || workspace.ownerId !== user.sub) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    await db
      .delete(workspaces as any)
      .where(eq((workspaces as any).id, projectId));
    return c.json({ success: true }, 200);
  } catch (error) {
    console.error("Delete project error:", error);
    return c.json({ error: "Failed to delete project" }, 500);
  }
});

export { projectsRouter };
