<template>
	<div>
		<div class="container">
			<div class="row">
				<div class="col-2 userImage text-left">
					<i class="fa fa-user-circle-o"></i> <!-- When no account is connected this is showed! -->
					<!--<a href="www.instagram.com" target="_blank"><img :src="user.image" :alt="user.username"></img></a>-->
				</div>
				<div class="col-8 title text-center">
					<router-link to="/"><b>FollowHunter</b> control panel</router-link>
				</div>
				<div class="col-2 text-right">
					<i class="fa fa-bell"></i> <!-- Notification system (unified) -->
				</div>
			</div>
		</div>
		<hr/>
	</div>
</template>

<style scoped lang="scss">
	.container {
		margin-top: $spacer;
	}
	.userImage {

		img {
			max-width: 95px;
			max-height: 95px;
		}
	}
</style>

<script>
	export default {
		props: ["user"]
	}
</script>