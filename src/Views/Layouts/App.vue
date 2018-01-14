<template>
	<div class="app-container">
		<nav-bar></nav-bar>

		<div class="body">
			<router-view></router-view>
		</div>

		<tooltip ref="tooltip"></tooltip>
	</div>
</template>

<script>
	import NavBar from '../../Components/NavBar.vue';
	import Tooltip from '../../Components/Tooltip.vue';
	import { mapActions } from 'vuex';

	export default {
		components: {
			NavBar,
			Tooltip,
		},
		created() {
			this.getUserInfo();
		},
		computed  : {
			tooltip() {
				return this.$refs.tooltip;
			},
		},
		methods   : {
			...mapActions([
				'getUserInfo',
			])
		},
	}
</script>

<style lang="scss">
	@import '../../scss/app';

	.app-container {
		height: 100vh;
		width: 100vw;
		overflow: hidden;

		.body {
			height: calc(100vh - #{$ts-nav-bar-height});

			> [class*="view-"] {
				height: 100%;
			}
		}
	}
</style>
