import { databaseService } from "../database/Database.service";

class CollectionService {
    async getCollections() {
        const getCollections = await databaseService.query(`SELECT * FROM collections`);
        return getCollections;
    }

    async addCollection(name: string, description: string) {
        const insertCollection = await databaseService.run(
            `INSERT INTO collections (name, description) VALUES (?, ?)`,
            [name, description]
        );
        return insertCollection;
    }

    async updateCollection(id: number, name: string, description: string) {
        const updateCollection = await databaseService.run(
            `UPDATE collections SET name = ?, description = ? WHERE id = ?`,
            [name, description, id]
        );
        return updateCollection;
    }

    async deleteCollection(id: number) {
        const deleteCollection = await databaseService.run(
            `DELETE FROM collections WHERE id = ?`,
            [id]
        );
        return deleteCollection;
    }
}

const collectionService = new CollectionService();
export default collectionService;