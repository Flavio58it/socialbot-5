export var webRequest = {
    onBeforeSendHeaders: {
        addListener: function (callback) {

        },
        removeListener: function () {

        }
    }
}

var fakeStorage = {}

export var storage = {
    local: {
        set: function(obj, cbk) {
            fakeStorage = obj;
            cbk();
        }, 
        get: function(name, cbk) {
            if (fakeStorage[name] === undefined)
                return cbk(name);
            cbk(fakeStorage[name]);
        }
    }
}