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
									<div class="description">Follow back the people who follows you</div>
								</b-form-checkbox>
							</div>
							<div>
								<b-form-checkbox v-model="settings.unFollowBack">
									UnFollowback
									<div class="description">When a user unfollows you will be unfollowed back. (Whitelist applied)</div>
								</b-form-checkbox>
							</div>
							<div>
								<b-form-checkbox v-model="settings.likeBack.enabled">
									LikeBack 
									<helper title="LikeBack">
										The bot will check if the user has been liked in the last 20 days. If no, it will like a couple photos randomly in the user's dashboard.
									</helper>
									<div class="description">When a user likes a photo of yours the bot will like a couple of theirs.</div>
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
											<p>Here can be used hashtags and normal text. The pipe "|" char separates the text. Is sufficient that one of this words/sentences are present to trigger the like/skip functionality.</p>
											<p>If you have previously liked a post it will not be unliked.</p>
											<p>This filter will apply to all like actions (tags/dashboard/likeback)</p>
										</div>
									</helper>
								</div>
							</div>
							<div class="row">
								<div class="col-4">
									 <b-form-select 
									 	v-model="settings.filters.likes.isTextInclusive" 
									 	:options="[
									 		{text: 'Include if', value: 'true'},
									 		{text: 'Exclude if', value: 'false'}
									 	]" 
									 	class="mb-3"/>
								</div>
								<div class="col-8">
									<b-form-input
										:textarea="true"
										v-model="settings.filters.likes.text"
									/>
								</div>
							</div>

							<div class="description">Like by the number of likes condition (0 is disabled)</div>
							<div class="row">
								<div class="col-3">
									 <b-form-select 
									 	v-model="settings.filters.likes.isLikeNumberInclusive"
									 	:options="[
									 		{text: 'Include if', value: 'true'},
									 		{text: 'Exclude if', value: 'false'}
									 	]" 
									 	class="mb-3"/>
								</div>
								<div class="col-4">
									 <b-form-select 
									 	v-model="settings.filters.likes.isLikeNumberMoreLess" 
									 	:options="[
									 		{text: 'More than', value: 'true'},
									 		{text: 'Less than', value: 'false'}
									 	]" 
									 	class="mb-3"/>
								</div>
								<div class="col-5">
									<b-form-input
										type="number"
										v-model="settings.filters.likes.isLikeNumber"
									/>
								</div>
							</div>
							<div class="row">
								<div class="col-6">
									<div class="description">
										AI Setting <b>HIGHLY EXPERIMENTAL</b>
										<helper title="Artificial Intelligence Setting">
											<div>
												Like if AI has approved the image in the selected category 

												<p>Please note that the AI will cover all the normal cases with only tiny margin of error. If the image is messed up (strong contrast, messed color balance, white stripes) the "brain" will have problems to understand what is going on and the correct result is not ensured.</p>
											</div>
										</helper>
									</div>
									 <b-form-select 
									 	v-model="settings.filters.likes.brain" 
									 	:options="[
									 		{text: 'Disabled', value: false},
									 		{text: 'Landscape (Nature)', value: 'landscape'},
									 		{text: 'People (selfies etc.)', value: 'people'},
									 		{text: 'Arhitecture (cities/streets)', value: 'arhitecture'}
									 	]" 
									 	class="mb-3"/>
								</div>
								<div v-if="settings.filters.likes.brain" class="col-6">
									<div class="description">
										AI Fallback
									</div>
									 <b-form-select 
									 	v-model="settings.filters.likes.brainFallback" 
									 	:options="[
									 		{text: 'Do not like', value: false},
									 		{text: 'Like anyway', value: true}
									 	]" 
									 	class="mb-3"/>
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
									Explore <helper title="Explore">The section listing the people that you don't follow but you may like</helper>
									<b-form-input
										type="number"
										v-model="settings.limits.likes.explorer"
									/>
								</div>
							</div>
							<div>
								<b>Other</b>
							</div>
							<div class="row">
								<div class="col">
									<b-form-checkbox v-model="settings.filters.likes.videos">
										Like videos
										<div class="description">Like also if the post is a video</div>
									</b-form-checkbox>
								</div>
							</div>
						</b-tab>
						<b-tab title="Follow">
							<div>
								<b>Follow conditions</b>
								<div class="description">Leave the filter to 0 to disable it.</div>
							</div>
							<div class="row">
								<div class="description col-12">Filter by user followers number</div>
								<div class="col-6">
									<b-form-select 
									 	v-model="settings.filters.follow.followers.more"
									 	:options="[
									 		{text: 'More than', value: 'true'},
									 		{text: 'Less than', value: 'false'}
									 	]" 
									 	:disabled="followConditionsMode == 'ratio'"
									 	class="mb-3"
									/>
								</div>
								<div class="col-6">
									<b-form-input
										type="number"
										:disabled="followConditionsMode == 'ratio'"
										@input="followFilterManager()"
										:formatter="toDefault"
										lazy-formatter
										v-model="settings.filters.follow.followers.number"
									/>
								</div>
							</div>
							<div class="row">
								<div class="description col-12">Filter by user following number</div>
								<div class="col-6">
									<b-form-select 
									 	v-model="settings.filters.follow.following.more"
									 	:options="[
									 		{text: 'More than', value: 'true'},
									 		{text: 'Less than', value: 'false'}
									 	]" 
									 	:disabled="followConditionsMode == 'ratio'"
									 	class="mb-3"
									/>
								</div>
								<div class="col-6">
									<b-form-input
										type="number"
										:disabled="followConditionsMode == 'ratio'"
										@input="followFilterManager()"
										:formatter="toDefault"
										lazy-formatter
										v-model="settings.filters.follow.following.number"
									/>
								</div>
							</div>
							<div class="row">
								<div class="col-12">
									<span class="description">Filter by user following ratio</span>
									<helper title="Following ratio filter">
										<p>This filter will allow to follow only the users above a follower/following ratio.</p>
										<p></p>
										<p>Putting 0 will disable this filter and enable the other ones.</p>
									</helper>
								</div>
								<div class="col-4">
									<b-form-input
										type="number"
										@input="followFilterManager()"
										:disabled="followConditionsMode == 'fixed'"
										:formatter="toDefault"
										lazy-formatter
										v-model="settings.filters.follow.ratio"
									/>
								</div>
							</div>
						</b-tab>
						<b-tab v-if="settings.likeBack.enabled" title="LikeBack">
							<div>
								<b>Ignore time</b>
								<div class="description">After you have liked back a user wait before liking his dashboard again [days]</div>
							</div>
							<div class="row">
								<div class="col-4">
									<b-form-input
										type="number"
										v-model="settings.likeBack.ignoreTime"
									/>
								</div>
							</div>
							<div>
								<b>Likes number</b>
								<div class="description">How much photos to like per user. If less photos are available will stop automatically.</div>
							</div>
							<div class="row">
								<div class="col-4">
									<b-form-input
										type="number"
										v-model="settings.likeBack.likes"
									/>
								</div>
							</div>
							<div>
								<b>Managed users per round</b>
								<div class="description">How much users to like per round. The missing users will be managed in the next one.</div>
							</div>
							<div class="row">
								<div class="col-4">
									<b-form-input
										type="number"
										v-model="settings.likeBack.maxUsersLike"
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
			<div>
				<button @click="save" class="btn btn-primary btn-lg float-right save">Save</button>
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
				followConditionsMode: false,
				settings: false
			}
		},
		message (action, data) {
			if (action == "settings" && data.type == this.type) {
				console.log("Received settings data: ", data);
				this.settings = data.settings;
				this.followFilterManager(); // Update the inputs
			}
		},
		mounted () {
			this.$send("getSettings", {type: this.type});
		},
		methods: {
			checkUpperLimitValid (val) {
				if (val <= parseInt(this.settings.waiter.actionLower) + 10)
					return parseInt(this.settings.waiter.actionLower) + 10;
				return val;
			},
			checkLowerLimitValid (val) {
				return (val < 3)?3:val;
			},
			toDefault (val){
				if (val == "" || parseInt(val) < 0)
					return "0";
				return val;
			},
			followFilterManager(){
				if (this.settings.filters.follow.following.number == 0 && this.settings.filters.follow.followers.number == 0 && this.settings.filters.follow.ratio == 0){
					this.followConditionsMode = false;
					return;
				}
				this.followConditionsMode = (this.settings.filters.follow.following.number || this.settings.filters.follow.followers.number)?"fixed":"ratio";
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