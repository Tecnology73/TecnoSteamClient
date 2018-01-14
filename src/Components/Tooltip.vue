<template>
	<div class="v-tooltip" :class="[ visible ? 'visible' : '', offset ]" :style="style">
		<div class="content">{{ content }}</div>
		<div class="sub-content" v-html="subContent" v-if="subContent"></div>
	</div>
</template>

<script>
	import Vue from 'vue';

	export default {
		data() {
			return {
				position  : {
					x: 0,
					y: 0,
				},
				content   : null,
				subContent: null,
				visible   : false,
				offset    : 'bottom',
			}
		},
		methods : {
			show(options) {
				const $e    = $(options.element);
				const ePos  = $e.offset();
				const eSize = {
					width : $e.outerWidth(),
					height: $e.outerHeight(),
				};

				this.position.x = ePos.left;
				this.position.y = ePos.top;
				this.offset     = options.offset || 'bottom';

				Vue.nextTick(() => {
					const size = {
						width : this.$el.offsetWidth,
						height: this.$el.offsetHeight,
					};

					this.position.x -= (size.width / 2) - (eSize.width / 2);

					switch (this.offset) {
						case 'top':
							this.position.y -= size.height;
							break;
						case 'left':
							this.position.x -= size.width;
							break;
						case 'right':
							this.position.x += size.width;
							break;
						default:
							this.position.y += eSize.height;
							break;
					}
				});

				this.visible = true;

				return this;
			},
			hide() {
				this.visible = false;

				return this;
			},
			setContent(value) {
				this.content = value;

				return this;
			},
			setData(data) {
				this.content    = data.content;
				this.subContent = data.subContent || null;

				return this;
			},
		},
		computed: {
			style() {
				return {
					left: this.position.x + 'px',
					top : this.position.y + 'px',
				}
			},
		},
	}
</script>

<style scoped lang="scss">
	.v-tooltip {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 999999;
		background-color: rgba(0, 0, 0, 0.9);
		color: white;
		opacity: 0;
		pointer-events: none;
		transition: opacity ease-in-out 0.25s;
		padding: 0.25em 0.75em;

		&.visible {
			opacity: 1;
		}

		&.top {
			margin-top: -0.5em;
		}

		&.bottom {
			margin-top: 0.5em;
		}

		&.left {
			margin-left: -0.5em;
		}

		&.right {
			margin-left: 0.5em;
		}

		.sub-content {
			font-size: 0.9em;
			margin: 0.25em 0;
			font-weight: 600;
		}
	}
</style>
