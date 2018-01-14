<template>
	<div class="register-container">
		<img src="/dist/imgs/steam-logo.png" class="steam-logo">

		<form @submit.prevent="register">
			<div class="form-control-group">
				<div class="form-control-icon">
					<span class="fa fa-user"></span>
				</div>

				<input type="text" placeholder="Username" class="form-control" v-model="data.accountName"/>
			</div>

			<div class="form-control-group" :class="{ 'mismatch': !passwordsMatch }">
				<div class="form-control-icon">
					<span class="fa fa-lock"></span>
				</div>

				<input type="password" placeholder="Password" class="form-control" v-model="data.password"/>
			</div>

			<div class="form-control-group" :class="{ 'mismatch': !passwordsMatch }">
				<div class="form-control-icon">
					<span class="fa fa-lock"></span>
				</div>

				<input type="password" placeholder="Confirm Password" class="form-control"
				       v-model="data.passwordConfirm"/>
			</div>

			<div class="form-control-group" :class="{ 'mismatch': !emailsMatch }">
				<div class="form-control-icon">
					<span class="fa fa-envelope-o"></span>
				</div>

				<input type="email" placeholder="Email" class="form-control" v-model="data.email"/>
			</div>

			<div class="form-control-group" :class="{ 'mismatch': !emailsMatch }">
				<div class="form-control-icon">
					<span class="fa fa-envelope-o"></span>
				</div>

				<input type="email" placeholder="Confirm Email" class="form-control" v-model="data.emailConfirm"/>
			</div>

			<button type="submit" class="btn">Register</button>

			<router-link :to="{ name: 'login' }">I already have an account</router-link>
		</form>
	</div>
</template>

<script>
	import { remote, ipcRenderer } from 'electron';
	import axios from 'axios';

	export default {
		created() {
			ipcRenderer.on('scCreateAccount', this.createAccount.bind(this));

			this.SteamClient.on('error', this.scError.bind(this));
		},
		beforeDestroy() {
			this.SteamClient.removeListener('error', this.scError.bind(this));
		},
		data() {
			return {
				data: {
					accountName    : null,
					password       : null,
					passwordConfirm: null,
					email          : null,
					emailConfirm   : null,
				},
			}
		},
		methods : {
			register() {
				const accountName = this.data.accountName;
				const password    = this.data.password;
				const email       = this.data.email;

				ipcRenderer.send('scCreateAccount', {
					accountName,
					password,
					email,
				});
			},
			scError(...e) {
				console.error(...e);
			},
			createAccount(e, data) {
				if (data.success) {
					return console.log('Success!');
				}
			},
		},
		computed: {
			SteamClient() {
				return remote.app.SteamClient;
			},
			passwordsMatch() {
				if ((!this.data.password && !this.data.passwordConfirm) ||
				    (this.data.password && !this.data.passwordConfirm)) return true;
				return (this.data.password === this.data.passwordConfirm);
			},
			emailsMatch() {
				if ((!this.data.email && !this.data.emailConfirm) ||
				    (this.data.email && !this.data.emailConfirm)) return true;
				return (this.data.email === this.data.emailConfirm);
			},
		},
	}
</script>

<style scoped lang="scss">
	.register-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: calc(100% - 2em);
		padding: 0 1em;

		.steam-logo {
			opacity: 0.1;
			margin-bottom: 2em;
		}

		form {
			display: flex;
			flex-direction: column;
			align-self: stretch;
			text-align: center;

			.form-control-group {
				&.mismatch {
					.form-control-icon,
					.form-control {
						background-color: transparent;
					}
				}

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
</style>
