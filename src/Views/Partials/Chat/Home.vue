<template>
	<div class="home-container">
		<nav-bar></nav-bar>

		<div class="body">
			<transition name="growShrink">
				<router-view></router-view>
			</transition>
		</div>
	</div>
</template>

<script>
	import NavBar from '../../../Components/Chat/NavBar.vue';
	import moment from 'moment';

	export default {
		components: {
			NavBar,
		},
	}
</script>

<style scoped lang="scss">
	@import '../../../scss/variables';

	.home-container {
		display: flex;
		flex-direction: column;
		height: 100%;

		.chat-navbar-container {
			flex: 0 0 75px;
			box-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
			z-index: 1;
		}

		.body {
			display: flex;
			flex-direction: column;
			background-color: darken($theme-primary-color, 5%);
		}
	}
</style>
