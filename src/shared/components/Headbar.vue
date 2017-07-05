<template>
	<div class="row">
		<div class="col-2 userImage">
			<img :src="user.image" :alt="user.username"></img>
		</div>
		<div class="col-8 title">
			Instagram
		</div>
		<div class="col-2">
			Ntf
		</div>
	</div>
</template>

<style scoped lang="scss">
	.userImage {
		text-align: center;

		img {
			max-width: 95px;
			max-height: 95px;
		}
	}
	.title {
		text-align: center;
	}
</style>

<script>
	export default {
		props: ["user"]
	}
</script>