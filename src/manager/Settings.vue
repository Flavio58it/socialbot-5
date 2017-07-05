<template>
	<div id="navigator">
		<h3>Settings</h3>
		<hr/>
		<div class="container">
			<div class="row text-center">
				<div class="col cat" @click="navigate('instagram')">
					Instagram
				</div>
				<div class="col cat" @click="navigate('fivehpx')">
					500px
				</div>
				<div class="col cat"  @click="navigate('flickr')">
					Flickr
				</div>
			</div>
		</div>
		<div id="content">
			<router-view/>
		</div>
	</div>
</template>

<style lang="scss" scoped>
	.cat {
		cursor: pointer;
		color: $font-color-dark;
		background: $blue;
		padding: $spacer-small;
		font-weight: bold;
	}
	#content {
		padding-top: $spacer;
	}
</style>

<script>
	export default {
		methods: {
			navigate (section) {
				this.$router.push("/settings/" + section)
			}
		}
	}
</script>