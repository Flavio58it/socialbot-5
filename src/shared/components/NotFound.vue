<template>
	<div class="container spaced">
		<div class="row">
			<div class="col text-center">Page not found</div>
		</div>
		<div class="row">
			<div class="col text-center spaced">
				<router-link to="/" tag="button" class="btn">Return to home</router-link>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.spaced {
		padding: 30px 0;
	}
	
	button {
		cursor: pointer;
	}
</style>

<script>
	export default {}
</script>