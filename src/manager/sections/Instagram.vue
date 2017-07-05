<template>
	<div class="container">
		<div v-if="settings">
			<b-form-checkbox v-model="settings.enabled">
				Robot enabled
			</b-form-checkbox>
		</div>
		<div v-else>
			Loading...
		</div>
	</div>
</template>

<style lang="scss" scoped>

</style>

<script>
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
		}
	}
</script>