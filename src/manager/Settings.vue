<template>
	<div id="navigator">
		<div class="row">
			<div class="col">
				<h3>Settings</h3>
			</div>
			<div class="col text-right">
				<a class="font-small" href="#" @click.prevent="showAdvanced = !showAdvanced">Advanced</a>
			</div>
		</div>
		<hr/>
		<div v-if="showAdvanced" class="container advanced">
			<div class="row">
				<div>
					<a class="btn-link" href="#" @click.prevent="$send('resetStorage')">Reset storage</a>
					<a class="btn-link" href="#" @click.prevent="$send('resetDB')">  Reset database</a>
				</div>
			</div>
		</div>
		<hr v-if="showAdvanced"/>
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
	.advanced a {
		color:red;
	}
</style>

<script>
	export default {
		data () {
			return {
				showAdvanced: false
			}
		},
		methods: {
			navigate (section) {
				this.$router.push("/settings/" + section)
			}
		}
	}
</script>