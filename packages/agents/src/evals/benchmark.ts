export const INTENT_BENCHMARKS = [
  {
    id: "story_generator",
    prompt: "Build me a 3-act story generator that takes a theme, writes the chapters, and then summarizes the whole thing.",
    expected_nodes: ["chapter", "summarizer"], // Must contain at least these
    expected_edge_count_min: 2,
  },
  {
    id: "data_pipeline",
    prompt: "I need a pipeline that fetches data, refines it, and then sends it to Slack.",
    expected_nodes: ["data", "refiner", "saas"],
    expected_edge_count_min: 2,
  }
];
