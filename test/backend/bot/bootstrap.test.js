import bootstrap from "../../../src/service/bot/bootstrap"

describe("#bootstrap()", function () {
    var messages = {
        sent: []
    }

    var fakeComm = {
        sendMessage: function (action, data) {
            messages.sent.push({
                action,
                data
            });
        }
    }

    context("Default checks", function () {
        it("Should load enabled plugs without crashing", async function () {
            try{
                var checks = await bootstrap({Comm: fakeComm})

                // As by default the instagram bot is always used we will use it as default one
                chai.expect(checks).to.have.property("instagram")
            } catch(e) {
                console.error("Bootstrapper error", e)
                chai.assert.fail("Error thrown during bootstrapping")
            }
        });
    })
})