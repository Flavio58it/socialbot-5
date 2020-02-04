<template>
	<div id="navigator">
		<b-modal
			v-model="showAdvanced"
			title="Advanced options"
		>
			<b-button-group class="d-block">
				<b-button variant="success" @click.prevent="$send('resetStorage')">Reset storage</b-button>
				<b-button variant="info" @click.prevent="$send('resetDB')">Reset database</b-button>
			</b-button-group>
		</b-modal>
		<div class="container errorContainer">
			<ErrorDash class="row"/>
		</div>
		<i class="fas fa-wrench advancedSettings" @click="showAdvanced = !showAdvanced"/>
		<div class="container">
			<div class="row text-center">
				<div v-for="(cat, key) in cats" :key="key" :class="['col', 'cat', (key==$route.name)?'selected':'']" @click="navigate(key)">
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

	#navigator {
		position: relative;

		.advancedSettings {
			cursor: pointer;
			position: absolute;
			right: 10px;
			top: 10px;
		}
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