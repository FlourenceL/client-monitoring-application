import { databaseService } from "../database/Database.service";

class PaymentMethodsService {
    async getPaymentMethods() {
        const getPaymentMethods = await databaseService.query(`SELECT * FROM payment_methods`);
        return getPaymentMethods;
    }

    async addPaymentMethod(name: string, details: string) {
        const insertPaymentMethod = await databaseService.run(
            `INSERT INTO payment_methods (name, details) VALUES (?, ?)`,
            [name, details]
        );
        return insertPaymentMethod;
    }

    async updatePaymentMethod(id: number, name: string, details: string) {
        const updatePaymentMethod = await databaseService.run(
            `UPDATE payment_methods SET name = ?, details = ? WHERE id = ?`,
            [name, details, id]
        );
        return updatePaymentMethod;
    }

    async deletePaymentMethod(id: number) {
        const deletePaymentMethod = await databaseService.run(
            `DELETE FROM payment_methods WHERE id = ?`,
            [id]
        );
        return deletePaymentMethod;
    }
}

const paymentMethodsService = new PaymentMethodsService();
export default paymentMethodsService;