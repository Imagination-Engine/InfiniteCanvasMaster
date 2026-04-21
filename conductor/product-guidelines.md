# Product Guidelines

These guidelines dictate the UX, branding, and interaction principles for the Imagination Engine and its five surfaces. Adherence to these principles ensures the platform remains universally accessible to "everyday people."

## 1. Tone and Voice
- **Progressive Persona:** The system's tone should be **warm and guiding** during initial onboarding, acting as a patient mentor. As the user gains confidence and familiarity, the tone should organically evolve to become more **playful and creative**, leaning into the inspiring energy of a digital studio.
- **Cognitive Simplicity:** Use plain, everyday language. Strictly avoid technical jargon (e.g., do not use terms like "nodes," "JSON," or "MCP tools" in user-facing dialog).

## 2. Visual Aesthetic
- **Vibrant & Accessible:** The UI must feel friendly, engaging, and consumer-focused.
- **Design Language:** Utilize soft corners, colorful (but accessible) highlights, and clear visual hierarchies. The interface must intentionally avoid the intimidating, dense layout of traditional developer IDEs, favoring approachability.
- **Execution Minimalism & Transparency:** During standard workflow execution, prioritize an uncluttered interface, surfacing only final outputs or critical error states. However, for complex generative tasks (e.g., App Building in Forge), employ a dedicated, readable Build Log to transparently stream agent intentions, thoughts, and progress without overwhelming the primary canvas view.

## 3. Agentic Error Handling & UX
- **Transparent Intent:** Agents must proactively communicate their intentions to the user *before and while* attempting to build, optimize, or solve problems.
- **Graceful Exhaustion:** If an agent encounters an error, it should autonomously attempt workarounds. If no solutions are discovered after trying, it must inform the user honestly and conversationally, rather than displaying raw system errors or failing silently.

## 4. Accessibility Principles
Universal design is a strict requirement. The following principles are non-negotiable:
- **Screen-Reader & Keyboard First:** Complete navigability of both the Chat Shell and the Canvas via keyboard and semantic HTML/ARIA attributes.
- **Visual Contrast:** Strict adherence to high contrast ratios, colorblind-safe palettes, and clear visual boundaries to ensure legibility for all users.