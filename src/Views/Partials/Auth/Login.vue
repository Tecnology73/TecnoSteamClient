<template>
	<div class="login-container">
		<div class="logo-container">
			<img src="/dist/imgs/steam-logo.png" class="steam-logo">
			<div class="login-circle" :class="{ 'visible': loggingIn }"></div>
		</div>

		<form @submit.prevent="login">
			<div class="form-control-group">
				<div class="form-control-icon">
					<span class="fa fa-user"></span>
				</div>

				<input type="text" placeholder="Username" class="form-control" v-model="logonDetails.accountName"/>
			</div>

			<div class="form-control-group">
				<div class="form-control-icon">
					<span class="fa fa-lock"></span>
				</div>

				<input type="password" placeholder="Password" class="form-control" v-model="logonDetails.password"/>
			</div>

			<input type="checkbox" id="rememberMe" class="form-control" v-model="logonDetails.rememberMe">
			<label for="rememberMe">Remember Me</label>

			<button type="submit" class="btn">Login</button>

			<router-link :to="{ name: 'register' }">Create an Account</router-link>
		</form>
	</div>
</template>

<script>
	import { remote } from 'electron';

	export default {
		created() {
			this.SteamClient.on('error', this.scError.bind(this));
			this.SteamClient.on('steamGuard', this.scSteamGuard.bind(this));
			this.SteamClient.on('loginAttempt', this.scLoginAttempt.bind(this));

			this.loadSettings();

			if (this.logonDetails.rememberMe)
				this.SteamClient.autoLogin();
		},
		beforeDestroy() {
			this.SteamClient.removeListener('error', this.scError.bind(this));
			this.SteamClient.removeListener('steamGuard', this.scSteamGuard.bind(this));
			this.SteamClient.removeListener('loginAttempt', this.scLoginAttempt.bind(this));
		},
		data() {
			return {
				loggingIn   : false,
				logonDetails: {
					accountName: '',
					password   : '',
					rememberMe : false,
				},
			}
		},
		methods : {
			login(e) {
				this.SteamClient.login({
					accountName     : this.logonDetails.accountName,
					password        : this.logonDetails.password,
					rememberPassword: this.logonDetails.rememberMe,
				});
			},
			scError(...e) {
				console.error(...e);
			},
			scSteamGuard(domain, callback) {
				this.$router.push({
					name: 'login.guard',
				});
			},
			scLoginAttempt(loggingIn) {
				this.loggingIn = loggingIn;
			},
			loadSettings() {
				const options = this.SteamClient.options;

				this.logonDetails.accountName = (options.logOnDetails.accountName || '');
				this.logonDetails.rememberMe  = (options.logOnDetails.rememberPassword || false);
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
	.login-container {
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

			.form-control[type="checkbox"] {
				display: none;

				&:checked + label {
					&::before {
						opacity: 1;
						transform: rotate(45deg) scale(1);
					}

					&::after {
						background-color: rgba(255, 255, 255, 0.1);
					}
				}
			}

			label[for="rememberMe"] {
				position: relative;
				text-align: right;
				margin-bottom: 1em;
				cursor: pointer;
				font-size: 0.9em;
				line-height: 1.25em;

				&::before {
					position: absolute;
					content: '';
					right: 5px;
					top: 3.5px;
					width: 5px;
					height: 8px;
					border: solid 2px white;
					border-top: 0;
					border-left: 0;
					opacity: 0;
					transition: opacity ease-in-out 0.25s, transform ease-in-out 0.25s;
					transform: rotate(45deg) scale(0);
				}

				&::after {
					float: right;
					content: '';
					width: 15px;
					height: 15px;
					border: solid 1px rgba(255, 255, 255, 0.1);
					margin-left: 15px;
					margin-top: 0.1em;
					transition: background-color ease-in-out 0.25s;
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
