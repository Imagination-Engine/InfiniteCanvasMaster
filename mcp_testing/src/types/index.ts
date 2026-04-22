export interface LLMConfig {
    provider: 'ollama' | 'openai' | 'gemini';
    model: string;
    apiKey?: string;
    baseUrl?: string;
}

export interface Workspace {
    id: string;
    name: string;
    config?: LLMConfig;
    created_at: string;
}

export interface Task {
    id: string;
    workspace_id: string;
    name: string;
    description: string;
    created_at: string;
}

export interface Run {
    id: string;
    task_id: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'waiting_for_human';
    created_at: string;
    updated_at: string;
}

export interface Step {
    id: string;
    run_id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'waiting_for_human';
    tool_name?: string;
    tool_args?: any;
    output?: string | undefined;
    created_at: string;
    updated_at: string;
}

export interface Artifact {
    id: string;
    run_id: string;
    step_id?: string | undefined;
    type: string;
    content_path: string;
    created_at: string;
}

export interface AppEvent {
    id: string;
    run_id?: string | undefined;
    type: string;
    payload: any;
    created_at: string;
}

export enum EventType {
    TASK_CREATED = 'TASK_CREATED',
    WORKSPACE_CONFIG_UPDATED = 'WORKSPACE_CONFIG_UPDATED',
    RUN_STARTED = 'RUN_STARTED',
    RUN_RESUMED = 'RUN_RESUMED',
    RUN_COMPLETED = 'RUN_COMPLETED',
    STEP_STARTED = 'STEP_STARTED',
    STEP_COMPLETED = 'STEP_COMPLETED',
    ARTIFACT_CREATED = 'ARTIFACT_CREATED'
}
