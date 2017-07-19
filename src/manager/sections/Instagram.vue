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
									<div class="description">When a user unfollows you will be unfollowed back. (Whitelist applied)</div>
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
								<b>Like timer</b>
								<div class="description">The upper and lower limit for the like timer</div>
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
								<b>Pause timer</b>
								<div class="description">The time between one round and another</div>
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
						<b-tab title="Likes">
							<div>
								<b>
									Like conditions
								</b>
								<div class="description">
									Use pipes "|" to separate words or hashtags  
									<helper title="Like condition">
										<div>
											<p>This condition allows to select precisely what type of photos the bot will like based on image description.</p>
											<p>Examples: food|vegan|#veggie|#red|blue</p>
											<p>Here can be used hashtags and normal text. The pipe "|" char separates the text. Is sufficient that one of this words/sentences are present to trigger the like/unlike functionality.</p>
											<p>If you have previously liked a post it will not be unliked.</p>
										</div>
									</helper>
								</div>
							</div>
							<div class="row">
								<div class="col-6">
									 <b-form-select 
									 	v-model="settings.filters.likes.isInclusive" 
									 	:options="[
									 		{text: 'Include if', value: 'true'},
									 		{text: 'Exclude if', value: 'false'}
									 	]" 
									 	class="mb-3"/>
								</div>
								<div class="col-6">
									<b-form-input
										:textarea="true"
										v-model="settings.filters.likes.text"
									/>
								</div>
							</div>
							<div class="description">Like by the number of likes condition</div>
							<div class="row">
								<div class="col-6">
									 <b-form-select 
									 	v-model="settings.filters.likes.isInclusive" 
									 	:options="[
									 		{text: 'Include if', value: 'true'},
									 		{text: 'Exclude if', value: 'false'}
									 	]" 
									 	class="mb-3"/>
								</div>
								<div class="col-6">
									<b-form-input
										:textarea="true"
										v-model="settings.filters.likes.text"
									/>
								</div>
							</div>
							<div>
								<b>Like limit</b>
								<div class="description">Like limits per round of the bot</div>
							</div>
							<div class="row">
								<div class="col-4">
									Hashtag follower
									<b-form-input
										type="number"
										v-model="settings.limits.likes.tag"
									/>
								</div>
								<div class="col-4">
									Dashboard
									<b-form-input
										type="number"
										v-model="settings.limits.likes.dash"
									/>
								</div>
								<div class="col-4">
									Explore
									<b-form-input
										type="number"
										v-model="settings.limits.likes.explorer"
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
					<Tags v-model="settings.follow.tags"/>
				</div>
			</div>
			<hr/>
				<b>Followers manager</b>
				<div class="description">Here you can manage the your followers. </div>
				<FollowManager :type="type"/>
			<hr/>
			<div>
				<button @click="save" class="btn btn-primary btn-lg float-right save">Save</button>
			</div>
		</div>
		<Loading v-else/>
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
	import Loading from "components/Loading.vue";
	import Tags from "../Tags.vue";
	import Helper from "components/Helper.vue";
	import FollowManager from "../FollowManager.vue";

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
				return val;
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
			Loading,
			Tags,
			Helper,
			FollowManager
		}
	}
</script>