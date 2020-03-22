import db from "../bot/db"

export default class {
    constructor (plugName) {
        this.plug = plugName
    }

    async editUserData (userId, userData) {
        return await db.users.where("[plug+userid]").equals([this.plug, userId]).modify(userData);
    }

    async getUserData (userId) {
        return await db.users.where("[plug+userid]").equals([this.plug, userId]).toArray();
    }

    async addUser (userData) {
        return await db.users.add({plug: this.plug, ...userData});
    }

    async getAllUsers () {
        return await db.users.toArray();
    }
}