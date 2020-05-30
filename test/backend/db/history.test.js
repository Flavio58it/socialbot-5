import {
    getPeriodStats,
    interactor,
    getHistory
} from "../../../src/service/db/History"

import db from "../../../src/service/bot/db"

function parseNum (number) {
    return (number < 10) ? `0${number}` : number
}

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
    const date = new Date().getTime() - (dateOffsetFromNow * 1000 * 60 * 60 * 24 - dateMillisOffset);
    const dateInstance = new Date(date)
    const day = `${dateInstance.getFullYear()}${parseNum(dateInstance.getMonth() + 1)}${parseNum(dateInstance.getDate())}}`

    for (let i = 0; i < qty; i++) {
        await db.history.add({
            plug,
            action: eventName,
            details,
            time: date,
            day
        })
    }
}

describe("#db.filters", function () {

    beforeEach(async function () {
        await db.history.clear()
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

    context ("@userInteraction", function () {
        it ("Should log one event to history", async function () {
            const int = new interactor({plug: "testplug"})

            chai.expect(int).to.be.an("object")

            int.userInteraction("LIKE", {
                img: "testImg",
                id: "test",
                userId: "UID",
                isVideo: false,
                username: "TestUserName",
                tag: "tag"
            })

            const result = await db.history.toArray()

            chai.expect(result).to.be.lengthOf(1)
            chai.expect(result[0]).to.have.property("plug", "testplug")
            chai.expect(result[0]).to.have.property("action", "USER_LIKE")

            console.log(result[0].details)
            chai.expect(result[0].details).to.deep.equal({
                img: "testImg", 
                imgId: "test",
                userId: "UID",
                userName: "TestUserName",
                video: false, 
                tag: "tag"
            })
            chai.expect(result[0].time).to.be.an("number")
        })
    })

    context("@getHistory", function () {
        it ("Should get all entries", async function () {
            await mockDbLogEntries("LIKE", 1, 1, {plug: "test1"})
            await mockDbLogEntries("LIKE", 1, 1, {plug: "test2"})
            await mockDbLogEntries("LIKE", 1, 1, {plug: "test3"})

            const history = await getHistory()

            chai.expect(history).to.be.lengthOf(3)
            chai.expect(history[0]).to.have.property("plug", "test3", "The entries must be inverted")
        })

        it ("Should get filtered entries", async function () {
            await mockDbLogEntries("LIKE", 1, 1, {plug: "test1"})
            await mockDbLogEntries("LIKE", 1, 2, {plug: "test2"})
            await mockDbLogEntries("LIKE", 1, 1, {plug: "test3"})

            const history = await getHistory("test2")

            chai.expect(history).to.be.lengthOf(2)
            chai.expect(history[0]).to.have.property("plug", "test2", "Correct entry must be present")
        })
    })
})