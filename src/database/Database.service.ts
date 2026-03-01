import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import {
	MstClient,
	MstLocation,
	MstPaymentMethod,
	MstPlan,
	MstStatus,
	MstUser,
	TrnCollection,
} from "./DatabaseConstants";

class DatabaseService {
	private sqlite: SQLiteConnection;
	private db: SQLiteDBConnection | null = null;

	constructor() {
		this.sqlite = new SQLiteConnection(CapacitorSQLite);
	}

	async init(): Promise<void> {
		const platform = Capacitor.getPlatform();

		if (platform === "web") {
			// Wait for jeep-sqlite custom element to be ready
			try {
				await customElements.whenDefined('jeep-sqlite');
				const jeepSqliteEl = document.querySelector('jeep-sqlite');
				if (!jeepSqliteEl) {
					// Create and append the jeep-sqlite element if it doesn't exist
					const jeepSqlite = document.createElement('jeep-sqlite');
					jeepSqlite.setAttribute('autoSave', 'true');
					document.body.appendChild(jeepSqlite);
					await customElements.whenDefined('jeep-sqlite');
				}
				
				// Initialize the web store for SQLite
				await this.sqlite.initWebStore();
				console.log('SQLite web store initialized');
			} catch (err) {
				console.error('Error initializing SQLite web store:', err);
				throw err;
			}
		}

		try {
			// Check if connection exists and close it to avoid issues with hot reload
			const isConn = (
				await this.sqlite.isConnection("client_monitoring", false)
			).result;
			if (isConn) {
				await this.sqlite.retrieveConnection("client_monitoring", false);
				await this.sqlite.closeConnection("client_monitoring", false);
			}

			// Create a connection
			this.db = await this.sqlite.createConnection(
				"client_monitoring",
				false,
				"no-encryption",
				1,
				false
			);

			// Open the connection
			await this.db.open();

			// Create tables
			const schema = `
        CREATE TABLE IF NOT EXISTS ${MstClient} (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          Client TEXT NOT NULL,
          ContactInfo TEXT,
          DateInstalled DATETIME,
          PlanId INTEGER NOT NULL,
		  UserId INTEGER NOT NULL,
          IsActive BOOLEAN DEFAULT 0,
		  LocationId INTEGER NOT NULL,
		  FOREIGN KEY (PlanId) REFERENCES ${MstPlan}(Id),
		  FOREIGN KEY (UserId) REFERENCES ${MstUser}(Id),
		  FOREIGN KEY (LocationId) REFERENCES ${MstLocation}(Id)
        );
        
        CREATE TABLE IF NOT EXISTS ${MstLocation} (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          Location TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ${MstPaymentMethod} (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          PaymentMethod TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ${MstPlan} (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          PlanName TEXT NOT NULL,
          Amount REAL NOT NULL,
          IsActive BOOLEAN DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS ${MstStatus} (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          Status TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ${MstUser} (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          User TEXT NOT NULL,
          Username TEXT NOT NULL,
          Password TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ${TrnCollection} (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          UserId INTEGER NOT NULL,
          ClientId INTEGER NOT NULL,
          LocationId INTEGER NOT NULL,
          PaymentMethodId INTEGER NOT NULL,
          StatusId INTEGER NOT NULL,
          BillingMonth STRING NOT NULL,
          AmountDue REAL NOT NULL,
          AmountPaid REAL NOT NULL,
          PaymentDate DATETIME default CURRENT_TIMESTAMP,
          FOREIGN KEY (UserId) REFERENCES ${MstUser}(Id),
          FOREIGN KEY (ClientId) REFERENCES ${MstClient}(Id),
          FOREIGN KEY (LocationId) REFERENCES ${MstLocation}(Id),
          FOREIGN KEY (PaymentMethodId) REFERENCES ${MstPaymentMethod}(Id),
          FOREIGN KEY (StatusId) REFERENCES ${MstStatus}(Id)
        );
      `;

			await this.db.execute(schema);
		} catch (err) {
			throw err;
		}
	}

	async getDb(): Promise<SQLiteDBConnection | null> {
		return this.db;
	}

	async execute(statement: string): Promise<any> {
		if (!this.db) {
			console.warn("Database not initialized");
			return null;
		}
		return await this.db.execute(statement);
	}

	async query(statement: string, values?: any[]): Promise<any[]> {
		if (!this.db) {
			console.warn("Database not initialized");
			return [];
		}
		const result = await this.db.query(statement, values);
		return result.values || [];
	}

	async run(statement: string, values?: any[]): Promise<any> {
		if (!this.db) {
			console.warn("Database not initialized");
			return null;
		}
		return await this.db.run(statement, values);
	}
}

export const databaseService = new DatabaseService();
