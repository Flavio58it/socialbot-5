<template>
	<div class="container">
		<div v-if="settings">
			<div class="row">
				<div class="col">
					<div>
						<b-form-checkbox v-model="settings.enabled">
							<b>Bot enabled</b>
							<div class="description">Enable the bot</div>
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
							UnFollowBack
							<div class="description">When a user unfollows you will be unfollowed back. (Whitelist applied)</div>
						</b-form-checkbox>
					</div>
					<div>
						<b-form-checkbox v-model="settings.likeBack">
							LikeBack
							<div class="description">When a user likes a photo of yours, The bot will like a couple of theirs. (Blacklist applied)</div>
						</b-form-checkbox>
					</div>
				</div>
				<div class="col">
					<b>Tags follower</b>
					<div class="description">These tags will be periodically checked and the new images will be liked</div>
					<hr/>
					<Tags v-model="settings.followTags"/>
				</div>
			</div>
			<div>
				<button @click="save" class="btn btn-primary btn-lg float-right save">Save</button>
			</div>
		</div>
		<div v-else>
			Loading...
		</div>
	</div>
</template>

<style lang="scss" scoped>
	.description {
		font-size: $font-small;
	}
	.save {width: 200px;}
</style>

<script>
	import Tags from "../Tags.vue";

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
			save () {
				this.$send("saveSettings", {
					type: this.type, 
					settings: this.settings
				});
			}
		},
		components: {
			Tags
		}
	}
</script>