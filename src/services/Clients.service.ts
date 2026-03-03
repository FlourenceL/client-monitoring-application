import { databaseService } from "../database/Database.service";
import { CreateClientDTO, UpdateClientDTO } from "../models/createModels/ClientsModel";
import { MstClient, TrnCollection } from "../database/DatabaseConstants";

class ClientService {
    async getClients() {
        const getClients = await databaseService.query(`SELECT * FROM ${MstClient}`);
        return getClients;
    }

    async getPaidClients() {
        const getPaidClients = await databaseService.query(
            `SELECT c.*
            FROM ${TrnCollection} t
            INNER JOIN ${MstClient} c ON t.ClientId = c.Id
            WHERE t.BillingMonth = strftime('%Y-%m', 'now')
            AND t.StatusId = 1
            AND c.IsActive = 1;`
        );
        return getPaidClients;
    }

    async addClient(createClientDto: CreateClientDTO): Promise<{success: boolean; message: string}> {
        try {

            const insertClient = await databaseService.run(
            `INSERT INTO ${MstClient} (Client, ContactInfo, DateInstalled, PlanId, IsActive, UserId, LocationId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [createClientDto.Client, createClientDto.ContactInfo, createClientDto.DateInstalled, 
                createClientDto.PlanId,createClientDto.IsActive, createClientDto.UserId, createClientDto.LocationId]
            );


            return {success: true, message: 'Client added successfully'};
        } catch (error) {
            return {success: false, message: `Failed to add client: ${error}`};
        }
        
    }

    async updateClient(id: number, updateClientDto: UpdateClientDTO): Promise<{success: boolean; message: string}> {
        try {
            const update = await databaseService.run(
                `UPDATE ${MstClient} SET Client = ?, ContactInfo = ?, DateInstalled = ?, PlanId = ?, IsActive = ?, LocationId = ? WHERE Id = ?`,
                [updateClientDto.Client, updateClientDto.ContactInfo, updateClientDto.DateInstalled, 
                 updateClientDto.PlanId, updateClientDto.IsActive, updateClientDto.LocationId, id]
            );
            return {success: true, message: 'Client updated successfully'};
        } catch (error) {
            return {success: false, message: `Failed to update client: ${error}`};
        }
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