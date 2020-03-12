import robot from "../../../src/service/bot/robot";
import { simulateSetting } from "../../utils/settingsManager";
import { 
    webRequest 
} from "../../utils/chrome";

// **** Using instagram backend plugs for robot testing ****
import { createServer } from "../plugs/instagram/servers";

describe("#robot()", function () {
    var server = false;

    before(function () {
        window.chrome = {}
        chrome = {
            webRequest
        }

        server = createServer([
            "homepage_logged"
        ])
    });

    afterEach(function () {
        server = false;
    })

    it("Init without params", function () {
        chai.expect(() => new robot()).to.throw()
    });

    it("Disabled", function () {
        var bot = new robot(simulateSetting({
            enabled: false
        }), {
            init: () => {
                return Promise.resolve({logged: true})
            }
        });

        return new Promise((s, f) => {
            bot.addListener("stop", function (t, name) {
                s();
            });
            bot.start(true)
        });
    })

    it("Bot round - Check if all operations calls are performed based on all enabled settings", function () {    
        // Functions that represent all the operations performable by the bot (robot)
        var likeDashboard = sinon.fake();
        var followManager = sinon.fake();
        var likeBack = sinon.fake();
        var likeTagImages = sinon.fake();

        var bot = new robot(simulateSetting({
            enabled: true,
            follow: {
                tags: ["boom"]
            }
        }), {
            init: () => {
                return Promise.resolve({
                    logged: true,
                    domain: {
                        match: "",
                        res: ""
                    }
                })
            },
            actions: {
                likeDashboard,
                followManager,
                likeBack,
                likeTagImages
            }
        });

        return new Promise((s, f) => {
            bot.addListener("stop", function (t, name) {
                try{
                    chai.assert(likeDashboard.calledOnce, "likeDashboard")
                    chai.assert(followManager.calledOnce, "followManager")
                    chai.assert(likeBack.calledOnce, "likeBack")
                    chai.assert(likeTagImages.calledOnce, "likeTagImages")
                } catch(e) {
                    f(e);
                }

                s();
            });
            bot.start(true)
        });
    });

    it("Bot round - Check if all operations calls are not performed based on all disabled settings", function () {    
        var clock = sinon.useFakeTimers();

        // Functions that represent all the operations performable by the bot (robot)
        var likeDashboard = sinon.fake();
        var followManager = sinon.fake();
        var likeBack = sinon.fake();
        var likeTagImages = sinon.fake();

        var bot = new robot(simulateSetting({
            enabled: true,
            likeDash: false,
            likeBack: false,
            follow: {
                tags: []
            }
        }), {
            init: () => {
                return Promise.resolve({
                    logged: true,
                    domain: {
                        match: "",
                        res: ""
                    }
                })
            },
            actions: {
                likeDashboard,
                followManager,
                likeBack,
                likeTagImages
            }
        });

        return new Promise((s, f) => {
            bot.addListener("stop", function (t, name) {
                clock.restore();
                
                try{
                    chai.assert(!likeDashboard.called, "likeDashboard")
                    chai.assert(followManager.called, "followManager")
                    chai.assert(!likeBack.called, "likeBack")
                    chai.assert(!likeTagImages.called, "likeTagImages")
                } catch(e) {
                    f(e);
                }

                s();
            });
            bot.start(true)
        });
    })

    it("Should call directAction from inited plug and nothing else", function () {    
        var doSomething = sinon.fake(),
            doSomethingAction = sinon.fake();

        var bot = new robot(simulateSetting({
            enabled: true
        }), {
            init: () => {
                return Promise.resolve({
                    logged: true,
                    domain: {
                        match: "",
                        res: ""
                    }
                })
            },
            directActions: {
                doSomething
            },
            actions: {
                doSomethingAction
            }
        }, "test");

        return bot.directAction("doSomething", {data: false}).then(() => {
            chai.assert(doSomething.called, "Direct action")
            chai.assert(!doSomethingAction.called, "Normal action")
        })
    })

    it("Should throw error as directAction does not exist", function () {    
        var bot = new robot(simulateSetting({
            enabled: true
        }), {
            init: () => {
                return Promise.resolve({
                    logged: true,
                    domain: {
                        match: "",
                        res: ""
                    }
                })
            },
            directActions: {
                
            }
        }, "test");

        return bot.directAction("doSomething", {data: false}).then(() => {
            chai.assert.Throw("The function should not be called");
        }).catch((e) => {
            chai.expect(e).to.equal("Action not found")
        })
    })

    it("Init with fake plug, not logged", function () {
        var bot = new robot(simulateSetting({
            enabled: true
        }), {
            init: () => {
                return Promise.resolve({logged: false})
            }
        });

        return new Promise((s, f) => {
            bot.addListener("runstatus", function (t, name, data) {
                if (data && data.id == "LOGGED_OUT") {
                    s();
                }
            });
            bot.start(true)
        });
    })
});