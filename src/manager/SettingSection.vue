<template>
	<div class="container">
		<div v-if="status.rebooting">
			<Loading/>
			<div class="text-center">Rebooting. Please wait.</div>
			<div v-if="waiting.showMessage" class="text-center waitMessage"><b>Waiting for timers to expire...</b></div>
		</div>
		<div v-else-if="settings">
			<slot :settings="settings" name="left" :stats="serverData.stats" :running="status.running"/>
			<div class="saveContainer">
				<button @click="save" class="btn btn-primary btn-lg float-right save btn-center" title="Save and restart the bot">Save</button>
			</div>
		</div>
		<Loading v-else/>
	</div>
</template>

<style lang="scss">
	.save {width: 200px;}
	.description {
		font-size: $font-small;
	}
	.tab-pane {
		padding: $spacer;
		background-color: white;
		border: 1px solid #ddd;
		border-top: 0;
	}

	.statusTab {
		background-color: white;
		padding: $spacer;
		margin: 10px;
		border: 1px solid #ddd;
	}

	.waitMessage {
		padding: 10px;
	}

	.saveContainer {
		margin-top: 15px;
	}
</style>

<script>
	import Loading from "components/Loading.vue";
	import FollowManager from "./FollowManager.vue";
	

	export default {
		props: [
			"plug", 
			"settings"
		],
		data () {
			return {
				serverData: false,
				waiting: {
					id: false,
					showMessage: false
				}
			}
		},
		message (action, data) {
			if (action == "settings" && data.plug == this.plug && data.status)
				this.status = data.status;
		},
		mounted () {
			this.$send("getSettings", {plug: this.plug});
		},
		message (action, data) {
			if (data.plug != this.plug)
				return;
			if (action == "settings") {
				console.log("Received settings data: ", data);
				this.$emit("update:settings", data.settings);
				this.serverData = data;
				this.$emit("loaded");
			} else if (action == "statusUpdate")
				this.status = data.status;
		},
		watch: {
			"status.rebooting": function (status) {
				var t = this;
				if (status === true) {
					t.waiting.id = setTimeout(function () {
						t.waiting.showMessage = true;
					}, 5000)
				} else {
					if (t.waiting.id) {
						clearTimeout(t.waiting.id)
						t.waiting.id = false;
					}
					t.waiting.showMessage = false;
				}
			}
		},
		methods: {
			save () {
				this.status = {rebooting: true};
				this.$send("saveSettings", {
					plug: this.plug, 
					settings: this.settings
				});
			}
		},
		computed: {
			status: function () {
				return this.serverData?this.serverData.status:false
			}
		},
		components: {
			Loading,
			FollowManager
		}
	}
</script>