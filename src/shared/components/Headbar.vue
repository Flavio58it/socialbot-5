<template>
	<div id="headBar">
		<div class="container">
			<div class="row">
				<div class="col-2 userImage text-left">
					<i class="fa fa-user-circle-o"></i> <!-- When no account is connected this is showed! -->
					<!--<a href="www.instagram.com" target="_blank"><img :src="user.image" :alt="user.username"></img></a>-->
				</div>
				<div :class="[showsettings?'col-8':'col-9', 'title', 'text-center']">
					<a v-if="titlelink" :href="links.home"><b>SocialBot</b> control panel</a>
					<a v-else href="#" @click.prevent=""><b>SocialBot</b> control panel</a>
				</div>
				<div v-if="showsettings" class="col-1 text-right">
					<a :href="links.settings" target="_blank">
			          <i class="fa fa-gear"/>
			        </a>
				</div>
				<div class="col-1 text-right">
					<i class="fa fa-bell"></i> <!-- Notification system (unified) -->
				</div>
			</div>
		</div>
		<hr v-if="separator"/>
		<div v-else class="separator"/>
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
	.separator {
		margin-top: 15px;
	}
</style>

<script>
	export default {
		props: {
			showsettings:{
				type: Boolean
			},
			separator: {
				default: true
			},
			titlelink: {
				type: Boolean
			}
		},
		data () {
			return {
		        links: {
		          settings: chrome.extension.getURL('/pages/manager.html#/settings/'),
		          home: chrome.extension.getURL('/pages/manager.html#/')
		        }
		    }
		}
	}
</script>