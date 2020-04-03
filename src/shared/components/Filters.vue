<template>
	<div v-if="sharers.length > 1">
		<span v-for="sharer in sharers" :key="sharer.name">
			<a href="#" @click.prevent="$emit('input', sharer.name)" :class="[(sharer.name == value)?'selected':'']" :title="sharer.title">
				<i :class="[{
					'fab': sharer.class !== 'fa-globe',
					'fa': sharer.class === 'fa-globe'
				}, sharer.class]"/>
			</a>
		</span>
	</div>
</template>

<style scoped lang="scss">
	a {
		padding: 0 10px;

		&.selected {
			color: $font-color-dark;
		}
	}
</style>

<script>
	import config from "../../config"

	export default {
		props: {
			value: {
				type: [Boolean, String]
			}
		},
		data () {
			return {
				sharers: [
					{name: "all", class: "fa-globe", title: "All logs"}
				]
			}
		},
		created () {
			for (let plug in config.plugs) {
				let plugConf = config.plugs[plug]

				if (plugConf.enabled)
					this.sharers.push({
						name: plug,
						class: plugConf.fontawesomeIcon,
						title: plugConf.completeName || plug
					})
			}
		}
	}
</script>