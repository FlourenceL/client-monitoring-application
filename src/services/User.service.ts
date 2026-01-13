import { databaseService } from "../database/Database.service";

class UserService {
    async getUsers() {
        const getUsers = await databaseService.query(`SELECT * FROM users`);
        return getUsers;
    }

    async addUser(username: string, email: string, password: string) {
        const insertUser = await databaseService.run(
            `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
            [username, email, password]
        );
        return insertUser;
    }

    async updateUser(id: number, username: string, email: string, password: string) {
        const updateUser = await databaseService.run(
            `UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?`,
            [username, email, password, id]
        );
        return updateUser;
    }

    async deleteUser(id: number) {
        const deleteUser = await databaseService.run(
            `DELETE FROM users WHERE id = ?`,
            [id]
        );
        return deleteUser;
    }
}

const userService = new UserService();
export default userService;