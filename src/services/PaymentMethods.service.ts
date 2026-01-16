import { databaseService } from "../database/Database.service";
import { MstPaymentMethod } from "../database/DatabaseConstants";
import { PaymentMethodsListModel } from "../models/viewModels/PaymentMethodsListModel";

class PaymentMethodsService {
    async getPaymentMethods(): Promise<PaymentMethodsListModel[]> {
        const getPaymentMethods = await databaseService.query(`SELECT * FROM ${MstPaymentMethod}`);
        return getPaymentMethods;
    }

    async addPaymentMethod(paymentMethod: string) {
        const insertPaymentMethod = await databaseService.run(
            `INSERT INTO ${MstPaymentMethod} (PaymentMethod) VALUES (?)`,
            [paymentMethod]
        );
        return insertPaymentMethod;
    }

    async updatePaymentMethod(id: number, paymentMethod: string) {
        const updatePaymentMethod = await databaseService.run(
            `UPDATE ${MstPaymentMethod} SET PaymentMethod = ? WHERE Id = ?`,
            [paymentMethod, id]
        );
        return updatePaymentMethod;
    }

    async deletePaymentMethod(id: number) {
        const deletePaymentMethod = await databaseService.run(
            `DELETE FROM ${MstPaymentMethod} WHERE Id = ?`,
            [id]
        );
        return deletePaymentMethod;
    }
}

const paymentMethodsService = new PaymentMethodsService();
export default paymentMethodsService;