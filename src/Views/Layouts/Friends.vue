<template>
	<div class="friends-container">
		<nav-bar :toggler="false"></nav-bar>

		<div class="body">
			<transition name="growShrink">
				<router-view></router-view>
			</transition>
		</div>
	</div>
</template>

<script>
	import { remote } from 'electron';
	import NavBar from '../../Components/NavBar.vue';

	export default {
		components: {
			NavBar,
		},
		computed  : {
			SteamClient() {
				return remote.app.SteamClient;
			},
		},
	}
</script>

<style lang="scss">
	@import '../../scss/app';

	.friends-container {
		height: 100vh;
		width: 100vw;
		overflow: hidden;

		.body {
			position: relative;
			height: calc(100vh - #{$ts-nav-bar-height});
		}
	}
</style>
