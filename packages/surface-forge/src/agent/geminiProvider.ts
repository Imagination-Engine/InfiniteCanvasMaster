export function getGeminiProvider() {
  return {
    modelName: 'gemini-3.5-pro',
    formatBuilderPrompt: (blackboardState: any) => {
      return `Build the app with the following state:
spec: ${blackboardState.spec}
design: ${blackboardState.design}
`;
    }
  };
}