import { databaseService } from "./Database.service";
import {
  MstClient,
  MstLocation,
  MstPaymentMethod,
  MstPlan,
  MstStatus,
  MstUser,
} from "./DatabaseConstants";

export const seedDatabase = async () => {
  try {
		// Seed Users
		const users = await databaseService.query(`SELECT * FROM ${MstUser}`);
		if (users.length === 0) {
			await databaseService.run(
				`INSERT INTO ${MstUser} (User, Username, Password) VALUES (?, ?, ?)`,
				["Fammelrio Lapore", "admin", "admin123"]
			);
			console.log("Seeded Users");
		}

		// Seed Locations
		const locations = await databaseService.query(
			`SELECT * FROM ${MstLocation}`
		);
		if (locations.length === 0) {
			const locationData = ["Dagsa"];
			for (const loc of locationData) {
				await databaseService.run(
					`INSERT INTO ${MstLocation} (Location) VALUES (?)`,
					[loc]
				);
			}
			console.log("Seeded Locations");
		}

		// Seed Payment Methods
		const paymentMethods = await databaseService.query(
			`SELECT * FROM ${MstPaymentMethod}`
		);
		if (paymentMethods.length === 0) {
			const methods = ["Cash", "Gcash", "Bank Transfer"];
			for (const method of methods) {
				await databaseService.run(
					`INSERT INTO ${MstPaymentMethod} (PaymentMethod) VALUES (?)`,
					[method]
				);
			}
			console.log("Seeded Payment Methods");
		}

		// Seed Plans
		const plans = await databaseService.query(`SELECT * FROM ${MstPlan}`);
		if (plans.length === 0) {
			const planData = [
				{ name: "5 mbps", amount: 500, isActive: 1 },
				{ name: "10 mbps", amount: 1000, isActive: 1 },
			];
			for (const plan of planData) {
				await databaseService.run(
					`INSERT INTO ${MstPlan} (PlanName, Amount, IsActive) VALUES (?, ?, ?)`,
					[plan.name, plan.amount, plan.isActive]
				);
			}
			console.log("Seeded Plans");
		}

		// Seed Statuses
		const statuses = await databaseService.query(`SELECT * FROM ${MstStatus}`);
		if (statuses.length === 0) {
			const statusData = ["Pending", "Paid", "Overdue", "Cancelled"];
			for (const status of statusData) {
				await databaseService.run(
					`INSERT INTO ${MstStatus} (Status) VALUES (?)`,
					[status]
				);
			}
			console.log("Seeded Statuses");
		}

		// Seed Clients
		const clients = await databaseService.query(`SELECT * FROM ${MstClient}`);
		if (clients.length === 0) {
			// We need Plan IDs. Assuming 1 and 2 from above.
			const clientData = [
				{
					client: "John Doe",
					contactInfo: "09123456789",
					dateInstalled: new Date().toISOString(),
					planId: "1",
					isActive: 1,
				},
				{
					client: "Jane Smith",
					contactInfo: "09987654321",
					dateInstalled: new Date().toISOString(),
					planId: "2",
					isActive: 1,
				},
			];

			for (const client of clientData) {
				await databaseService.run(
					`INSERT INTO ${MstClient} (Client, ContactInfo, DateInstalled, PlanId, IsActive) VALUES (?, ?, ?, ?, ?)`,
					[
						client.client,
						client.contactInfo,
						client.dateInstalled,
						client.planId,
						client.isActive,
					]
				);
			}
			console.log("Seeded Clients");
		}
	} catch (error) {
    console.error("Error seeding database:", error);
  }
};
