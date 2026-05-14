import {
  ConductorEnvelope,
  ConductorRuntimeState,
  MappingExpression,
} from "../types/runtime.js";

/**
 * Resolves a simple object path like "$input.json.email" or "$node.config.body"
 */
function resolvePath(path: string, context: Record<string, any>): any {
  if (!path.startsWith("$")) return path; // literal string if no $ prefix

  const parts = path.substring(1).split(".");
  let current = context;

  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }

  return current;
}

/**
 * Sets a value deep within an object based on a path like "body.customerEmail"
 */
function setValueByPath(obj: Record<string, any>, path: string, value: any) {
  // Strip $ prefix if present (usually mapping 'to' paths might just be local paths relative to the target)
  const normalizedPath = path.startsWith("$") ? path.substring(1) : path;
  const parts = normalizedPath.split(".");
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part]) current[part] = {};
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
}

/**
 * Resolves an array of mappings against the current state and incoming envelopes.
 * Returns a new object with the mapped values.
 */
export function resolveMappings(
  mappings: MappingExpression[],
  state: ConductorRuntimeState,
  incoming: ConductorEnvelope[],
): Record<string, any> {
  const result: Record<string, any> = {};

  // Build a context object that mappings can reference
  // Example Context:
  // $previous.output -> refers to payload of the most recent incoming envelope
  // $state.memory -> refers to state.memory
  // $state.variables -> refers to state.variables

  const latestEnvelope =
    incoming.length > 0 ? incoming[incoming.length - 1] : null;

  const context = {
    previous: latestEnvelope
      ? {
          payload: latestEnvelope.payload,
          item: latestEnvelope.item,
        }
      : {},
    state: {
      memory: state.memory,
      variables: state.variables,
    },
  };

  for (const mapping of mappings) {
    const value = resolvePath(mapping.from, context);
    if (value !== undefined) {
      setValueByPath(result, mapping.to, value);
    }
  }

  return result;
}

/**
 * Templating function for simple string replacement (e.g. "Hello {{name}}")
 */
export function resolveTemplate(
  template: string,
  variables: Record<string, any>,
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const val = resolvePath(path.trim(), variables);
    return val !== undefined ? String(val) : "";
  });
}
