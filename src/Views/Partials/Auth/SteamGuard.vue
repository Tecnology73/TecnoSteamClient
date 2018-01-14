<template>
	<div class="steam-guard-container">
		<div class="logo-container">
			<img src="/dist/imgs/steam-logo.png" class="steam-logo">
			<div class="login-circle" :class="{ 'visible': loggingIn }"></div>
		</div>

		<form @submit.prevent="login">
			<div class="form-control-group">
				<div class="form-control-icon">
					<span class="fa fa-lock"></span>
				</div>

				<input type="password" placeholder="Steam Guard Code" class="form-control" ref="steamGuard"/>
			</div>

			<button type="submit" class="btn">Login</button>

			<router-link :to="{ name: 'login' }">Cancel</router-link>
		</form>
	</div>
</template>

<script>
	import { remote } from 'electron';

	export default {
		created() {
			this.SteamClient.on('error', this.scError.bind(this));
			this.SteamClient.on('loginAttempt', this.scLoginAttempt.bind(this));
		},
		beforeDestroy() {
			this.SteamClient.removeListener('error', this.scError.bind(this));
			this.SteamClient.removeListener('loginAttempt', this.scLoginAttempt.bind(this));
		},
		data() {
			return {
				loggingIn: false,
			}
		},
		methods : {
			login() {
				if (!this.SteamClient._steamGuardCallback)
					return console.error('No Steam Guard Callback!');

				this.SteamClient._steamGuardCallback(this.$refs.steamGuard.value);
			},
			scError(...e) {
				console.error(...e);
			},
			scLoginAttempt(loggingIn) {
				this.loggingIn = loggingIn;
			},
		},
		computed: {
			SteamClient() {
				return remote.app.SteamClient;
			},
		},
	}
</script>

<style scoped lang="scss">
	.steam-guard-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: calc(100% - 2em);
		padding: 0 1em;

		.logo-container {
			position: relative;

			.steam-logo {
				opacity: 0.1;
				margin-bottom: 2em;
				width: 50px;
				height: 50px;
			}

			.login-circle {
				position: absolute;
				top: -5px;
				left: -5px;
				width: 60px;
				height: 60px;
				border: solid 2px #3F51B5;
				border-top-color: transparent;
				border-bottom-color: transparent;
				border-radius: 50%;
				opacity: 0;
				animation: loginCircle linear 1s infinite;
				transition: opacity ease-in-out 0.5s;

				&.visible {
					opacity: 1;
				}
			}
		}

		form {
			display: flex;
			flex-direction: column;
			align-self: stretch;
			text-align: center;

			.form-control-group {
				.form-control-icon {
					background-color: rgba(255, 255, 255, 0.1);
					color: transparentize(white, 0.5);
				}

				.form-control {
					background-color: rgba(255, 255, 255, 0.1);
					color: white;
				}
			}

			.btn {
				background-color: #3F51B5;
				text-transform: uppercase;
				letter-spacing: 0.05em;
				padding: 1em;
				transition: background-color ease-in-out 0.1s;

				&:hover {
					background-color: lighten(#3F51B5, 5%);
				}
			}

			a {
				margin-top: 1em;
				opacity: 0.75;
				font-size: 0.9em;
			}
		}
	}

	@keyframes loginCircle {
		0% {
			transform: rotate(0);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
