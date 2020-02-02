import db from "../db/db"

export default {
    flagUser: async function (flagType, data) {
        var flagData = {whitelisted: data.add, blacklisted: false}
        if (flagType === "blacklist")
            flagData = {whitelisted: false, blacklisted: data.add}

        var edited = await db.users.where("[plug+userid]").equals([data.plug, data.id]).modify(flagData);
        if (edited === 1)
            return edited
        
        var newUser = await db.users.add({userid: data.id, ...flagData});
        return newUser;
    }
}