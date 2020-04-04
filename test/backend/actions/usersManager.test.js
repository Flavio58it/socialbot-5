import usersManager from "../../../src/service/actions/usersManager";

import db from "../../../src/service/bot/db";

describe("directAction()", function () {
    beforeEach(function () {
        // Reset database
        return db.history.clear().then(() => db.users.clear())
    });

    it("whitelistUser - Should create user and whitelist it", function () {
        return usersManager.flagUser("whitelist", {
            plug: "instagram",
            id: 11,
            add: 12345
        }).then(() => db.users.toArray()).then((database) => {
            chai.expect(database).to.have.lengthOf(1, "User should be added")
            chai.expect(database[0]).to.have.property("whitelisted", 12345) // Adds date of whitelisting in field
        })
    });

    it("whitelistUser - Should whitelist an user", function () {
        return db.users.add({userid: 11, plug: "instagram"}).then(() => usersManager.flagUser("whitelist", {
            plug: "instagram",
            id: 11,
            add: 12345
        })).then(() => db.users.toArray()).then((database) => {
            chai.expect(database).to.have.lengthOf(1)
            chai.expect(database[0]).to.have.property("whitelisted", 12345) // Adds date of whitelisting in field
        })
    });

    it("whitelistUser - Should whitelist an user and remove blacklist", function () {
        return usersManager.flagUser("whitelist", {
            plug: "instagram",
            id: 11,
            add: 12345
        }).then(() => db.users.toArray()).then((database) => {
            chai.expect(database).to.have.lengthOf(1)
            chai.expect(database[0]).to.have.property("whitelisted", 12345) // Adds date of whitelisting in field
            chai.expect(database[0]).to.have.property("blacklisted", false)
        })
    });

    it("blacklistUser - Should blacklist an user", function () {
        return db.users.add({userid: 11, plug: "instagram", blacklisted: 1234}).then(() => usersManager.flagUser("blacklist", {
            plug: "instagram",
            id: 11,
            add: 12345
        })).then(() => db.users.toArray()).then((database) => {
            chai.expect(database).to.have.lengthOf(1)
            chai.expect(database[0]).to.have.property("blacklisted", 12345) // Adds date of whitelisting in field
        })
    });

    it("blacklistUser - Should blacklist an user that does not exist, so must be added", function () {
        return usersManager.flagUser("blacklist", {
            plug: "instagram",
            id: 11,
            add: 12345
        }).then(() => db.users.toArray()).then((database) => {
            chai.expect(database).to.have.lengthOf(1, "User should be added")
            chai.expect(database[0]).to.have.property("blacklisted", 12345) // Adds date of blacklisting in field
        })
    });
    
});