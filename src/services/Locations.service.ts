import { databaseService } from "../database/Database.service";
import { MstLocation } from "../database/DatabaseConstants";
import { LocationsListModel } from "../models/viewModels/LocationsListModel";

class LocationsService {
    async getLocations(): Promise<LocationsListModel[]> {
        const getLocations = await databaseService.query(`SELECT * FROM ${MstLocation}`);
        return getLocations;
    }

    async addLocation(location: string) {
        const insertLocation = await databaseService.run(
            `INSERT INTO ${MstLocation} (Location) VALUES (?)`,
            [location]
        );
        return insertLocation;
    }

    async updateLocation(id: number, location: string) {
        const updateLocation = await databaseService.run(
            `UPDATE ${MstLocation} SET Location = ? WHERE Id = ?`,
            [location, id]
        );
        return updateLocation;
    }

    async deleteLocation(id: number) {
        const deleteLocation = await databaseService.run(
            `DELETE FROM ${MstLocation} WHERE Id = ?`,
            [id]
        );
        return deleteLocation;
    }
}

const locationsService = new LocationsService();
export default locationsService;