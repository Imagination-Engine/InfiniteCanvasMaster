import os
import re

def fix_files(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.ts') and not file.endswith('.test.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()

                changed = False

                # Fix AgentRuntime.chat calls
                if 'agentRuntime.chat({' in content and 'model:' not in content:
                    content = re.sub(
                        r'agentRuntime\.chat\(\{',
                        r'agentRuntime.chat({\n        model: "gemini-2.5-pro",',
                        content
                    )
                    changed = True

                # Fix missing views in BlockDefinition
                if 'mode: "triggered"' in content and 'view:' not in content:
                    content = re.sub(
                        r'mode:\s*([\'"])triggered\1\s*,',
                        r'mode: \1triggered\1,\n  view: (() => null) as any,',
                        content
                    )
                    changed = True
                    
                if 'mode: \'triggered\'' in content and 'view:' not in content:
                    content = re.sub(
                        r'mode:\s*\'triggered\'\s*,',
                        r'mode: \'triggered\',\n  view: (() => null) as any,',
                        content
                    )
                    changed = True

                # Fix import type { BlockDefinition }
                if 'import { BlockDefinition' in content and 'import type' not in content:
                    content = content.replace('import { BlockDefinition', 'import type { BlockDefinition')
                    changed = True
                    
                if 'import { BlockDefinition, MCPToolBinding }' in content:
                    content = content.replace('import { BlockDefinition, MCPToolBinding }', 'import type { BlockDefinition, MCPToolBinding }')
                    changed = True

                # Fix input.property TS errors
                if 'invoke: async (input) =>' in content or 'invoke: async (input: any) =>' in content:
                    pass
                else:
                    content = content.replace('invoke: async (input) =>', 'invoke: async (input: any) =>')
                    changed = True

                if changed:
                    with open(filepath, 'w') as f:
                        f.write(content)

fix_files('packages/surface-atlas')
fix_files('packages/surface-conductor')
fix_files('packages/surface-forge')
fix_files('packages/surface-reel')
fix_files('packages/surface-scribe')
