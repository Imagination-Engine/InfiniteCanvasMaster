export class ChainExecutor {
    steps;
    constructor(steps) {
        this.steps = steps;
    }
    async run(initialInput) {
        let currentInput = initialInput;
        for (const step of this.steps) {
            try {
                currentInput = await step.execute(currentInput);
            }
            catch (error) {
                throw new Error(`Chain execution failed at step ${step.name}: ${error.message}`);
            }
        }
        return currentInput;
    }
}
