<template>
	<div class="container">
		<div v-if="settings">
			<div class="row">
				<div class="col">
					Left side
				</div>
				<div class="col">
					<b>Tags follower</b>
					<div class="description">These tags will be periodically checked and the new posts will be liked</div>
					<hr/>
					<Tags v-model="settings.follow.tags"/>
				</div>
			</div>
		</div>
		<Loading v-else/>
	</div>
</template>


<style>
	
</style>

<script>
	import Loading from "components/Loading.vue";
	import Tags from "../Tags.vue";

	export default {
		data () {
			return {
				type: "fivehpx",
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
		components: {
			Loading,
			Tags
		}
	}
</script>