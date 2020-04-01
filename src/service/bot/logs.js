class Logger {
    constructor (batchLength) {
        this.logs = []
        this.batchLength = batchLength || 10
    }

    logError (data, plug) {
        console.error(data)
        this._pushLog("error", data, plug)
    }

    logWarn (data, plug) {
        console.warn(data)
        this._pushLog("warn", data, plug)
    }

    logInfo (data, plug) {
        console.info(data)
        this._pushLog("info", data, plug)
    }

    getLogs (startPoint = 0) {
        const logs = [...this.logs]
        return logs.reverse().slice(startPoint, startPoint + this.batchLength)
    }

    setLogAsRead (id = false) {
        const logsLen = this.logs.length

        for (let i = 0; i < logsLen; i++) {
            if (this.logs[i].id === id || id === false) {
                this.logs[i].toRead = false
                if (id !== false)
                    break
            }
        }
    }

    clearLogs () {
        this.logs = []
    }

    _pushLog (type, data, plug) {
        this.logs.push({
            id: this.logs.length + 1,
            toRead: true,
            plug,
            time: new Date(),
            type,
            data
        })
    }
}

const mainLogger = new Logger()

class PlugLogger {
    constructor (plugName) {
        this.plug = plugName
    }

    logError (data) {
        mainLogger.logError(data, this.plug)
    }

    logWarn (data) {
        mainLogger.logWarn(data, this.plug)
    }

    logInfo (data) {
        mainLogger.logInfo(data, this.plug)
    }
}

export {
    mainLogger as default,
    PlugLogger
}
