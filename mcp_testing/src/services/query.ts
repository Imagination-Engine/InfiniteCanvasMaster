import db from '../db';
import { Run, Step } from '../types';

export class QueryService {
    static getRun(id: string): Run | undefined {
        return db.prepare('SELECT * FROM runs WHERE id = ?').get(id) as Run | undefined;
    }

    static getStepsForRun(run_id: string): Step[] {
        return db.prepare('SELECT * FROM steps WHERE run_id = ? ORDER BY created_at ASC').all(run_id) as Step[];
    }

    static getRunDetails(id: string) {
        const run = this.getRun(id);
        if (!run) return undefined;

        const steps = this.getStepsForRun(id);
        return {
            ...run,
            steps
        };
    }
}
