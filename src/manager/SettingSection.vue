<template>
	<div class="container">
		<div v-if="status.rebooting">
			<Loading/>
			<div class="text-center">Rebooting. Please wait.</div>
		</div>
		<div v-else-if="settings">
			<div class="row">
				<div class="col">
					Running: {{status.running}}
				</div>
			</div>
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
			<div>
				<b>Followers manager</b>
				<Helper title="Followers manager">
					<p>With this tool you can see the overall situation of the your account.</p>
					<p>You can filter by name and the user situation towards you and then perform actions</p>

					<hr/>
					<b>Badges:</b>
					<div>
						<div><b-badge variant="success">Follower</b-badge> - The user is following you</div>
						<div><b-badge variant="danger">Follower</b-badge> - The user is NOT following you</div>
						<div><b-badge variant="info">Followback</b-badge> - You are following him back</div>
						<div><b-badge variant="warning">Following</b-badge> - You are following him (and he is not following you)</div>
					</div>
				</Helper>
			</div>
			<div class="description">Here you can manage your followers.</div>
			<!-- <FollowManager :plug="plug"/> -->
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
</style>

<script>
	import Loading from "components/Loading.vue";
	import Tags from "./Tags.vue";
	import FollowManager from "./FollowManager.vue";
	import Helper from "components/Helper.vue";

	export default {
		props: [
			"plug", 
			"settings"
		],
		data () {
			return {
				status: false
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
				this.status = data.status;
				this.$emit("loaded");
			} else if (action == "statusUpdate")
				this.status = data.status;
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
		components: {
			Loading,
			FollowManager,
			Tags,
			Helper
		}
	}
</script>