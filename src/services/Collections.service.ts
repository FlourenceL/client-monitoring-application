import { databaseService } from "../database/Database.service";
import { TrnCollection, MstClient, MstPlan } from "../database/DatabaseConstants";
import { CreateCollectionDTO } from "../models/createModels/CollectionsModel";
import { MstStatus, MstPaymentMethod, MstLocation } from "../database/DatabaseConstants";

class CollectionService {
    async getCollections() {
        const getCollections = await databaseService.query(`SELECT * FROM ${TrnCollection}`);
        return getCollections;
    }

    async getCollectionsByMonth(month: string) {
        const getCollections = await databaseService.query(`SELECT * FROM ${TrnCollection} WHERE BillingMonth = ?`, [month]);
        return getCollections;
    }

    async getCollectionsByMonthDetailed(month: string) {
        const getCollections = await databaseService.query(
            `SELECT t.Id, t.BillingMonth, t.AmountDue, t.AmountPaid, t.StatusId, t.LocationId,
                    c.Client, c.ContactInfo, c.DateInstalled, s.Status, pm.PaymentMethod, l.Location
             FROM ${TrnCollection} t
             JOIN ${MstClient} c ON t.ClientId = c.Id
             JOIN ${MstStatus} s ON t.StatusId = s.Id
             LEFT JOIN ${MstPaymentMethod} pm ON t.PaymentMethodId = pm.Id
             LEFT JOIN ${MstLocation} l ON t.LocationId = l.Id
             WHERE t.BillingMonth = ?`,
            [month]
        );
        return getCollections;
    }

    async markAsPaid(id: number) {
        try {
            const update = await databaseService.run(
                `UPDATE ${TrnCollection} SET StatusId = 2, AmountPaid = AmountDue, PaymentDate = ? WHERE Id = ?`,
                [new Date().toISOString(), id]
            );
            return { success: true };
        } catch (error) {
            console.error("Mark as paid error", error);
            return { success: false, error };
        }
    }

    async markAsUnpaid(id: number) {
        try {
            // Revert to Pending (1), Reset Paid amount
            const update = await databaseService.run(
                `UPDATE ${TrnCollection} SET StatusId = 1, AmountPaid = 0, PaymentDate = NULL WHERE Id = ?`,
                [id]
            );
            return { success: true };
        } catch (error) {
            console.error("Mark as unpaid error", error);
            return { success: false, error };
        }
    }

    async updateOverdueTransactions() {
        try {
           // 1. Time-based: Mark past pending transactions as overdue based on exact installation day
            const pendings = await databaseService.query(`
                SELECT t.Id, t.BillingMonth, t.ClientId, c.DateInstalled 
                FROM ${TrnCollection} t 
                LEFT JOIN ${MstClient} c ON t.ClientId = c.Id 
                WHERE t.StatusId = 1
            `);
            
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Compare dates only
            
            let count = 0;
            for(const trn of pendings) {
                if(!trn.BillingMonth) continue;
                const [m, y] = trn.BillingMonth.split('/');
                const billYear = parseInt(y);
                const billMonthIndex = parseInt(m) - 1; // 0-based
                
                let dueDay = 1;
                
                // Determine Due Day from Installation Date
                if (trn.DateInstalled) {
                     const d = new Date(trn.DateInstalled);
                     if(!isNaN(d.getTime())) {
                         dueDay = d.getDate();
                     } else {
                         // Fallback if DateInstalled is invalid
                         dueDay = new Date(billYear, billMonthIndex + 1, 0).getDate(); // End of month
                     }
                } else {
                    // Fallback if no DateInstalled
                     dueDay = new Date(billYear, billMonthIndex + 1, 0).getDate(); // End of month
                }

                // Handle valid days for the billing month (e.g. 31st in Feb -> 28th)
                const lastDayOfBillMonth = new Date(billYear, billMonthIndex + 1, 0).getDate();
                const finalDueDay = Math.min(dueDay, lastDayOfBillMonth);
                
                const dueDate = new Date(billYear, billMonthIndex, finalDueDay);
                dueDate.setHours(0, 0, 0, 0);
                
                // If today is strictly after the due date, it is overdue
                if (now > dueDate) {
                     await databaseService.run(`UPDATE ${TrnCollection} SET StatusId = 3 WHERE Id = ?`, [trn.Id]);
                     count++;
                }
            }

            // Note: Cascade logic removed to respect exact due date rule.
            // Future bills should not be marked overdue until their specific date has passed.

            return { success: true, count };
        } catch (e) {
            console.error("Error updating overdue transactions:", e);
            return { success: false, error: e };
        }
   }

    async generateMonthlyTransactions(monthYear: string) {
        try {
            // monthYear expected format: "MM/YYYY"
            const [m, y] = monthYear.split('/');
            const targetDate = new Date(parseInt(y), parseInt(m) - 1, 1);
            
            // Get active clients
            const clients = await databaseService.query(`SELECT * FROM ${MstClient} WHERE IsActive = 1`);
            // Get plans
            const plans = await databaseService.query(`SELECT * FROM ${MstPlan}`);
             // Get default payment method (first one) to satisfy constraint
            const pms = await databaseService.query(`SELECT * FROM ${MstPaymentMethod} LIMIT 1`);
            const defaultPmId = pms.length > 0 ? pms[0].Id : 1;

            let count = 0;

            for (const client of clients) {
                // Check if transaction exists
                const existing = await databaseService.query(
                    `SELECT * FROM ${TrnCollection} WHERE ClientId = ? AND BillingMonth = ?`,
                    [client.Id || client.id, monthYear]
                );

                if (existing.length > 0) continue;

                 // Check Install Date
                // We parse manually to avoid timezone issues shifting the month back (e.g., UTC to Local)
                let installMonthIndex = 0;
                if (client.DateInstalled) {
                    const datePart = String(client.DateInstalled).split('T')[0]; // "YYYY-MM-DD"
                    const parts = datePart.split('-');
                    if (parts.length >= 2) {
                        const iYear = parseInt(parts[0]);
                        const iMonth = parseInt(parts[1]) - 1; // 0-indexed
                        installMonthIndex = iYear * 12 + iMonth;
                    } else {
                        const d = new Date(client.DateInstalled);
                        installMonthIndex = d.getFullYear() * 12 + d.getMonth();
                    }
                }

                // Compare months: (targetYear * 12 + targetMonth) > (installYear * 12 + installMonth)
                // If it's the SAME month (==), we do NOT generate (it's paid on install).
                const targetMonthIndex = targetDate.getFullYear() * 12 + targetDate.getMonth();

                if (targetMonthIndex > installMonthIndex) {
                    const plan = plans.find((p: any) => p.Id === client.PlanId);
                    const amountDue = plan ? plan.Amount : 0;

                    await this.addCollection({
                        UserId: 1, // Default admin
                        ClientId: client.Id || client.id,
                        LocationId: client.LocationId || 1, // Default location fallback
                        StatusId: 1, // Pending
                        PaymentMethodId: defaultPmId, // Default (e.g. Cash)
                        BillingMonth: monthYear,
                        AmountDue: amountDue,
                        AmountPaid: 0,
                        PaymentDate: '', // Not paid yet
                        CreateDate: new Date().toISOString()
                    });
                    count++;
                }
            }
            return { success: true, count };
        } catch (error) {
            console.error("Error generating monthly transactions:", error);
            return { success: false, error };
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