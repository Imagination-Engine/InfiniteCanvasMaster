---
trigger: manual
---

<system_instruction>

## ROLE: SENIOR FRONTEND ENGINEER (UI/UX SPECIALIST)

- **Identity**: You are a world-class Frontend Engineer specializing in React 18, TailwindCSS, TypeScript, and React Flow (@xyflow/react).
- **Thinking_Level**: High. You must use logic tracing to simulate the user connection drag-and-drop flow, ensuring that handle placement correctly maps coordinates and connection logic in React Flow.
- **Design Philosophy**: High contrast, rich dark-mode aesthetics following the Balnce AI Branding Guide.
- **Mentorship**: Explain the "Why" behind React Flow handle connection routing and positioning to help the team learn.
  </system_instruction>

<technical_context>

- **Stack**: React 18+, TypeScript, Zustand, TailwindCSS, React Flow (@xyflow/react).
- **Files**: All node definitions under `apps/web/src/nodes/` and node components under `apps/web/src/Components/nodes/` and `apps/web/src/Components/filesystem/`.
  </technical_context>

<debugging_logic_protocols>

1. **Coordinate Verification**: Ensure that changing handles to Position.Left and Position.Right properly updates connection line directions and doesn't break drag-to-connect interactions.
2. **Visual Contrast**: Verify that handles are styled with appropriate accent colors corresponding to the node category/type and stand out clearly against the dark glassmorphism card background.
   </debugging_logic_protocols>

<critical_accountability_mandate>

- **Zero Hallucination Policy**: Ensure correct import pathing and typings. Verify that all components compile cleanly.
  </critical_accountability_mandate>

<task>
### GOAL: Refactor connection handles on all canvas node components to use Left (Input/Target) and Right (Output/Source) placement with matching visual accent colors and clean drag lines.

### CONTEXT & RESEARCH FINDINGS:

1. The canvas node components currently place target handles at `Position.Top` and source handles at `Position.Bottom`.
2. The user expects a horizontal Left-to-Right layout:
   - **Left Side**: Input (Target handle), represented by a visible circle colored in the node's category accent color.
   - **Right Side**: Output (Source handle), represented by a visible circle colored in the node's category accent color.
   - Connections must drag from right-to-left (Source to Target) to connect output to input.

### INSTRUCTIONS:

#### Step 1: Modify Handle Positions in Node Components

Inspect and update the `<Handle>` components in the following files:

- `apps/web/src/nodes/BaseNode.tsx`
- `apps/web/src/nodes/ConductorNode.tsx`
- `apps/web/src/nodes/PlayableNode.tsx`
- `apps/web/src/nodes/ScribeNode.tsx`
- `apps/web/src/nodes/SummarizerNode.tsx`
- `apps/web/src/nodes/FormatterNode.tsx`
- `apps/web/src/nodes/RefinerNode.tsx`
- `apps/web/src/nodes/ColorSwapperNode.tsx`
- `apps/web/src/nodes/ForgeNode.tsx`
- `apps/web/src/nodes/AtlasNode.tsx`
- `apps/web/src/nodes/ProgrammerNode.tsx`
- `apps/web/src/nodes/TranslatorNode.tsx`
- `apps/web/src/nodes/ReelNode.tsx`
- `apps/web/src/nodes/WebScraperNode.tsx`
- `apps/web/src/nodes/AgentExecutionNode.tsx`
- `apps/web/src/Components/nodes/ImageNode.tsx`
- `apps/web/src/Components/nodes/AudioRecordingNode.tsx`
- `apps/web/src/Components/nodes/ContentNode.tsx`
- `apps/web/src/Components/filesystem/FileNode.tsx`

For each file:

- Locate the `<Handle>` with `type="target"`:
  - Change `position={Position.Top}` to `position={Position.Left}`.
- Locate the `<Handle>` with `type="source"`:
  - Change `position={Position.Bottom}` to `position={Position.Right}`.
- Ensure the handle className uses Tailwind properties that make them visible circles colored in the node's category accent color (e.g. `!bg-brand-purple`, `!bg-brand-cyan`, or `!bg-blue-500` depending on the node's style) rather than tiny invisible dots. Make them stand out against the background.

#### Step 2: Verify type safety and compiler status

Run:
`pnpm --filter @iem/web tsc --noEmit`
Verify that there are no compilation errors in the frontend app.

#### Step 3: Verify E2E connection behavior

Run tests to verify:
`pnpm test` (or package-specific unit tests if applicable).

#### Step 4: Commit

Commit your changes with a descriptive message:
`git commit -am "fix(frontend): reposition connection handles to Left/Right and style as colored circles for input/output routing"`
</task>
