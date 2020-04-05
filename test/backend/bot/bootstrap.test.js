import { 
    storage 
} from "../../utils/chrome";

import bootstrap from "../../../src/service/bot/bootstrap"

import * as settings from "../../../src/service/bot/settings"
import * as robot from "../../../src/service/bot/robot"


describe("#bootstrap()", function () {
    var messages = {
        sent: []
    }
    var calledSettings = []
    var addedListeners = []
    var getterShouldReturn = true
    var hasStartBeenCalled = false

    beforeEach(function () {
        messages.sent = []
        calledSettings = []
        getterShouldReturn = true
        addedListeners = []
        hasStartBeenCalled = false
    })

    before(function () {
        window.chrome = {}
        chrome = {
            storage
        }
    });

    var fakeComm = {
        sendMessage: function (action, data) {
            messages.sent.push({
                action,
                data
            });
        }
    }

    settings.default = function (plugName) {
        return {
            get: function (attribute) {
                calledSettings.push({
                    type: "get",
                    plug: plugName,
                    attribute
                })
                return getterShouldReturn
            }
        }
    }

    robot.default = function (settings, plug, i) {
        return {
            addListener: (name, callback) => {
                addedListeners.push({
                    plug: i,
                    name,
                    hasCallback: typeof callback === 'function'
                })
            },
            start: () => {
                hasStartBeenCalled = true
            }
        }
    }

    const testObject = {
        Comm: fakeComm,
        plugs: {
            testplug: {
                enabled: true
            },
            otherplug: {
                enabled: false
            }
        },
        plugInstantiators: {
            testplug: function () {
                return {
                    init: function (settings) {
                        return {}
                    },
                    actions: {}
                }
            }
        }
    }

    context("Default checks", function () {
        it("Should load enabled plug without crashing", async function () {
            var checks = false
            try{
                checks = await bootstrap(testObject)
            } catch(e) {
                console.error("Bootstrapper error", e)
                chai.assert.fail("Error thrown during bootstrapping")
            }

            chai.expect(checks).to.have.property("testplug")
            chai.expect(addedListeners).to.be.lengthOf(4)
            chai.expect(addedListeners[0]).to.have.property("name", "error")
            chai.expect(addedListeners[0]).to.have.property("plug", "testplug")
            chai.expect(addedListeners[1]).to.have.property("name", "start")
            chai.expect(addedListeners[2]).to.have.property("name", "reboot")
            chai.expect(addedListeners[3]).to.have.property("name", "stop")
        });
    })
})