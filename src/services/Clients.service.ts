import { databaseService } from "../database/Database.service";

class ClientService {
    async getClients() {
        const getClients = await databaseService.query(`SELECT * FROM clients`)
    }

    async addClient(name: string, email: string, phone: string) {
        const insertClient = await databaseService.run(
            `INSERT INTO clients (name, email, phone) VALUES (?, ?, ?)`,
            [name, email, phone]
        );
        return insertClient;
    }

    async updateClientStatus(id: number, status: string) {
        const updateStatus = await databaseService.run(
            `UPDATE clients SET status = ? WHERE id = ?`,
            [status, id]
        );
        return updateStatus;
    }

    async deleteClient(id: number) {
        const deleteClient = await databaseService.run(
            `DELETE FROM clients WHERE id = ?`,
            [id]
        );
        return deleteClient;
    }
}

const clientService = new ClientService();
export default clientService;