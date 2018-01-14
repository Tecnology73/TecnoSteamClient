<template>
	<div class="auth-container">
		<nav-bar :forAuth="true" :toggler="false"></nav-bar>

		<div class="body">
			<transition name="growShrink">
				<router-view></router-view>
			</transition>
		</div>

		<div class="copyright">
			Copyright&copy; 2017
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

	.auth-container {
		height: 100vh;
		width: 100vw;
		overflow: hidden;

		.body {
			position: relative;
			height: calc(100vh - #{$ts-nav-bar-height});

			> div {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
			}
		}

		.copyright {
			position: fixed;
			bottom: 1em;
			left: 1em;
			opacity: 0.5;
			font-size: 0.8em;
		}
	}
</style>
