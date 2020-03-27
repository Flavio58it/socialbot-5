import Comm from "./bot/comm";

import bootstrap from './bot/bootstrap'
import frontendComm from './bot/frontendComm'

// Get enabled plugs list
import plugs from "./plugs";

let error = false

async function starter() {
	// Start bot
	const plugsInstances = await bootstrap({
		Comm,
		plugs
	})

	// Initialize communication hub
	const frontComm = new frontendComm({
		Comm,
		plugsInstances
	})

	// Link communication between control panel and backend.
	Comm.listen("manager", (actions, data) => frontComm.event(actions, data));
}

starter()