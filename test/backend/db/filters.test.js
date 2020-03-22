import {
    getPeriodStats
} from "../../../src/service/db/filters"

import db from "../../../src/service/bot/db"


// Mock log entries
async function mockDbLogEntries(
    eventName, 
    dateOffsetFromNow, 
    qty, 
    {
        dateMillisOffset = 0, 
        plug = "instagram", 
        details = {}
    } = {}
    ) {
    var date = new Date().getTime() - (dateOffsetFromNow * 1000 * 60 * 60 * 24 - dateMillisOffset);

    for (let i = 0; i < qty; i++) {
        await db.logs.add({
            plug,
            action: eventName,
            details,
            time: date
        })
    }
}

describe("#db.filters", function () {

    beforeEach(async function () {
        await db.logs.clear()
        await db.users.clear()
    })

    context("@getPeriodStats", function () {
        it("Should return correct number of all attributes", async function () {
            await mockDbLogEntries("USER_LIKE", 1, 1);
            await mockDbLogEntries("USER_LIKE", 2, 10);
            await mockDbLogEntries("USER_LIKE", 3, 20);

            await mockDbLogEntries("USER_LIKEBACK", 3, 5);

            await mockDbLogEntries("USER_UNFOLLOW", 1, 1);

            await mockDbLogEntries("USER_COMMENT", 2, 1);

            var data = await getPeriodStats("instagram", 0, 30);

            chai.expect(data).to.be.lengthOf(30)
            chai.expect(data[0]).to.have.property("likes", 0)
            chai.expect(data[1]).to.have.property("likes", 1)
            chai.expect(data[2]).to.have.property("likes", 10)
            chai.expect(data[3]).to.have.property("likes", 20)

            chai.expect(data[0]).to.have.property("likeBack", 0)
            chai.expect(data[3]).to.have.property("likeBack", 5)

            chai.expect(data[0]).to.have.property("followBack", 0)

            chai.expect(data[0]).to.have.property("unfollow", 0)
            chai.expect(data[1]).to.have.property("unfollow", 1)

            chai.expect(data[0]).to.have.property("comment", 0)
            chai.expect(data[2]).to.have.property("comment", 1)
            
        });

        it("Should return nothing as plug is different", async function () {
            await mockDbLogEntries("USER_LIKE", 1, 2, {plug: "boh"});

            var data = await getPeriodStats("instagram", 0, 2);

            chai.expect(data).to.be.lengthOf(2)
            chai.expect(data[1]).to.have.property("likes", 0)
        });

        it("Should return sum of period data", async function() {
            await mockDbLogEntries("USER_LIKE", 1, 1);
            await mockDbLogEntries("USER_LIKE", 2, 1);
            await mockDbLogEntries("USER_LIKE", 4, 1);
            await mockDbLogEntries("USER_LIKE", 8, 1, {dateMillisOffset: 20}); // Slightly different time in order to check malfunctions of isSameDay

            // Outside time period
            await mockDbLogEntries("USER_LIKE", 31, 1);

            var data = await getPeriodStats("instagram", 0, 30, {sum: true});

            chai.expect(data).to.have.property("likes", 4);
        })
    })
})