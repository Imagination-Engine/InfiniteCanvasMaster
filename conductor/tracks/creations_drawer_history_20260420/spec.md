# Specification: Creations Drawer, History & Sidebar Navigation

## 1. Overview
This track builds the persistent navigation and organization layer for the Imagination Engine (Section 9 of the Master Plan). It introduces the Left Sidebar, which houses the Chat/Canvas History, the explicitly saved 'Creations' grid, and basic settings navigation.

## 2. Functional Requirements
### 2.1 Sidebar Structure
- **Persistent UI:** Implement a collapsible left sidebar present on all main routes post-login.
- **Top Actions:** Include prominent "New Chat" and "Toggle View (List/Grid)" actions.

### 2.2 History Section
- **Dual View Support:** Implement both a chronological List View and a masonry Grid View (thumbnails) for past sessions.
- **Client-Side Search:** Implement fast client-side filtering by title to search through recent history.
- **Indicators:** Display whether a session is "chat-only" or contains a "canvas" via visual indicators (e.g., dots or badges).

### 2.3 Creations Section & Artifact Routing
- **The Drawer:** A distinct section/tab displaying exclusively those sessions explicitly saved as "Creations".
- **Surface Routing Logic:** Implement the foundational router logic to handle surface-specific launches. When a creation is launched:
  - Playable (Game): Routes to a full-screen view.
  - Conductor (Workflow): Routes to a run-ready execution view.
  - Reel/Forge: Routes to their respective specialized modes.

### 2.4 Settings Section
- **Minimal Configuration:** Implement a basic settings view (Account info, preferred model toggle, logout).

## 3. Non-Functional Requirements
- **Performance:** Ensure smooth transitions when toggling between the History list and the Creations grid.
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow.

## 4. Out of Scope
- The actual implementation of the specific surface views (e.g., building the game engine itself); this track only builds the *routing* to those views.