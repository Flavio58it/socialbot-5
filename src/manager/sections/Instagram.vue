<template>
	<div class="container">
		<div v-if="settings">
			<div class="row">
				<div class="col">
					<b-tabs>
						<b-tab title="General">
							<div>
								<b-form-checkbox v-model="settings.enabled">
									<b>Bot enabled</b>
									<div class="description">Enable the bot</div>
								</b-form-checkbox>
							</div>
							<div>
								<b-form-checkbox v-model="settings.notifications">
									Notifications
									<div class="description">Show notifications on desktop</div>
								</b-form-checkbox>
							</div>
							<div>
								<b-form-checkbox v-model="settings.likeDash">
									Like dashboard
									<div class="description">Like the images from your dashboard</div>
								</b-form-checkbox>
							</div>
							<div>
								<b-form-checkbox v-model="settings.followBack">
									Followback
									<div class="description">Follow back the people who follows you (Blacklist applied)</div>
								</b-form-checkbox>
							</div>
							<div>
								<b-form-checkbox v-model="settings.unFollowBack">
									UnFollowback
									<div class="description">When a user unfollows you, will be unfollowed back. (Whitelist applied)</div>
								</b-form-checkbox>
							</div>
							<div>
								<b-form-checkbox v-model="settings.likeBack">
									LikeBack
									<div class="description">When a user likes a photo of yours the bot will like a couple of theirs. (Blacklist applied)</div>
								</b-form-checkbox>
							</div>
						</b-tab>
						<b-tab title="Timings">
							<div>
								<label>
									<b>Like timer</b>
									<div class="description">The upper and lower limit for the like timer</div>
								</label>
							</div>
							<div class="row">
								<div class="col-4">
									From (seconds)
									<b-form-input
										type="number"
										:formatter="checkLowerLimitValid"
										v-model="settings.waiter.actionLower"
										lazy-formatter
									/>
								</div>
								<div class="col-4">
									To (seconds)
									<b-form-input
										type="number"
										:formatter="checkUpperLimitValid"
										v-model="settings.waiter.actionUpper"
										lazy-formatter
									/>
								</div>
								<div class="col-4">
									
								</div>
							</div>
							<hr/>
							<div>
								<label>
									<b>Pause timer</b>
									<div class="description">The time between one round and another</div>
								</label>
							</div>
							<div class="row">
								<div class="col-6">
									Time (minutes)
									<b-form-input
										type="number"
										v-model="settings.waiter.roundPause"
									/>
								</div>
							</div>
						</b-tab>
					</b-tabs>
				</div>
				<div class="col">
					<b>Tags follower</b>
					<div class="description">These tags will be periodically checked and the new posts will be liked</div>
					<hr/>
					<Tags v-model="settings.followTags"/>
				</div>
			</div>
			<hr/>
			<div>
				<button @click="save" class="btn btn-primary btn-lg float-right save">Save</button>
			</div>
		</div>
		<div v-else>
			Loading...
		</div>
	</div>
</template>

<style lang="scss" scoped>
	.description {
		font-size: $font-small;
	}
	.save {width: 200px;}
	.tab-pane {
		padding: $spacer;
		background-color: white;
		border: 1px solid #ddd;
		border-top: 0;
	}
</style>

<script>
	import Tags from "../Tags.vue";

	export default {
		data () {
			return {
				type: "instagram",
				settings: false
			}
		},
		message (action, data) {
			if (action == "settings" && data.type == this.type) {
				console.log("Received settings data: ", data);
				this.settings = data.settings;
			}
		},
		mounted () {
			this.$send("getSettings", {type: this.type});
		},
		methods: {
			checkUpperLimitValid (val) {
				if (val < this.settings.waiter.actionLower + 10)
					return this.settings.waiter.actionLower + 10;
			},
			checkLowerLimitValid (val) {
				return (val < 10)?10:val;
			},
			save () {
				this.$send("saveSettings", {
					type: this.type, 
					settings: this.settings
				});
			}
		},
		components: {
			Tags
		}
	}
</script>