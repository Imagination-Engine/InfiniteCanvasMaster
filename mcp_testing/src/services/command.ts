import { v4 as uuidv4 } from 'uuid';
import { EventStore } from './eventStore';
import { EventType } from '../types';
import { AgentEngine } from '../engine/agent';

export class CommandService {
    static createTask(workspace_id: string, name: string, description: string) {
        const id = uuidv4();
        EventStore.append(EventType.TASK_CREATED, { id, workspace_id, name, description });
        return id;
    }

    static updateWorkspaceConfig(id: string, config: any) {
        EventStore.append(EventType.WORKSPACE_CONFIG_UPDATED, { id, config });
    }

    static startRun(task_id: string) {
        const id = uuidv4();
        EventStore.append(EventType.RUN_STARTED, { id, task_id }, id);
        
        // Trigger execution loop asynchronously
        AgentEngine.executeRun(id).catch(err => console.error(`Error in execution loop for ${id}:`, err));
        
        return id;
    }

    static resumeRun(run_id: string, feedback?: string) {
        EventStore.append(EventType.RUN_RESUMED, { id: run_id, feedback }, run_id);
        
        // Re-trigger execution loop asynchronously
        AgentEngine.executeRun(run_id).catch(err => console.error(`Error in execution loop for ${run_id}:`, err));
    }

    static startStep(run_id: string, name: string, tool_name?: string, tool_args?: any) {
        const id = uuidv4();
        EventStore.append(EventType.STEP_STARTED, { id, run_id, name, tool_name, tool_args }, run_id);
        return id;
    }

    static completeStep(step_id: string, run_id: string, status: 'completed' | 'failed' | 'waiting_for_human', output?: string) {
        EventStore.append(EventType.STEP_COMPLETED, { id: step_id, status, output }, run_id);
    }

    static updateRunStatus(run_id: string, status: 'pending' | 'running' | 'completed' | 'failed' | 'waiting_for_human') {
        // We can reuse RUN_COMPLETED or create a general RUN_UPDATED, but for now RUN_COMPLETED logic 
        // in eventStore projects any status passed in the payload.
        EventStore.append(EventType.RUN_COMPLETED, { id: run_id, status }, run_id);
    }

    static completeRun(run_id: string, status: 'completed' | 'failed') {
        EventStore.append(EventType.RUN_COMPLETED, { id: run_id, status }, run_id);
    }
}
