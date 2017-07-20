<template>
	<div>
		<span v-for="sharer in sharers">
			<a href="#" @click.prevent="$emit('input', sharer.name)" :class="[(sharer.name == value)?'selected':'']" :title="sharer.title">
				<i :class="['fa', sharer.class]"/>
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
	export default {
		props: ["value"],
		data () {
			return {
				sharers: [
					{name: "all", class: "fa-globe", title: "All logs"},
					{name: "instagram", class: "fa-instagram", title:"Instagram"},
					{name: "fivehpx", class: "fa-500px", title:"500px"},
					{name: "flickr", class: "fa-flickr", title:"Flickr"}
				]
			}
		}

	}
</script>