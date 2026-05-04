export const INTENT_BENCHMARKS = [
  {
    id: "story_generator",
    prompt:
      "Build me a 3-act story generator that takes a theme, writes the chapters, and then summarizes the whole thing.",
    expected_nodes: ["chapter", "summarizer"],
    expected_edge_count_min: 2,
    expected_edges: [],
  },
  {
    id: "rag_pipeline",
    prompt:
      "Create a RAG pipeline that loads a PDF document, chunks the text, and executes a vector search.",
    expected_nodes: ["documentLoader", "chunker", "vectorSearch"],
    expected_edge_count_min: 2,
    expected_edges: [
      { source_type: "documentLoader", target_type: "chunker" },
      { source_type: "chunker", target_type: "vectorSearch" },
    ],
  },
  {
    id: "platformer_controller",
    prompt:
      "Build a 2D player controller with a joystick, a character sprite, and physics colliders.",
    expected_nodes: ["joystick", "sprite", "collider"],
    expected_edge_count_min: 2,
    expected_edges: [
      { source_type: "joystick", target_type: "sprite" }, // Joystick should control the sprite
    ],
  },
  {
    id: "cinematic_scene",
    prompt:
      "Set up a video scene with dramatic lighting, a camera pan, and export it.",
    expected_nodes: ["scene", "lighting", "camera", "export"],
    expected_edge_count_min: 3,
    expected_edges: [
      { source_type: "scene", target_type: "export" }, // Eventually must output to export
    ],
  },
  {
    id: "autonomous_coder",
    prompt:
      "I need an autonomous coding loop that architects a spec, builds the code, tests it, and loops back if there's an error boundary.",
    expected_nodes: ["architect", "builder", "tester", "errorBoundary"],
    expected_edge_count_min: 3,
    expected_edges: [
      { source_type: "architect", target_type: "builder" },
      { source_type: "builder", target_type: "tester" },
    ],
  },
];
