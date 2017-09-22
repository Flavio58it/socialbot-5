<template>
	<SettingSection
		:plug="type"
		:settings.sync="settings"
	>
		<template slot="left" scope="data">
			<div>
				<b-form-checkbox v-model="data.settings.enabled">
					<b>Bot enabled</b>
					<div class="description">Enable the bot</div>
				</b-form-checkbox>
			</div>
		</template>
	</SettingSection>
</template>


<style>
	
</style>

<script>
	import SettingSection from "../SettingSection.vue";
	import Loading from "components/Loading.vue";

	export default {
		data () {
			return {
				type: "fivehpx",
				settings: false
			}
		},
		components: {
			SettingSection
		}
	}
</script>