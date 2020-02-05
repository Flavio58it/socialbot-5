<template>
	<SettingSection
		:plug="type" 
		:settings.sync="settings"
		@loaded="followFilterManager"
	>
			<template v-slot:left="data">
				<b-tabs>
					<b-tab title="Status">
						<div class="row">
							<div class="col-6">
								<b-form-checkbox v-model="data.settings.enabled">
									<b>Bot enabled</b>
									<div class="description">Enable the bot</div>
								</b-form-checkbox>
							</div>
							<div class="col-6 showStatus">
								Status: <i :class="{'fa':true, 'fa-thumbs-up': data.running, 'fa-thumbs-down': !data.running}"/>
							</div>
						</div>
					</b-tab>
					<b-tab title="Timings & rates">
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
									v-model="data.settings.waiter.actionLower"
									lazy-formatter
								/>
							</div>
							<div class="col-4">
								To (seconds)
								<b-form-input
									type="number"
									:formatter="checkUpperLimitValid"
									v-model="data.settings.waiter.actionUpper"
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
									v-model="data.settings.waiter.roundPause"
								/>
							</div>
						</div>
						<hr/>
						<div>
							<b>Like Rates</b>
							<div class="description">Limit hourly, daily and monthly rates in order to avoid instagram limitations</div>
						</div>
						<div class="row">
							<div class="col-4">
								Hourly
								<b-form-input
									type="number"
									v-model="data.settings.limits.rate.perHour"
								/>
							</div>
							<div class="col-4">
								Daily
								<b-form-input
									type="number"
									v-model="data.settings.limits.rate.perDay"
								/>
							</div>
							<div class="col-4">
								Monthly
								<b-form-input
									type="number"
									v-model="data.settings.limits.rate.perMonth"
								/>
							</div>
						</div>
					</b-tab>
					<b-tab title="Likes">
						<b>
							Like options
						</b>
						<b-form-checkbox v-model="data.settings.likeDash">
							Like dashboard
							<div class="description">Like the images from your dashboard</div>
						</b-form-checkbox>
						<div>
							<b>
								Like conditions
							</b>
							<div class="description">
								Select images to like basing on content of description
								<helper title="Like condition">
									<div>
										<p>This condition allows to select precisely what type of photos the bot will like basing on image description.</p>
										<p>Click on the gear and insert text, hashtags or regex filters.</p>
										<p>If you have previously liked a post it will not be unliked.</p>
										<p>This filter will apply to tags/dashboard like actions</p>
									</div>
								</helper>
							</div>
						</div>
						<div class="row">
							<div class="col-4">
								 <b-form-select 
								 	v-model="data.settings.filters.likes.isTextInclusive" 
								 	:options="[
								 		{text: 'Include if', value: true},
								 		{text: 'Exclude if', value: false}
								 	]" 
								 	class="mb-3"/>
							</div>
							<FilterOptions class="col-8" v-model="data.settings.filters.likes.textFilters"/>
						</div>

						<div class="description">Like by the number of likes condition (0 is disabled)</div>
						<div class="row">
							<div class="col-3">
								 <b-form-select 
								 	v-model="data.settings.filters.likes.isLikeNumberInclusive"
								 	:options="[
								 		{text: 'Include if', value: true},
								 		{text: 'Exclude if', value: false}
								 	]" 
								 	class="mb-3"/>
							</div>
							<div class="col-4">
								 <b-form-select 
								 	v-model="data.settings.filters.likes.isLikeNumberMoreLess" 
								 	:options="[
								 		{text: 'More than', value: true},
								 		{text: 'Less than', value: false}
								 	]" 
								 	class="mb-3"/>
							</div>
							<div class="col-5">
								<b-form-input
									type="number"
									v-model="data.settings.filters.likes.isLikeNumber"
								/>
							</div>
						</div>
						<div class="row" v-if="false">
							<div class="col-12">
								<div class="description">
									AI Setting
									<helper title="Artificial Intelligence Setting">
										<div>
											<p>Like if AI has approved the image in the selected category</p>
											<p>Please note that the AI will cover all the normal cases with only tiny margin of error. If the image is messed up (strong contrast, messed color balance, white stripes) the correct result is not ensured.</p>
										</div>
									</helper>
								</div>
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
									v-model="data.settings.limits.likes.tag"
								/>
							</div>
							<div class="col-4">
								Dashboard
								<b-form-input
									type="number"
									v-model="data.settings.limits.likes.dash"
								/>
							</div>
							<div class="col-4" v-if="dev">
								Explore <helper title="Explore">The section listing the people that you don't follow but you may like</helper>
								<b-form-input
									type="number"
									v-model="data.settings.limits.likes.explorer"
								/>
							</div>
						</div>
						<div>
							<b>Other</b>
						</div>
						<div class="row">
							<div class="col">
								<b-form-checkbox v-model="data.settings.filters.likes.videos">
									Like videos
									<div class="description">Like also if the post is a video</div>
								</b-form-checkbox>
							</div>
						</div>
					</b-tab>
					<b-tab title="LikeBack">
						<div>
							<b-form-checkbox v-model="data.settings.likeBack.enabled">
								LikeBack 
								<helper title="LikeBack">
									<p>When a user like one of the your images the bot will check their gallery and like back a couple of images.</p>
									<p>In order to not over-like a user who likes more than one of your photos a control will be performed. If the user has been already liked by the bot in the last {{settings.likeBack.ignoreTime}} days will be skipped.</p>
								</helper>
								<div class="description">When a user likes a photo of yours the bot will like a couple of theirs.</div>
							</b-form-checkbox>
							<b-form-checkbox v-model="data.settings.likeBack.useLikeFilters">
								Enable likes filter
								<div class="description">Filter LikeBack operations with same filters as normal likes</div>
							</b-form-checkbox>
						</div>
						<div>
							<b>Ignore time</b>
							<div class="description">After you have liked back a user wait before liking his dashboard again [days]</div>
						</div>
						<div class="row">
							<div class="col-4">
								<b-form-input
									type="number"
									v-model="data.settings.likeBack.ignoreTime"
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
									v-model="data.settings.likeBack.likes"
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
									v-model="data.settings.likeBack.maxUsersLike"
								/>
							</div>
						</div>
					</b-tab>
					<b-tab title="Follow">
						<b>Follow options</b>
						<div>
							<b-form-checkbox v-model="data.settings.followBack">
								Followback
								<div class="description">Follow back the people who follows you (Blacklist applied)</div>
							</b-form-checkbox>
						</div>
						<div>
							<b-form-checkbox v-model="data.settings.unFollowBack">
								UnFollowback
								<div class="description">When a user unfollows you will be unfollowed back. (Whitelist applied)</div>
							</b-form-checkbox>
						</div>
						<div>
							<b>Follow conditions</b>
							<div class="description">Leave the filter to 0 to disable it.</div>
						</div>
						<div class="row">
							<div class="description col-12">Filter by user followers number</div>
							<div class="col-6">
								<b-form-select 
								 	v-model="data.settings.filters.follow.followers.more"
								 	:options="[
								 		{text: 'More than', value: true},
								 		{text: 'Less than', value: false}
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
									v-model="data.settings.filters.follow.followers.number"
								/>
							</div>
						</div>
						<div class="row">
							<div class="description col-12">Filter by user following number</div>
							<div class="col-6">
								<b-form-select 
								 	v-model="data.settings.filters.follow.following.more"
								 	:options="[
								 		{text: 'More than', value: true},
								 		{text: 'Less than', value: false}
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
									v-model="data.settings.filters.follow.following.number"
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
									v-model="data.settings.filters.follow.ratio"
								/>
							</div>
						</div>
					</b-tab>
				</b-tabs>
		</template>
	</SettingSection>
</template>

<style lang="scss" scoped>
	.showStatus {
		line-height: 40px;
		text-align: right;
		
		i {
			color: $blue;
		}
	}
</style>

<script>
	import Helper from "components/Helper.vue";
	import SettingSection from "../SettingSection.vue";
	import FilterOptions from "../FilterOptions.vue";

	export default {
		data () {
			return {
				type: "instagram",
				dev: process.env.NODE_ENV === 'development',
				followConditionsMode: false,
				settings: false
			}
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
				if (
					this.settings.filters.follow.following.number == 0 && 
					this.settings.filters.follow.followers.number == 0 && 
					this.settings.filters.follow.ratio == 0
				){
					this.followConditionsMode = false;
					return;
				}
				this.followConditionsMode = (this.settings.filters.follow.following.number || this.settings.filters.follow.followers.number)?"fixed":"ratio";
			}
		},
		components: {
			Helper,
			SettingSection,
			FilterOptions
		}
	}
</script>