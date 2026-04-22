import { ITool } from './types';
import * as impl from './impl';

class ToolRegistry {
    private tools: Map<string, ITool> = new Map();

    constructor() {
        this.register(new impl.GenerateTextTool());
        this.register(new impl.RunCodeTool());
        this.register(new impl.FileSystemTool());
        this.register(new impl.HttpRequestTool());
        this.register(new impl.SearchWebTool());
        this.register(new impl.ParseDataTool());
        this.register(new impl.TransformDataTool());
        this.register(new impl.DatabaseQueryTool());
        this.register(new impl.ScheduleTaskTool());
        this.register(new impl.SendNotificationTool());
        this.register(new impl.ImageGenerationTool());
        this.register(new impl.ImageAnalysisTool());
    }

    register(tool: ITool) {
        this.tools.set(tool.name, tool);
    }

    getTool(name: string): ITool | undefined {
        return this.tools.get(name);
    }

    getAllTools(): ITool[] {
        return Array.from(this.tools.values());
    }
}

export const toolRegistry = new ToolRegistry();
