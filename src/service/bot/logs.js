class Logger {

    /**
     * 
     * @param {Number} batchLength Set length of logs sent for each batch
     */

    constructor (batchLength) {
        this.logs = []
        this.batchLength = batchLength || 10
        this.events = {}
    }

    /**
     * 
     * @param {Object} data Specific error data. Formerly id and error object/verbose message
     * @param {String} plug Plug name
     */

    logError (data, plug) {
        console.error(data)
        this._pushLog("error", data, plug)
    }

    /**
     * 
     * @param {Object} data Specific warning data
     * @param {String} plug Plug name
     */

    logWarn (data, plug) {
        console.warn(data)
        this._pushLog("warn", data, plug)
    }
    
    /**
     * 
     * @param {Object} data Specific info data
     * @param {String} plug Plug name
     */

    logInfo (data, plug) {
        console.info(data)
        this._pushLog("info", data, plug)
    }

    /**
     * 
     * @param {Number} startPoint Starting point for logs to be sent. Used for pagination
     */

    getLogs (startPoint = 0) {
        const logs = [...this.logs]
        return logs.reverse().slice(startPoint, startPoint + this.batchLength)
    }

    /**
     * Generic function to set log or logs as read. Leave empty the id param to clear all notifications
     * @param {Number} id ID of log to clear
     */

    setLogAsRead (id = false) {
        const logsLen = this.logs.length

        for (let i = 0; i < logsLen; i++) {
            if (this.logs[i].id === id || id === false) {
                this.logs[i].toRead = false
                if (id !== false)
                    break
            }
        }

        this._emit("read", id)
    }

    /**
     * Remove all logs from list
     */

    clearLogs () {
        this.logs = []

        this._emit("clear")
    }

    /**
     * Attach an event to various parts of log flow
     * @param {String} eventName 
     * Name of event. Can be: 
     * * log - Generic log event applied to all logs
     * * error - Error log
     * * warn - Warning log
     * * info - Info log
     * * read - A log or all logs has been set as read
     * * clear - Clear all notifications
     * @param {Function} callback Function to execute on event
     */

    attachEvent (eventName, callback) {
        this.events[eventName] = callback
    }

    /**
     * 
     * @param {String} eventName Name of event to be removed. If empty will remove all
     */

    clearEvent (eventName = false) {
        if (eventName && this.events[eventName])
            delete this.events[eventName]
        else
            this.events = []
    }

    /**
     * *Internal*
     * Trigger event if present
     * 
     * @param {String} event Event to be triggered
     * @param {Object} data Data passed to callback
     */

    _emit (event, data) {
        if (this.events[event])
            this.events[event](data)
    }

    /**
     * *Internal*
     * 
     * @param {String} type 
     * Type of log that is passed. Can be
     * * Error
     * * Warn
     * * Info
     * @param {Object} data Object passed to log in
     * @param {String} plug Optional parameter to pass the plug where the event happened
     */

    _pushLog (type, data, plug) {
        this.logs.push({
            id: this.logs.length + 1,
            toRead: true,
            plug,
            time: new Date(),
            type,
            data
        })

        this._emit(type, data)
        this._emit("log", data)
    }
}

const mainLogger = new Logger()

class PlugLogger {
    /**
     * Helper class that will log all events directly in the corrispondent plug namespace
     * This helper does have limited methods. For all functionalities use the master class.
     * 
     * @param {String} plugName Name of plug where the logs happen
     */

    constructor (plugName) {
        this.plug = plugName
    }

    /**
     * 
     * @param {Object} data Specific error data. Formerly id and error object/verbose message
    */

    logError (data) {
        mainLogger.logError(data, this.plug)
    }

    /**
     * 
     * @param {Object} data Specific warn data
    */

    logWarn (data) {
        mainLogger.logWarn(data, this.plug)
    }

    /**
     * 
     * @param {Object} data Specific info data
    */

    logInfo (data) {
        mainLogger.logInfo(data, this.plug)
    }
}

export {
    mainLogger as default,
    PlugLogger
}
