<template>
	<SettingSection
		ref="settingsSection"
		:plug="type" 
		:settings.sync="settings"
		@loaded="followFilterManager"
		:saveButton="selectedTab !== 0"
	>
			<template v-slot:left="data">
				<b-tabs v-model="selectedTab" justified>
					<b-tab title="Status">
						<StatsViewer :stats="data.stats"/>
						<MasterSwitch v-model="data.settings.enabled" :running="data.running" @click="$refs.settingsSection.save()"/>
						<div class="text-center">
							<router-link :to="`/followers/${type}`"><i class="fas fa-users fa-2x"/></router-link>
						</div>
					</b-tab>
					<b-tab title="Tags Follower">
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
	import MasterSwitch from "components/MasterSwitch.vue"
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
				selectedTab: 0,
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
			MasterSwitch,
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