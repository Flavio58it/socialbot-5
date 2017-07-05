/**
*  -- Frontend communication library --
*  
*  
**/

export default function (settings){
	var t = this, messenger = false, receiver = false;

	t.initReceiver = function(cbk){
		receiver = cbk;
	}

	t.send = function (action, data) {
		messenger.postMessage({
			action: action,
			data: data
		});
	}

	messenger = chrome.runtime.connect({name: settings.name});

	messenger.onMessage.addListener(function(data){
		receiver(data.action, data.data);
	});
}