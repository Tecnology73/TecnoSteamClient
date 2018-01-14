<template>
	<div class="v-dropdown" :class="[ { 'open' : isOpen }, getAlignment ]">
		<div class="dropdown-button" @click="toggle">
			<slot name="button"></slot>
		</div>

		<div class="dropdown-content">
			<slot name="content"></slot>
		</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				isOpen: false,
			}
		},
		props   : {
			alignment: {
				type   : String,
				default: 'left',
			},
		},
		methods : {
			toggle() {
				this.isOpen = !this.isOpen;

				this.$emit('toggle', this.isOpen);

				if (this.isOpen) this.$emit('open');
				else this.$emit('close');
			},
			open() {
				this.isOpen = true;

				this.$emit('open');
			},
			close() {
				this.isOpen = false;

				this.$emit('close');
			},
		},
		computed: {
			state() {
				return this.isOpen ? 'Open' : 'Closed';
			},
			getAlignment() {
				return 'align-' + this.alignment;
			},
		},
	}
</script>

<style lang="scss">
	.v-dropdown {
		position: relative;

		&.open {
			> .dropdown-content {
				opacity: 1;
				top: 100%;
				pointer-events: all;
			}
		}

		&.align-right > .dropdown-content {
			left: auto;
			right: 0;
		}

		> .dropdown-button {
			position: relative;
			z-index: 100;
		}

		> .dropdown-content {
			position: absolute;
			top: 50%;
			left: 0;
			width: 100%;
			max-height: 200px;
			opacity: 0;
			pointer-events: none;
			z-index: 99;
			line-height: initial;
			box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
			transition: top ease-in-out 0.25s, opacity ease-in-out 0.25s;

			.dropdown-item {
				padding: 0.75em 1em;
				cursor: pointer;
				transition: background-color ease-in-out 0.1s;

				&:hover {
					background-color: rgba(255, 255, 255, 0.05);
				}

				&:active {
					background-color: rgba(255, 255, 255, 0.1);
				}
			}

			.dropdown-seperator {
				border-bottom: solid 1px rgba(255, 255, 255, 0.05);
				margin: 0 1em;
			}
		}
	}
</style>
