import hash from "hash";

var connections = {}, 
	callbacks = {},
	events = {};

chrome.runtime.onConnect.addListener(function(port) {
	console.log("PortName: " + compose(port))
	connections[compose(port)] = port;
	events.connection&& events.connection(port, connections)

	port.onMessage.addListener(function(message, sender){
		if (port.name && callbacks[port.name])
			callbacks[port.name](message.action, message.data);
		events.message&&events.message(message.action, message.data, false)
	});

	port.onDisconnect.addListener(function(){
		console.warn("The port is disconnected: ", port);
		delete connections[compose(port)];
		events.disconnection&& events.disconnection(port, connections);
	})
})

function compose (port) { // Create unique id for the ports object
	return hash((port.sender.frameId||"none") + port.sender.url + (port.name||"none"));
}

export default {
	listen (name, cbk) {
		callbacks[name] = cbk;
	},
	sendMessage (action, obj) {
		for (var connectionId in connections) {
			connections[connectionId].postMessage({
				action: action,
				data: obj
			})
		}
	},
	onConnect (cbk) {
		events.connection = cbk;
	},
	onDisconnect (cbk) {
		events.disconnection = cbk;
	},
	getConnections () {
		return connections;
	},
	injectMessage (port, action, data) {
		callbacks[port](action, data);
		events.message&&events.message(action, data, true)
	}
}