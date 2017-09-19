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
		<div class="container errorContainer">
			<ErrorDash class="row"/>
		</div>
		<div class="container">
			<div class="row text-center">
				<div v-for="(cat, key) in cats" :class="['col', 'cat', (key==$route.name)?'selected':'']" @click="navigate(key)">
					{{cat.text}}
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

		&.selected {
			opacity: .85;
		}
	}
	#content {
		padding-top: $spacer;
	}
	.advanced a {
		color:red;
	}
	.errorContainer {
		padding-bottom: $spacer-small;
	}
</style>

<script>
	import ErrorDash from "components/ErrorDash.vue";

	export default {
		data () {
			return {
				showAdvanced: false,
				cats: {
					instagram: {text: "Instagram"},
					fivehpx: {text: "500px"},
					flickr: {text: "Flickr"}
				}
			}
		},
		methods: {
			navigate (section) {
				this.$router.push("/settings/" + section)
			}
		},
		components: {
			ErrorDash
		}
	}
</script>