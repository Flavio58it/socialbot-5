import db from "./db"

export default class {
    constructor (plugName) {
        this.plug = plugName
    }

    async editUserData (userId, userData) {
        return await db.users.where("[plug+userid]").equals([this.plug, userId]).modify(userData);
    }
}