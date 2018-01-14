<template>
	<div class="ts-nav-bar" :class="{ 'for-auth': forAuth, 'no-toggler': !toggler }">
		<div class="sidebar-toggle" @click="internalToggleSidebar" v-if="toggler">
			<span class="fa fa-bars"></span>
		</div>

		<div class="app-title">
			TecnoSteam
		</div>

		<div class="window-state-group">
			<div class="window-state minimize" @click="minimize" v-if="!forAuth">
				<span class="fa fa-window-minimize"></span>
			</div>

			<div class="window-state restore" @click="toggleState" v-if="!forAuth">
				<span class="fa fa-square-o"></span>
			</div>

			<div class="window-state close" @click="close">
				&times;
			</div>
		</div>
	</div>
</template>

<script>
	import { remote } from 'electron';
	import { mapActions } from 'vuex';

	export default {
		props  : {
			forAuth: {
				type   : Boolean,
				default: false,
			},
			toggler: {
				type   : Boolean,
				default: true,
			},
		},
		methods: {
			...mapActions([
				'toggleSidebar',
			]),
			minimize() {
				remote.getCurrentWindow().minimize();
			},
			toggleState() {
				if (remote.getCurrentWindow().isMaximized())
					remote.getCurrentWindow().restore();
				else
					remote.getCurrentWindow().maximize();
			},
			close() {
				remote.getCurrentWindow().close();
			},
			internalToggleSidebar() {
				this.toggleSidebar();
			},
		},
	}
</script>

<style scoped lang="scss">
	@import '../scss/variables';

	.ts-nav-bar {
		position: relative;
		z-index: 9999;
		display: flex;
		align-items: center;
		line-height: $ts-nav-bar-height;
		background-color: $ts-nav-bar-back-color;
		box-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);

		&.no-toggler .app-title {
			margin-left: 1em;
		}

		&.for-auth .window-state-group {
			flex-basis: $ts-nav-bar-height;
		}

		.sidebar-toggle {
			flex: 0 0 $ts-nav-bar-height;
			text-align: center;
			margin-right: 1em;
			cursor: pointer;
			transition: background-color ease-in-out 0.1s;

			&:hover {
				background-color: rgba(255, 255, 255, 0.05);
			}
		}

		.app-title {
			flex: 1 1 100%;
			-webkit-app-region: drag;
		}

		.window-state-group {
			display: flex;
			flex: 0 0 #{$ts-nav-bar-height * 3};
			align-self: flex-end;

			.window-state {
				flex: 0 0 $ts-nav-bar-height;
				text-align: center;
				cursor: pointer;
				transition: background-color ease-in-out 0.1s;

				&.close {
					font-size: 1.5em;
					font-weight: 500;
				}

				&:hover {
					background-color: rgba(255, 255, 255, 0.05);

					&.close {
						background-color: transparentize(#F44336, 0.5);
					}
				}
			}
		}
	}
</style>
