import comm from "./comm";

function install (Vue, options) {
	if (!options)
		var options = {}

	var _comm = new comm({name: options.name?options.name:"frontend"}), 
		callbacks = [];

	_comm.initReceiver(function(action, data){
		options.debug&&console.log("Received message... running callbacks: ", callbacks, action, data);
		callbacks.forEach(function(f){
			f.cbk.apply(f.context, [action, data]);
		})
	});

	Vue.prototype.$send = function(action, data){
		options.debug&&console.log("Sending message: ", action, data);
		_comm.send(action, data);
	}

	Vue.mixin({
		created: function (){
			var fun = this.$options.message;
			if (typeof fun == "function") {
				callbacks.push({cbk: fun, context: this});
				options.debug&&console.log("Callback added: ", fun);
			}
		},
		beforeDestroy: function (){
			var fun = this.$options.message;
			callbacks.forEach(function(aFun, i){
				if (fun && fun.toString() == aFun.cbk.toString()) {
					options.debug&&console.log("Callback removed: ", aFun);
					callbacks.splice(i, 1);
				}
			})
		}
	})
}

export default install;