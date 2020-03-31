class Logger {
    constructor (batchLength) {
        this.logs = []
        this.batchLength = batchLength || 10
    }

    logError (data) {
        console.error(data)
        this._pushLog("error", data)
    }

    logWarn (data) {
        console.warn(data)
        this._pushLog("warn", data)
    }

    logInfo (data) {
        console.info(data)
        this._pushLog("info", data)
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

    _pushLog (type, data) {
        this.logs.push({
            id: this.logs.length + 1,
            toRead: true,
            time: new Date(),
            type,
            data
        })
    }
}

export default new Logger()