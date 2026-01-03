import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { useIonToast } from '@ionic/react';

class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async init(): Promise<void> {
    const platform = Capacitor.getPlatform();
    
    if (platform === 'web') {
      console.warn('SQLite is not supported on web in this configuration. Please run on an Android device/emulator.');
      return;
    }

    try {
      // Check if connection exists and close it to avoid issues with hot reload
      const isConn = (await this.sqlite.isConnection('client_monitoring', false)).result;
      if (isConn) {
          await this.sqlite.retrieveConnection('client_monitoring', false);
          await this.sqlite.closeConnection('client_monitoring', false); 
      }

      // Create a connection
      this.db = await this.sqlite.createConnection(
        'client_monitoring',
        false,
        'no-encryption',
        1,
        false
      );

      // Open the connection
      await this.db.open();

      // Create tables
      const schema = `
        CREATE TABLE IF NOT EXISTS clients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id INTEGER,
          title TEXT NOT NULL,
          content TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(client_id) REFERENCES clients(id)
        );
      `;
      
      await this.db.execute(schema);
      
      console.log('Database initialized successfully');

    } catch (err) {
      console.error('Error initializing database:', err);
      throw err;
    }
  }

  async getDb(): Promise<SQLiteDBConnection | null> {
      return this.db;
  }

  async execute(statement: string): Promise<any> {
      if (!this.db) {
        console.warn('Database not initialized');
        return null;
      }
      return await this.db.execute(statement);
  }
  
  async query(statement: string, values?: any[]): Promise<any[]> {
      if (!this.db) {
        console.warn('Database not initialized');
        return [];
      }
      const result = await this.db.query(statement, values);
      return result.values || [];
  }

  async run(statement: string, values?: any[]): Promise<any> {
    if (!this.db) {
      console.warn('Database not initialized');
      return null;
    }
    return await this.db.run(statement, values);
  }
}

export const databaseService = new DatabaseService();
