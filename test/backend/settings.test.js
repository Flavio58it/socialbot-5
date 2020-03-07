// Test settings implementation

import settings from "../../src/service/settings";

describe("#settings()", function () {
    it("The initialization returns correct attributes", async function () {
        chai.expect(settings).to.be.an("function")

        var options = await settings("instagram")

        chai.expect(options).to.be.an("object")
        chai.expect(options).to.have.property("get")
        chai.expect(options).to.have.property("set")

        var data = await options.getAll()

        chai.expect(data).to.be.an("object", "Get an the main instagram object as a whole")
    });

    context("set()", function () {
        it("Should set new instagram setting")
    })
})