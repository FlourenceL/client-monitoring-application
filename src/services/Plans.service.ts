import { databaseService } from "../database/Database.service";

class PlanService {
    async getPlans() {
        const getPlans = await databaseService.query(`SELECT * FROM plans`);
        return getPlans;
    }

    async addPlan(name: string, price: number, duration: string) {
        const insertPlan = await databaseService.run(
            `INSERT INTO plans (name, price, duration) VALUES (?, ?, ?)`,
            [name, price, duration]
        );
        return insertPlan;
    }

    async updatePlan(id: number, name: string, price: number, duration: string) {
        const updatePlan = await databaseService.run(
            `UPDATE plans SET name = ?, price = ?, duration = ? WHERE id = ?`,
            [name, price, duration, id]
        );
        return updatePlan;
    }

    async deletePlan(id: number) {
        const deletePlan = await databaseService.run(
            `DELETE FROM plans WHERE id = ?`,
            [id]
        );
        return deletePlan;
    }
}

const planService = new PlanService();
export default planService;