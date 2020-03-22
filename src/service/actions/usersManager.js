import Users from "../db/users";

export default {
    flagUser: async function (flagType, data) {
        var dbUser = new Users(data.plug);
        var flagData = {whitelisted: data.add, blacklisted: false}
        if (flagType === "blacklist")
            flagData = {whitelisted: false, blacklisted: data.add}

        var edited = await dbUser.editUserData(data.id, flagData);
        if (edited === 1)
            return edited
        
        var newUser = await dbUser.addUser({userid: data.id, ...flagData});
        return newUser;
    }
}