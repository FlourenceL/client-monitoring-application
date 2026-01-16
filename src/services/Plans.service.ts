import { databaseService } from "../database/Database.service";
import { MstPlan } from "../database/DatabaseConstants";

class PlanService {
    async getPlans() {
        const getPlans = await databaseService.query(`SELECT * FROM ${MstPlan}`);
        return getPlans;
    }

    async addPlan(planName: string, amount: number, isActive: boolean) {
        const insertPlan = await databaseService.run(
            `INSERT INTO ${MstPlan} (PlanName, Amount, IsActive) VALUES (?, ?, ?)`,
            [planName, amount, isActive]
        );
        return insertPlan;
    }

    async updatePlan(id: number, planName: string, amount: number, isActive: boolean) {
        const updatePlan = await databaseService.run(
            `UPDATE ${MstPlan} SET PlanName = ?, Amount = ?, IsActive = ? WHERE Id = ?`,
            [planName, amount, isActive, id]
        );
        return updatePlan;
    }

    async deletePlan(id: number) {
        const deletePlan = await databaseService.run(
            `DELETE FROM ${MstPlan} WHERE Id = ?`,
            [id]
        );
        return deletePlan;
    }
}

const planService = new PlanService();
export default planService;