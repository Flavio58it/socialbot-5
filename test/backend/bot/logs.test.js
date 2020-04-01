import logs, { PlugLogger } from "../../../src/service/bot/logs";

describe("#logs()", function () {

    beforeEach(function () {
        logs.clearLogs()
        logs.clearEvent()
    })

    context ("@Logger", function () {
        it("Should insert logs and then get them in correct order", function () {
            logs.logError({
                id: "ERROR_TYPE",
                message: "Ugly error happened"
            })
    
            logs.logInfo({
                id: "INFO_HEY",
                message: "Just want to greet the user"
            })
    
            logs.logWarn({
                id: "WARN_FRIGHTEN",
                message: "Look behind you!"
            })
    
            const logList = logs.getLogs()
            
            chai.expect(logList).to.be.lengthOf(3)
            chai.expect(logList[0].data.id).to.equal("WARN_FRIGHTEN", "The first should be the warning")
            chai.expect(logList[0].type).to.equal("warn")
            chai.expect(logList[0].plug).to.not.exist
            chai.expect(logList[0].toRead).to.equal(true)
            chai.expect(logList[0].id).to.equal(3)
            chai.expect(logList[1].data.id).to.equal("INFO_HEY")
            chai.expect(logList[1].type).to.equal("info")
            chai.expect(logList[2].data.id).to.equal("ERROR_TYPE")
            chai.expect(logList[2].type).to.equal("error")
            chai.expect(logList[2].id).to.equal(1)
        })
    
        it ("Should insert two logs and set one as read", function () {
    
            logs.logError({
                id: "ERROR_TYPE 1",
                message: "Ugly error happened"
            })
    
            logs.logError({
                id: "ERROR_TYPE 2",
                message: "Ugly error happened"
            })
    
            const logListBefore = logs.getLogs()
    
            chai.expect(logListBefore).to.be.lengthOf(2)
            chai.expect(logListBefore[0].toRead).to.equal(true)
            chai.expect(logListBefore[1].toRead).to.equal(true)
    
            logs.setLogAsRead(2)
    
            const logListAfter = logs.getLogs()
    
            chai.expect(logListAfter[0].toRead).to.equal(false)
            chai.expect(logListAfter[1].toRead).to.equal(true)
        })
    
        it ("Should insert two logs and set both as read", function () {
    
            logs.logError({
                id: "ERROR_TYPE 1",
                message: "Ugly error happened"
            })
    
            logs.logError({
                id: "ERROR_TYPE 2",
                message: "Ugly error happened"
            })
    
            const logListBefore = logs.getLogs()
    
            chai.expect(logListBefore).to.be.lengthOf(2)
            chai.expect(logListBefore[0].toRead).to.equal(true)
            chai.expect(logListBefore[1].toRead).to.equal(true)
    
            logs.setLogAsRead()
    
            const logListAfter = logs.getLogs()
    
            chai.expect(logListAfter[0].toRead).to.equal(false)
            chai.expect(logListAfter[1].toRead).to.equal(false)
        })

        it ("Should trigger events", function () {
            const fakeError = sinon.fake()
            const fakeWarn = sinon.fake()
            const fakeInfo = sinon.fake()
            const fakeLog = sinon.fake()

            const fakeClear = sinon.fake()
            const fakeRead = sinon.fake()

            logs.attachEvent("error", fakeError)
            logs.attachEvent("warn", fakeWarn)
            logs.attachEvent("info", fakeInfo)
            logs.attachEvent("log", fakeLog)

            logs.attachEvent("clear", fakeClear)
            logs.attachEvent("read", fakeRead)

    
            logs.logError({
                id: "ERROR_TYPE",
                message: "Ugly error happened"
            })

            logs.logError({
                id: "ERROR_TYPE",
                message: "Ugly error happened"
            })
    
            logs.logWarn({
                id: "WARN",
                message: "Ugly error happened"
            })

            logs.logInfo({
                id: "INFO",
                message: "Ugly error happened"
            })

            chai.expect(fakeError.callCount).to.equal(2)
            chai.expect(fakeWarn.callCount).to.equal(1)
            chai.expect(fakeInfo.callCount).to.equal(1)
            chai.expect(fakeLog.callCount).to.equal(4)

            logs.setLogAsRead()

            chai.expect(fakeRead.callCount).to.equal(1)

            logs.clearLogs()

            chai.expect(fakeClear.callCount).to.equal(1)
        })
    
    })

    context ("@PlugLogger", function () {
        it("Should log under test plug", function () {
            const logger = new PlugLogger("test")

            logger.logError({
                id: "ERROR_TYPE 1",
                message: "Ugly error happened"
            })

            const logList = logs.getLogs()

            chai.expect(logList[0].id).to.equal(1)
            chai.expect(logList[0].data.id).to.equal("ERROR_TYPE 1")
            chai.expect(logList[0].plug).to.equal("test", "Should be test plug")
        })

        it("Should become default if plug is not specified", function () {
            const logger = new PlugLogger()

            logger.logError({
                id: "ERROR_TYPE 1",
                message: "Ugly error happened"
            })

            const logList = logs.getLogs()

            chai.expect(logList[0].id).to.equal(1)
            chai.expect(logList[0].data.id).to.equal("ERROR_TYPE 1")
            chai.expect(logList[0].plug).to.not.exist
        })

        it ("Should trigger events", function () {
            const logger = new PlugLogger("testplug")

            const fakeError = sinon.fake()
            const fakeLog = sinon.fake()

            logs.attachEvent("error", fakeError)
            logs.attachEvent("log", fakeLog)

    
            logger.logError({
                id: "ERROR_TYPE 1",
                message: "Ugly error happened"
            })
    
            logger.logError({
                id: "ERROR_TYPE 2",
                message: "Ugly error happened"
            })

            chai.expect(fakeError.callCount).to.equal(2)
            chai.expect(fakeLog.callCount).to.equal(2)
        })
    })
})