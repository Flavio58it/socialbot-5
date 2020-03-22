<template>
	<SettingSection
		:plug="type" 
		:settings.sync="settings"
		@loaded="followFilterManager"
	>
			<template v-slot:left="data">
				<b-tabs>
					<b-tab title="Status">
						<StatsViewer :stats="data.stats"/>
						<Status :data="data"/>
					</b-tab>
					<b-tab title="Tags Follower">
						<div class="description">These tags will be periodically checked and the new posts will be liked</div>
						<Tags v-model="settings.modules.like.tags"/>
					</b-tab>
					<b-tab title="Timings & rates">
						<Timings :data="data"/>
					</b-tab>
					<b-tab title="Likes">
						<Likes :data="data"/>
					</b-tab>
					<b-tab title="LikeBack">
						<LikeBack :data="data"/>
					</b-tab>
					<b-tab title="Follow">
						<Follow :data="data" :followConditionsMode="followConditionsMode"/>
					</b-tab>
				</b-tabs>
		</template>
	</SettingSection>
</template>

<script>
	import SettingSection from "../../SettingSection.vue";

	import Status from "./Status.vue"
	import StatsViewer from "../../StatsViewer/StatsViewer.vue"
	import Tags from "../../Tags.vue";

	import Timings from "./Timings.vue"
	import Likes from "./Likes.vue"
	import LikeBack from "./LikeBack.vue"
	import Follow from "./Follow.vue"

	export default {
		data () {
			return {
				type: "instagram",
				followConditionsMode: false,
				settings: false
			}
		},
		methods: {
			followFilterManager(){
				if (
					this.settings.modules.follow.filters.following.number == 0 && 
					this.settings.modules.follow.filters.followers.number == 0
				){
					this.followConditionsMode = false;
					return;
				}
				this.followConditionsMode = (
					this.settings.modules.follow.filters.following.number || 
					this.settings.modules.follow.filters.followers.number
				)?"fixed":"ratio";
			}
		},
		components: {
			SettingSection,
			StatsViewer,
			Tags,

			Status,
			LikeBack,
			Likes,
			Timings,
			Follow
		}
	}
</script>