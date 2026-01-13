import { databaseService } from "../database/Database.service";

class LocationsService {
    async getLocations() {
        const getLocations = await databaseService.query(`SELECT * FROM locations`);
        return getLocations;
    }

    async addLocation(name: string, address: string) {
        const insertLocation = await databaseService.run(
            `INSERT INTO locations (name, address) VALUES (?, ?)`,
            [name, address]
        );
        return insertLocation;
    }

    async updateLocation(id: number, name: string, address: string) {
        const updateLocation = await databaseService.run(
            `UPDATE locations SET name = ?, address = ? WHERE id = ?`,
            [name, address, id]
        );
        return updateLocation;
    }

    async deleteLocation(id: number) {
        const deleteLocation = await databaseService.run(
            `DELETE FROM locations WHERE id = ?`,
            [id]
        );
        return deleteLocation;
    }
}

const locationsService = new LocationsService();
export default locationsService;