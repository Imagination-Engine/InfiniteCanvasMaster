export interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
}

export interface ITool {
    name: string;
    description: string;
    requires_network: boolean;
    execute(args: any, context?: any): Promise<ToolResult>;
}
