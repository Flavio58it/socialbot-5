<template>
	<div id = "userlist">
		<div class="head">
			filter by name, state (blacklisted/whitelisted) if is following or not
		</div>
		<div>
			<div v-for="user in users" class="user">
				user
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	#userlist {
		border: 1px solid $font-color;
	}
</style>

<script>
	export default {
		props: ["users"]
	}
</script>