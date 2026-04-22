import { CommandService } from '../services/command';
import { QueryService } from '../services/query';
import { toolRegistry } from '../tools/registry';
import { LLMService } from '../llm';
import { EventStore } from '../services/eventStore';
import db from '../db';
import * as fs from 'fs';

const debugLog = (msg: string) => {
    const timestamp = new Date().toISOString();
    fs.appendFileSync('agent_debug.log', `[${timestamp}] ${msg}\n`);
    console.log(msg);
};

export class AgentEngine {
    private static activeRuns = new Set<string>();

    static async executeRun(run_id: string) {
        if (this.activeRuns.has(run_id)) {
            debugLog(`[AgentEngine] Run ${run_id} is already active. Skipping duplicate loop.`);
            return;
        }

        this.activeRuns.add(run_id);
        debugLog(`[AgentEngine] STARTED loop for run: ${run_id}`);
        
        try {
            await this._innerLoop(run_id);
        } catch (err: any) {
            debugLog(`[AgentEngine] CRITICAL ERROR for run ${run_id}: ${err.message}`);
            CommandService.updateRunStatus(run_id, 'failed');
        } finally {
            this.activeRuns.delete(run_id);
            debugLog(`[AgentEngine] FINISHED loop for run: ${run_id}`);
        }
    }

    private static async _innerLoop(run_id: string): Promise<void> {
        let run = QueryService.getRun(run_id);
        if (!run) {
            debugLog(`[AgentEngine] Run ${run_id} not found.`);
            return;
        }

        if (run.status === 'completed' || run.status === 'failed' || run.status === 'waiting_for_human') {
            debugLog(`[AgentEngine] Run ${run_id} is in terminal or paused state: ${run.status}. Bailing.`);
            return;
        }

        const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(run.task_id) as any;
        if (!task) return;

        // 1. Planning Phase
        let steps = QueryService.getStepsForRun(run_id);
        const planningStep = steps.find(s => s.name === 'Planning');
        
        const events = EventStore.getByRunId(run_id);
        const lastResumedEvent = [...events].reverse().find(e => e.type === 'RUN_RESUMED');
        const feedback = lastResumedEvent?.payload?.feedback;

        if (steps.length === 0 || (planningStep?.status === 'waiting_for_human' && feedback)) {
            debugLog(`[AgentEngine] Generating plan${feedback ? ' with feedback' : ''}...`);
            const planStepId = planningStep?.id || CommandService.startStep(run_id, 'Planning');
            
            try {
                const availableTools = toolRegistry.getAllTools().map(t => ({
                    name: t.name,
                    description: t.description,
                    requires_network: t.requires_network
                }));

                let systemPrompt = `You are a professional task planner. Break down the user's task into logical steps.
Available tools:
${availableTools.map(t => `- ${t.name}: ${t.description} (Network: ${t.requires_network})`).join('\n')}

CRITICAL NOTES:
1. The "image_generation" tool AUTOMATICALLY saves the image to the local "workspace_files" directory. DO NOT add a follow-up step to download or save the image.
2. The "file_system" tool "write" action creates files in "workspace_files".
3. Use {{step_name}} with underscores to reference the output of a previous step.
4. MANDATORY: If the task requires generating code, text, or any final artifact, you MUST include a final step to save it to a file using the "file_system" tool with action "write". This allows the user to download it.

Task: "${task.name}"
Description: "${task.description}"`;

                if (feedback) {
                    systemPrompt += `\n\nUSER FEEDBACK: The user requested changes to the previous plan: "${feedback}". Adjust the plan accordingly.`;
                }

                systemPrompt += `\n\nOutput ONLY a JSON array of steps. No markdown. Each step MUST follow this exact schema:
[
  {
    "name": "A short, unique name for this step (e.g., 'Fetch_Data', 'Generate_Summary')",
    "tool": "The name of the tool to use (from the list above)",
    "args": { /* tool-specific arguments based on the tool's description */ }
  }
]`;

                const llmOutput = await LLMService.generateText(task.workspace_id, systemPrompt);
                const jsonMatch = llmOutput.match(/\[[\s\S]*\]/);
                const dynamicPlan = JSON.parse(jsonMatch ? jsonMatch[0] : llmOutput);

                CommandService.completeStep(planStepId, run_id, 'waiting_for_human', `Plan generated. Approve to execute:\n\n${JSON.stringify(dynamicPlan, null, 2)}`);
                CommandService.updateRunStatus(run_id, 'waiting_for_human');
                debugLog(`[AgentEngine] Plan generated and paused for approval.`);
                return;
            } catch (err: any) {
                CommandService.completeStep(planStepId, run_id, 'failed', `Planning failed: ${err.message}`);
                throw err;
            }
        }

        // 2. Execution Loop
        if (!planningStep || !planningStep.output) return;

        let dynamicPlan: any[] = [];
        try {
            const planText = planningStep.output;
            const jsonMatch = planText.match(/\[[\s\S]*\]/);
            dynamicPlan = JSON.parse(jsonMatch ? jsonMatch[0] : planText);
            dynamicPlan = [{ name: 'Planning', tool: 'none' }, ...dynamicPlan];
            dynamicPlan.push({ name: 'Final Review', tool: 'none' });
        } catch (err) {
            debugLog(`[AgentEngine] Failed to parse plan JSON: ${err}`);
            return;
        }

        for (let i = 0; i < dynamicPlan.length; i++) {
            const planStep = dynamicPlan[i];
            
            // Ensure planStep has a valid name to prevent DB NOT NULL constraints
            if (!planStep.name) {
                planStep.name = `Step_${i}_${planStep.tool || 'unknown'}`;
            }

            steps = QueryService.getStepsForRun(run_id);
            const existingStep = steps.find(s => s.name === planStep.name);
            
            if (existingStep?.status === 'completed') continue;

            debugLog(`[AgentEngine] Processing step: ${planStep.name}`);

            if (planStep.name === 'Planning' && existingStep?.status === 'waiting_for_human') {
                CommandService.completeStep(existingStep.id, run_id, 'completed', existingStep.output || '');
                continue;
            }

            if (planStep.name === 'Final Review') {
                if (existingStep?.status === 'waiting_for_human') {
                    if (feedback) {
                        debugLog(`[AgentEngine] Feedback received on Final Review. Restarting with new instructions.`);
                        CommandService.updateRunStatus(run_id, 'running');
                        // Reset Planning to trigger re-plan at top
                        CommandService.completeStep(planningStep.id, run_id, 'waiting_for_human', planningStep.output);
                        return this._innerLoop(run_id);
                    } else {
                        debugLog(`[AgentEngine] Final Review approved. Run complete.`);
                        CommandService.completeStep(existingStep.id, run_id, 'completed', 'User approved the final result.');
                        CommandService.completeRun(run_id, 'completed');
                        return;
                    }
                } else {
                    const reviewId = CommandService.startStep(run_id, 'Final Review', 'none', {});
                    CommandService.completeStep(reviewId, run_id, 'waiting_for_human', 'Workflow complete. Please review all artifacts above. Approve to finish, or provide feedback to request changes.');
                    CommandService.updateRunStatus(run_id, 'waiting_for_human');
                    return;
                }
            }

            const stepId = (existingStep && existingStep.status === 'waiting_for_human') 
                ? existingStep.id 
                : CommandService.startStep(run_id, planStep.name, planStep.tool, planStep.args);

            const tool = toolRegistry.getTool(planStep.tool);
            if (!tool) {
                if (planStep.tool !== 'none') {
                    CommandService.completeStep(stepId, run_id, 'failed', `Tool not found: ${planStep.tool}`);
                    return;
                }
                continue;
            }

            // Safety Check: Network Approval
            const isAutoApproved = planStep.tool === 'generate_text' || planStep.tool === 'none';
            if (tool.requires_network && !isAutoApproved && (!existingStep || existingStep.status !== 'waiting_for_human')) {
                debugLog(`[AgentEngine] Pausing for network tool approval: ${tool.name}`);
                CommandService.completeStep(stepId, run_id, 'waiting_for_human', `Network access required for ${tool.name}. Approve to proceed.`);
                CommandService.updateRunStatus(run_id, 'waiting_for_human');
                return;
            }

            // Variable Substitution
            const context: Record<string, string> = {};
            steps.filter(s => s.status === 'completed' && s.output).forEach(s => {
                const key = s.name.toLowerCase().trim().replace(/\s+/g, '_');
                context[key] = s.output!;
                context[key.replace(/_/g, '')] = s.output!;
            });

            let substitutedArgs = JSON.stringify(planStep.args);
            substitutedArgs = substitutedArgs.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
                const normalized = key.trim().toLowerCase().replace(/\s+/g, '_');
                const val = context[normalized] || context[normalized.replace(/_/g, '')];
                return val ? val.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') : match;
            });

            try {
                const args = { ...JSON.parse(substitutedArgs), workspace_id: task.workspace_id };
                debugLog(`[AgentEngine] Executing tool: ${tool.name}`);
                const result = await tool.execute(args);
                
                if (result.success) {
                    const output = typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2);
                    CommandService.completeStep(stepId, run_id, 'completed', output);
                    debugLog(`[AgentEngine] Step ${planStep.name} COMPLETED.`);
                } else {
                    CommandService.completeStep(stepId, run_id, 'failed', result.error);
                    CommandService.completeRun(run_id, 'failed');
                    return;
                }
            } catch (err: any) {
                CommandService.completeStep(stepId, run_id, 'failed', err.message);
                throw err;
            }
        }

        debugLog(`[AgentEngine] All steps finished. Run ${run_id} COMPLETED.`);
        CommandService.completeRun(run_id, 'completed');
    }
}
