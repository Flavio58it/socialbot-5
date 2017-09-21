<template>
	<SettingSection
		:plug="type"
		:settings.sync="settings"
	>
		<template slot="left" scope="props">
			
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