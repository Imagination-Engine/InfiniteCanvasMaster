import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { CommandService } from './services/command';
import { QueryService } from './services/query';
import { EventStore } from './services/eventStore';
import { LLMService } from './llm';
import db from './db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import path from 'path';

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/workspace_files', express.static(path.join(process.cwd(), 'workspace_files')));

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// -- Auth Middleware --
const requireAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing authorization header' });
    
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Invalid token format' });

    try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// -- Auth Endpoints --
app.post('/api/auth/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) return res.status(400).json({ error: 'Username already taken' });

    const id = uuidv4();
    const hash = bcrypt.hashSync(password, 10);
    
    db.prepare('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)').run(id, username, hash);
    
    const accessToken = jwt.sign({ id, username }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    db.prepare('INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, datetime(\'now\', \'+7 days\'))')
      .run(uuidv4(), id, refreshToken);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ accessToken, user: { id, username } });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = crypto.randomBytes(40).toString('hex');

    db.prepare('INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, datetime(\'now\', \'+7 days\'))')
      .run(uuidv4(), user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ accessToken, user: { id: user.id, username: user.username } });
});

app.post('/api/auth/refresh', (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

    const session = db.prepare(`
        SELECT s.*, u.username FROM sessions s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.token = ? AND s.expires_at > datetime('now')
    `).get(refreshToken) as any;

    if (!session) {
        res.clearCookie('refreshToken');
        return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const accessToken = jwt.sign({ id: session.user_id, username: session.username }, JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken, user: { id: session.user_id, username: session.username } });
});

app.post('/api/auth/logout', requireAuth, (req: any, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
        db.prepare('DELETE FROM sessions WHERE token = ?').run(refreshToken);
        res.clearCookie('refreshToken');
    }
    res.json({ success: true });
});

// Ensure at least one workspace exists for testing
const initWorkspace = () => {
    const existing = db.prepare('SELECT id FROM workspaces LIMIT 1').get();
    if (!existing) {
        const id = uuidv4();
        db.prepare('INSERT INTO workspaces (id, name) VALUES (?, ?)').run(id, 'Default Workspace');
        console.log(`Created default workspace: ${id}`);
    }
};
initWorkspace();

// GET /api/settings/llm
app.get('/api/settings/llm', requireAuth, (req: any, res) => {
    let workspace = db.prepare('SELECT id, config FROM workspaces WHERE user_id = ? LIMIT 1').get(req.user.id) as any;
    if (!workspace) {
        const wsId = uuidv4();
        db.prepare('INSERT INTO workspaces (id, user_id, name) VALUES (?, ?, ?)').run(wsId, req.user.id, 'My Workspace');
        return res.json({});
    }
    res.json(workspace.config ? JSON.parse(workspace.config) : {});
});

// PUT /api/settings/llm
app.put('/api/settings/llm', requireAuth, (req: any, res) => {
    let workspace = db.prepare('SELECT id FROM workspaces WHERE user_id = ? LIMIT 1').get(req.user.id) as any;
    if (!workspace) {
        const wsId = uuidv4();
        db.prepare('INSERT INTO workspaces (id, user_id, name) VALUES (?, ?, ?)').run(wsId, req.user.id, 'My Workspace');
        workspace = { id: wsId };
    }
    const { provider, model, apiKey, baseUrl } = req.body;
    if (!provider || !model) {
        return res.status(400).json({ error: 'provider and model are required' });
    }
    CommandService.updateWorkspaceConfig(workspace.id, { provider, model, apiKey, baseUrl });
    res.json({ message: 'Settings updated' });
});

// GET /api/projects
app.get('/api/projects', requireAuth, (req: any, res) => {
    const tasks = db.prepare('SELECT id, name, description, created_at as updated_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json({ projects: tasks });
});

// GET /api/projects/:id
app.get('/api/projects/:id', requireAuth, (req: any, res) => {
    const task = db.prepare('SELECT id, name, description, created_at as updated_at FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!task) return res.status(404).json({ error: 'Project not found' });
    res.json({ project: task });
});

// POST /api/projects
app.post('/api/projects', requireAuth, (req: any, res) => {
    let workspace = db.prepare('SELECT id FROM workspaces WHERE user_id = ? LIMIT 1').get(req.user.id) as any;
    if (!workspace) {
        const wsId = uuidv4();
        db.prepare('INSERT INTO workspaces (id, user_id, name) VALUES (?, ?, ?)').run(wsId, req.user.id, 'My Workspace');
        workspace = { id: wsId };
    }

    const { name } = req.body;
    const id = uuidv4();
    db.prepare('INSERT INTO tasks (id, workspace_id, user_id, name, description) VALUES (?, ?, ?, ?, ?)')
      .run(id, workspace.id, req.user.id, name, 'Waiting for initial prompt...');
    
    res.status(201).json({ project: { id, name } });
});

// POST /api/projects/:id/run
app.post('/api/projects/:id/run', requireAuth, (req: any, res) => {
    const { prompt } = req.body;
    const taskId = req.params.id;

    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(taskId, req.user.id) as any;
    if (!task) return res.status(404).json({ error: 'Project not found' });

    // Update the task description to be the current prompt so the agent uses it as the "Task"
    db.prepare('UPDATE tasks SET description = ? WHERE id = ?').run(prompt, taskId);

    const runId = CommandService.startRun(taskId);
    res.status(201).json({ runId });
});

// DELETE /api/projects/:id
app.delete('/api/projects/:id', requireAuth, (req: any, res) => {
    const task = db.prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!task) return res.status(404).json({ error: 'Project not found' });

    // Find all runs to delete their steps and events
    const runs = db.prepare('SELECT id FROM runs WHERE task_id = ?').all(req.params.id) as any[];
    runs.forEach(run => {
        db.prepare('DELETE FROM steps WHERE run_id = ?').run(run.id);
        db.prepare('DELETE FROM events WHERE run_id = ?').run(run.id);
    });

    db.prepare('DELETE FROM runs WHERE task_id = ?').run(req.params.id);
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);

    res.status(204).send();
});
app.get('/tasks', requireAuth, (req: any, res) => {
    const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(tasks);
});

// GET /runs
app.get('/runs', requireAuth, (req: any, res) => {
    // Only get runs for this user's tasks
    const runs = db.prepare(`
        SELECT r.* FROM runs r
        JOIN tasks t ON r.task_id = t.id
        WHERE t.user_id = ?
        ORDER BY r.created_at DESC
    `).all(req.user.id);

    const runsWithSteps = runs.map((run: any) => {
        const steps = db.prepare('SELECT * FROM steps WHERE run_id = ? ORDER BY created_at ASC').all(run.id);
        const stepsWithParsedArgs = steps.map((step: any) => ({
            ...step,
            tool_args: step.tool_args ? JSON.parse(step.tool_args) : null
        }));
        return { ...run, steps: stepsWithParsedArgs };
    });
    res.json(runsWithSteps);
});

// POST /tasks
app.post('/tasks', requireAuth, (req: any, res) => {
    // Get user's default workspace or create one
    let workspace = db.prepare('SELECT id FROM workspaces WHERE user_id = ? LIMIT 1').get(req.user.id) as any;
    if (!workspace) {
        const wsId = uuidv4();
        db.prepare('INSERT INTO workspaces (id, user_id, name) VALUES (?, ?, ?)').run(wsId, req.user.id, 'My Workspace');
        workspace = { id: wsId };
    }

    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'name is required' });
    }
    
    // CommandService currently doesn't take user_id, we will do the insert here for now or update it later.
    const id = uuidv4();
    db.prepare('INSERT INTO tasks (id, workspace_id, user_id, name, description) VALUES (?, ?, ?, ?, ?)')
      .run(id, workspace.id, req.user.id, name, description || '');
    
    res.status(201).json({ id });
});

// POST /runs
app.post('/runs', requireAuth, (req: any, res) => {
    const { task_id } = req.body;
    if (!task_id) {
        return res.status(400).json({ error: 'task_id is required' });
    }
    
    // Verify task belongs to user
    const task = db.prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?').get(task_id, req.user.id);
    if (!task) return res.status(403).json({ error: 'Unauthorized' });

    const id = CommandService.startRun(task_id);
    res.status(201).json({ id });
});

// POST /steps
app.post('/steps', requireAuth, (req: any, res) => {
    const { run_id, name } = req.body;
    if (!run_id || !name) {
        return res.status(400).json({ error: 'run_id and name are required' });
    }
    const id = CommandService.startStep(run_id, name);
    res.status(201).json({ id });
});

// GET /runs/:id
app.get('/runs/:id', requireAuth, (req: any, res) => {
    const run = QueryService.getRunDetails(req.params.id);
    if (!run) {
        return res.status(404).json({ error: 'Run not found' });
    }
    res.json(run);
});

// POST /api/runs/:id/resume
app.post('/api/runs/:id/resume', requireAuth, (req: any, res) => {
    const run = QueryService.getRun(req.params.id);
    if (!run) return res.status(404).json({ error: 'Run not found' });
    const { feedback } = req.body;
    CommandService.resumeRun(req.params.id, feedback);
    res.json({ message: 'Run resumed' });
});

// POST /api/runs/:id/reject
app.post('/api/runs/:id/reject', requireAuth, (req: any, res) => {
    const run = QueryService.getRun(req.params.id);
    if (!run) return res.status(404).json({ error: 'Run not found' });
    CommandService.updateRunStatus(req.params.id, 'failed');
    res.json({ message: 'Run rejected' });
});

// GET /events/:run_id
app.get('/events/:run_id', requireAuth, (req: any, res) => {
    const events = EventStore.getByRunId(req.params.run_id);
    res.json(events);
});

// PUT /workspaces/:id/config
app.put('/workspaces/:id/config', requireAuth, (req: any, res) => {
    const { provider, model, apiKey, baseUrl } = req.body;
    if (!provider || !model) {
        return res.status(400).json({ error: 'provider and model are required' });
    }
    CommandService.updateWorkspaceConfig(req.params.id, { provider, model, apiKey, baseUrl });
    res.json({ message: 'Workspace config updated' });
});

// GET /workspaces/:id/config
app.get('/workspaces/:id/config', requireAuth, (req: any, res) => {
    const workspace = db.prepare('SELECT config FROM workspaces WHERE id = ?').get(req.params.id) as any;
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    res.json(workspace.config ? JSON.parse(workspace.config) : {});
});

// POST /workspaces/:id/test-llm
app.post('/workspaces/:id/test-llm', requireAuth, async (req: any, res) => {
    const { prompt } = req.body;
    try {
        const text = await LLMService.generateText(req.params.id, prompt || 'Hello, are you there?');
        res.json({ text });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
