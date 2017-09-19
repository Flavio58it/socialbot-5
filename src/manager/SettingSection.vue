<template>
	<div class="container">
		<div v-if="status.rebooting">
			<Loading/>
			<div class="text-center">Rebooting. Please reload after a couple of seconds.</div>
		</div>
		<div v-else-if="settings">
			<div class="row">
				<div class="col">
					<slot :settings="settings" name="left"/>
				</div>
				<div class="col">
					<b>Tags follower</b>
					<div class="description">These tags will be periodically checked and the new posts will be liked</div>
					<hr/>
					<Tags v-model="settings.follow.tags"/>
				</div>
			</div>
			<div>
				<button @click="save" class="btn btn-primary btn-lg float-right save" title="Save and restart the bot">Save</button>
			</div>
			<div  class="clearfix"/>
			<hr/>
			<b>Followers manager</b>
			<div class="description">Here you can manage the your followers. </div>
			<FollowManager :type="type"/>
		</div>
		<Loading v-else/>
	</div>
</template>

<style lang="scss" scoped>
	.save {width: 200px;}
</style>

<script>
	import Loading from "components/Loading.vue";
	import Tags from "./Tags.vue";
	import FollowManager from "./FollowManager.vue";

	export default {
		props: ["type", "settings"],
		data () {
			return {
				status: false
			}
		},
		message (action, data) {
			if (action == "settings" && data.type == this.type && data.status)
				this.status = data.status;
		},
		mounted () {
			this.$send("getSettings", {type: this.type});
		},
		message (action, data) {
			if (action == "settings" && data.type == this.type) {
				console.log("Received settings data: ", data);
				this.$emit("update:settings", data.settings);
				this.status = data.status;
				this.$emit("loaded");
			}
		},
		methods: {
			save () {
				this.$send("saveSettings", {
					type: this.type, 
					settings: this.settings
				});
			}
		},
		components: {
			Loading,
			FollowManager,
			Tags
		}
	}
</script>