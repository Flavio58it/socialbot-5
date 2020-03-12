import hash from "hash";

/**
 * Comm js
 * 
 * Connection creator between frontend and backend in chrome extension
 * 
 * The library stores all connections to frontend and manage the callbacks assigned to single connections filtered by name
 */

var connections = {}, 
	callbacks = {},
	events = {};

// Add listener when page is opened and an connection from frontend is attempted
chrome.runtime.onConnect.addListener(function(port) {
	console.log("PortName: " + compose(port))
	connections[compose(port)] = port;
	events.connection&& events.connection(port, connections)

	// Message event from frontend
	port.onMessage.addListener(function(message, sender){
		if (port.name && callbacks[port.name])
			callbacks[port.name](message.action, message.data);
		events.message&&events.message(message.action, message.data, false)
	});

	// On disconnect event
	port.onDisconnect.addListener(function(){
		console.warn("The port is disconnected: ", port);
		delete connections[compose(port)];
		events.disconnection&& events.disconnection(port, connections);
	})
})

function compose (port) { // Create unique id for the ports object
	return hash((port.sender.frameId || "none") + port.sender.url + (port.name || "none"));
}

export default {
	// Listen to a message from frontend
	listen (name, cbk) {
		callbacks[name] = cbk;
	},
	// Send message to frontend connection based on action name
	sendMessage (action, obj) {
		for (var connectionId in connections) {
			connections[connectionId].postMessage({
				action: action,
				data: obj
			});
		}
	},
	onConnect (cbk) {
		events.connection = cbk;
	},
	onDisconnect (cbk) {
		events.disconnection = cbk;
	},
	// Get connection lists
	getConnections () {
		return connections;
	},
	// Simulate a message from frontend and execute an action
	injectMessage (port, action, data) {
		callbacks[port](action, data);
		events.message&&events.message(action, data, true)
	}
}