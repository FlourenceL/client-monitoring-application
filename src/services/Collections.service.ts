import { databaseService } from "../database/Database.service";
import { TrnCollection, MstClient, MstPlan } from "../database/DatabaseConstants";
import { CreateCollectionDTO } from "../models/createModels/CollectionsModel";

class CollectionService {
    async getCollections() {
        const getCollections = await databaseService.query(`SELECT * FROM ${TrnCollection}`);
        return getCollections;
    }

    async getCollectionsByMonth(month: string) {
        const getCollections = await databaseService.query(`SELECT * FROM ${TrnCollection} WHERE BillingMonth = ?`, [month]);
        return getCollections;
    }

    async generateMonthlyTransactions() {
        try {
            const now = new Date();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            const billingMonth = `${month}/${year}`;

            // Get active clients
            const clients = await databaseService.query(`SELECT * FROM ${MstClient} WHERE IsActive = 1`);
            // Get plans
            const plans = await databaseService.query(`SELECT * FROM ${MstPlan}`);

            for (const client of clients) {
                // Check if transaction exists
                const existing = await databaseService.query(
                    `SELECT * FROM ${TrnCollection} WHERE ClientId = ? AND BillingMonth = ?`,
                    [client.Id || client.id, billingMonth]
                );

                if (existing.length === 0) {
                    const plan = plans.find((p: any) => p.Id === client.PlanId);
                    const amountDue = plan ? plan.Amount : 0;

                    await this.addCollection({
                        UserId: 1, // Default admin
                        ClientId: client.Id || client.id,
                        LocationId: 1, // Default location
                        StatusId: 1, // Pending
                        PaymentMethodId: 1, // Default (e.g. Cash)
                        BillingMonth: billingMonth,
                        AmountDue: amountDue,
                        AmountPaid: 0,
                        PaymentDate: null as any, // Not paid yet
                        CreateDate: new Date()
                    });
                    console.log(`Generated transaction for client ${client.Client} for ${billingMonth}`);
                }
            }
        } catch (error) {
            console.error("Error generating monthly transactions:", error);
        }
    }

    async addCollection(collection: CreateCollectionDTO) {
        const insertCollection = await databaseService.run(
            `INSERT INTO ${TrnCollection} (UserId, ClientId, LocationId, StatusId, PaymentMethodId, BillingMonth, AmountDue, AmountPaid, PaymentDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [collection.UserId, collection.ClientId, collection.LocationId, collection.StatusId, collection.PaymentMethodId, collection.BillingMonth, collection.AmountDue, collection.AmountPaid, collection.PaymentDate]
        );
        return insertCollection;
    }

    async updateCollection(id: number, collection: Partial<CreateCollectionDTO>) {
         // Placeholder for update
        return null; 
    }

    async deleteCollection(id: number) {
        const deleteCollection = await databaseService.run(
            `DELETE FROM ${TrnCollection} WHERE Id = ?`,
            [id]
        );
        return deleteCollection;
    }
}

const collectionService = new CollectionService();
export default collectionService;