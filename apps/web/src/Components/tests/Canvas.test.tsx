import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Canvas from "../Canvas";

// Mock Tldraw to avoid full canvas rendering in unit tests,
// we just want to ensure our wrapper initializes correctly.
vi.mock("tldraw", () => ({
  Tldraw: ({ store }: any) => (
    <div data-testid="tldraw-mock" data-store-id={store?.id}>
      Tldraw Mock
    </div>
  ),
  createTLStore: () => ({
    id: "mock-store-id",
    listen: vi.fn(() => vi.fn()),
    put: vi.fn(),
  }),
  defaultShapeUtils: [],
  createShapeId: vi.fn(),
  ShapeUtil: class MockShapeUtil {
    static type = "mock";
  },
  HTMLContainer: ({ children, id }: any) => (
    <div data-testid={`html-container-${id}`}>{children}</div>
  ),
}));

// Mock Router and Auth
vi.mock("react-router-dom", () => ({
  useParams: () => ({ projectId: "test-project-id" }),
}));

vi.mock("../../auth/AuthContext", () => ({
  useAuth: () => ({ accessToken: "test-token" }),
}));

// Mock IntentcastingBar
vi.mock("../IntentcastingBar", () => ({
  default: ({ isLoading }: any) => (
    <div data-testid="intentcasting-bar" data-loading={isLoading}>
      IntentcastingBar
    </div>
  ),
}));

vi.mock("../NodeInspector", () => ({
  NodeInspector: () => <div data-testid="node-inspector-mock" />,
}));

vi.mock("../OrchestratorDrawer", () => ({
  OrchestratorDrawer: () => <div data-testid="orchestrator-drawer-mock" />,
}));

describe("Canvas Component (Tldraw wrapper)", () => {
  it("renders the Tldraw component and IntentcastingBar", () => {
    const { getByTestId } = render(<Canvas />);

    // Test should initially fail if Canvas is missing these data-testids or structural changes broke it
    expect(getByTestId("tldraw-mock")).toBeDefined();
    expect(getByTestId("intentcasting-bar")).toBeDefined();
    expect(getByTestId("node-inspector-mock")).toBeDefined();
    expect(getByTestId("orchestrator-drawer-mock")).toBeDefined();
  });

  it("adversarial: handles rapid unmounting gracefully", () => {
    const { unmount } = render(<Canvas />);
    // Unmount immediately to catch any loose effects or state updates on unmounted components
    expect(() => unmount()).not.toThrow();
  });
});
