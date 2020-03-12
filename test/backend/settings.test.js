// Test settings implementation

import settings from "../../src/service/bot/settings";

import { 
    storage 
} from "../utils/chrome";

// Chose with which plug settings we will test
const testSettings = "instagram",
      testNestedAttribute = "filters.likes.isTextInclusive";

describe("#settings()", function () {

    before(function () {
        window.chrome = {}
        chrome = {
            storage
        }
    });

    it("The initialization returns correct attributes", async function () {
        chai.expect(settings).to.be.an("function")

        var options = await settings(testSettings)

        chai.expect(options).to.be.an("object")
        chai.expect(options).to.have.property("get")
        chai.expect(options).to.have.property("set")
    });

    context("resetAll()", function () {
        it ("Should reset settings after a change", async function () {
            var options = await settings(testSettings)

            await options.set("enabled", false)

            var data = await options.get("enabled")

            chai.expect(data).to.equal(false, "Should return false")

            await options.resetAll()

            var data = await options.get("enabled")

            chai.expect(data).to.equal(true, "Should return true as has been resetted")
        })
    })

    context("getAll()", function () {
        it ("Should get all settings in an object", async function () {
            var options = await settings(testSettings)

            var data = await options.getAll()

            chai.expect(data).to.be.an("object", "Get an the main instagram object as a whole")
            chai.expect(data.enabled).to.be.an("boolean", "Get enabled attribute from default settings")
        })
    })

    context("setAll()", function () {
        it ("Should get all settings in an object and reset to default", async function () {
            var options = await settings(testSettings)

            var data = await options.setAll({test: true})

            var data = await options.getAll()

            chai.expect(data).to.be.an("object", "Get an the main instagram object as a whole")
            chai.expect(data.enabled).to.not.be.an("boolean", "This attribute should be erased")

            await options.resetAll()

            var data = await options.getAll()

            chai.expect(data).to.be.an("object", "Get an the main instagram object as a whole")
            chai.expect(data.enabled).to.be.an("boolean", "This attribute should be erased")
        })
    })

    context("set()", function () {
        it("Should set new setting", async function () {
            var options = await settings(testSettings)

            let enabled = await options.get("enabled")

            chai.expect(enabled).to.equal(true, "By default the attribute should be true");

            await options.set("enabled", false);

            let enabledAfter = await options.get("enabled")

            chai.expect(enabledAfter).to.equal(false, "After change the attribute should be false");
        })

        it("Should set new nested setting", async function () {
            var options = await settings(testSettings)

            let enabled = await options.get(testNestedAttribute)

            chai.expect(enabled).to.equal(false, "By default the attribute should be false");

            await options.set(testNestedAttribute, true);

            let enabledAfter = await options.get(testNestedAttribute)

            chai.expect(enabledAfter).to.equal(true, "After change the attribute should be true");

            await options.resetAll()
        })

        it("Should throw error when attribute is not present in settings", async function () {
            var options = await settings(testSettings)

            try {
                let response = await options.set("not.existent.attr")
            } catch (e) {
                chai.expect(e.message).to.equal("Not existent setting")
                return;
            }
            chai.assert.fail("Should throw error")
        })
    })

    context("get()", function () {
        it("Get nested values", async function () {
            var options = await settings(testSettings)

            var inclusive = null

            try {
                inclusive = await options.get(testNestedAttribute)
            } catch (e) {
                chai.assert.fail("Should not throw error")
                return
            }

            chai.expect(inclusive).to.equal(false)
        })

        it("Should throw error when attribute is not present in settings", async function () {
            var options = await settings(testSettings)

            try {
                let response = await options.get("not.existent.attr")
            } catch (e) {
                chai.expect(e.message).to.equal("Not existent setting")
                return;
            }
            chai.assert.fail("Should throw error")
        })
    })
})