const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runTriggerNode(
  nodeType: string,
  config: Record<string, unknown>,
  inputs: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  await sleep(200);

  return {
    payload: {
      nodeType,
      timestamp: new Date().toISOString(),
      config,
      inputs,
    },
  };
}

export async function runIntegrationNode(
  nodeType: string,
  inputs: Record<string, unknown>,
  config: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  await sleep(300);

  return {
    result: {
      nodeType,
      status: "mocked",
      inputs,
      config,
      executedAt: new Date().toISOString(),
    },
  };
}
