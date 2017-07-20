<template>
	<div class="container">
		<div class="row">
			<div class="col mainInfos">
				<div class="row infos">
					Main infos such as bot status and stats 1
				</div>
				<div class="row infos">
					Main infos such as bot status and stats 2
				</div>
			</div>
			<div class="col logs">
				<log-scraper loggerid = "home"/>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	$height: 400px;
	$height-mid: 200px;
	

	.logs {
		height: $height;
	}

	.mainInfos {
		.infos {
			height: $height-mid;
		}
	}
</style>

<script>
	import LogScraper from "components/LogScraper.vue";

	export default {
		components: {
			LogScraper
		}
	}
</script>