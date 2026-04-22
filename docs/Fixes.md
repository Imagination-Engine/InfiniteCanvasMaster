# Implementation Fixes: Project Dashboard & Creation Flow

Tracking the tasks required to align the application with the intended user experience.

## 1. Dashboard Enhancements

- [ ] **Empty State Branding:** Replace the text-only empty state with a placeholder graphic and the "Create with your imagination" call-to-action.
- [ ] **Search & Filter:** Implement a functional search bar and project filtering logic on the `ProjectsPage`.
- [ ] **Create Project Modal:**
  - [ ] Replace inline input with a "Create Project" button.
  - [ ] Implement a Modal to capture Project Name and "Story" (preliminary prompt).

## 2. Backend API Updates

- [ ] **Project Creation Context:** Update `POST /api/projects` to accept the `story` parameter.
- [ ] **Initial AI Seeding:** Automatically insert the "Story" as the first message in the `messages` table for the new session to initialize the AI's context.

## 3. Seamless Navigation & UI Integration

- [ ] **Auto-Redirect:** Navigate the user directly to the Canvas view immediately after project creation.
- [ ] **Floating Chat Interface:** Refactor `ProjectCanvasPage.tsx` to include the `ChatShell` as a z-indexed floating component over the Canvas.
- [ ] **Goal Deconstruction:** Ensure the AI agent performs its initial goal deconstruction based on the captured story upon first Canvas load.
