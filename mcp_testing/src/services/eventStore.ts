import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import { AppEvent, EventType } from '../types';

export class EventStore {
    static append(type: EventType, payload: any, run_id?: string): AppEvent {
        const event: AppEvent = {
            id: uuidv4(),
            run_id,
            type,
            payload,
            created_at: new Date().toISOString()
        };

        const stmt = db.prepare(`
            INSERT INTO events (id, run_id, type, payload, created_at)
            VALUES (?, ?, ?, ?, ?)
        `);

        stmt.run(event.id, event.run_id || null, event.type, JSON.stringify(event.payload), event.created_at);
        
        // Trigger projection synchronously
        this.project(event);

        return event;
    }

    private static project(event: AppEvent) {
        switch (event.type) {
            case EventType.WORKSPACE_CONFIG_UPDATED:
                db.prepare(`
                    UPDATE workspaces SET config = ? WHERE id = ?
                `).run(JSON.stringify(event.payload.config), event.payload.id);
                break;

            case EventType.TASK_CREATED:
                db.prepare(`
                    INSERT INTO tasks (id, workspace_id, name, description, created_at)
                    VALUES (?, ?, ?, ?, ?)
                `).run(event.payload.id, event.payload.workspace_id, event.payload.name, event.payload.description, event.created_at);
                break;

            case EventType.RUN_STARTED:
            case EventType.RUN_RESUMED:
                if (event.type === EventType.RUN_STARTED) {
                    db.prepare(`
                        INSERT INTO runs (id, task_id, status, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?)
                    `).run(event.payload.id, event.payload.task_id, 'running', event.created_at, event.created_at);
                } else {
                    db.prepare(`
                        UPDATE runs SET status = ?, updated_at = ? WHERE id = ?
                    `).run('running', event.created_at, event.payload.id);
                }
                break;

            case EventType.STEP_STARTED:
                db.prepare(`
                    INSERT INTO steps (id, run_id, name, status, tool_name, tool_args, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    event.payload.id, 
                    event.payload.run_id, 
                    event.payload.name, 
                    'running', 
                    event.payload.tool_name || null, 
                    event.payload.tool_args ? JSON.stringify(event.payload.tool_args) : null,
                    event.created_at, 
                    event.created_at
                );
                break;

            case EventType.RUN_COMPLETED:
                db.prepare(`
                    UPDATE runs SET status = ?, updated_at = ? WHERE id = ?
                `).run(event.payload.status, event.created_at, event.payload.id);
                break;

            case EventType.STEP_COMPLETED:
                db.prepare(`
                    UPDATE steps SET status = ?, output = ?, updated_at = ? WHERE id = ?
                `).run(event.payload.status, event.payload.output, event.created_at, event.payload.id);
                break;
        }
    }

    static getByRunId(run_id: string): AppEvent[] {
        const rows = db.prepare('SELECT * FROM events WHERE run_id = ? ORDER BY created_at ASC').all(run_id) as any[];
        return rows.map(row => ({
            ...row,
            payload: JSON.parse(row.payload)
        }));
    }
}
