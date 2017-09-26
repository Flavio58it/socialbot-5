<template>
	<SettingSection
		:plug="type"
		:settings.sync="settings"
	>
		<template slot="left" scope="data">
			<b-tabs>
				<b-tab title="General">
					<b-form-checkbox v-model="data.settings.enabled">
						<b>Bot enabled</b>
						<div class="description">Enable the bot</div>
					</b-form-checkbox>
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
				</b-tab>
				<b-tab title="Likes">
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
									<p>This filter will apply to all like actions (tags/dashboard/likeback)</p>
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
					<div class="row">
						<div class="col-6">
							<div class="description">
								AI Setting <b>EXPERIMENTAL</b>
								<helper title="Artificial Intelligence Setting">
									<div>
										<p>Like if AI has approved the image in the selected category</p>
										<p>Please note that the AI will cover all the normal cases with only tiny margin of error. If the image is messed up (strong contrast, messed color balance, white stripes) the correct result is not ensured.</p>
									</div>
								</helper>
							</div>
							 <b-form-select 
							 	v-model="data.settings.filters.likes.brain"
							 	:options="[
							 		{text: 'Disabled', value: false},
							 		{text: 'Landscape (Nature)', value: 'landscape'},
							 		{text: 'People (selfies etc.)', value: 'people'},
							 		{text: 'Arhitecture (cities/streets)', value: 'arhitecture'}
							 	]" 
							 	class="mb-3"/>
						</div>
						<div v-if="data.settings.filters.likes.brain" class="col-6">
							<div class="description">
								AI Fallback
							</div>
							 <b-form-select 
							 	v-model="data.settings.filters.likes.brainFallback" 
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
						<div class="col-4">
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
			</b-tabs>
		</template>
	</SettingSection>
</template>


<style lang="scss">
	
</style>

<script>
	import SettingSection from "../SettingSection.vue";
	import Loading from "components/Loading.vue";
	import Helper from "components/Helper.vue";
	import FilterOptions from "../FilterOptions.vue";

	export default {
		data () {
			return {
				type: "fivehpx",
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
			}
		},
		components: {
			SettingSection,
			Helper,
			FilterOptions
		}
	}
</script>