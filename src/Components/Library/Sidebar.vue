<template>
	<div class="ts-library-sidebar" :class="{ 'has-search-results': searchQuery !== null, 'collapsed': sidebarCollapsed
}">
		<div class="category-group collapsed" v-for="category in categories" :key="category.id">
			<div class="category-title" @click="toggleCategory">
				<span class="fa fa-angle-down"></span>
				<div class="category-name">
					{{ category.name }}
					({{ category.games.length }})
				</div>
				<span class="fa fa-plus"></span>
			</div>

			<div class="category-item-group">
				<div class="category-item" v-for="game in category.games" :key="game.id"
				     :class="{ 'selected': selectedGame === game.id }" @click="selectGame(game.id)">
					{{ game.name }}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { mapState, mapActions } from 'vuex';

	export default {
		computed: {
			...mapState({
				searchQuery     : ({ library }) => library.searchQuery,
				sidebarCollapsed: ({ global }) => global.sidebarCollapsed,
				games           : ({ library }) => library.games,
			}),
			categories() {
				if (!this.searchQuery) return this.games;
				if (this.games.length <= 0) return [];

				const searchCategory = {
					id         : 0,
					name       : 'Search Results',
					description: null,
					games      : [],
				};

				this.games.forEach(category => {
					category.games.forEach(game => {
						const query        = this.searchQuery.toLowerCase();
						const capitalRegex = new RegExp(query.split('').join('(.*\\s)'), 'gi');
						const match        = (game.name.toLowerCase().indexOf(query) >= 0) || capitalRegex.test(game.name);

						if (match) searchCategory.games.push(game);
					});
				});

				return [ searchCategory ];
			},
			selectedGame() {
				let game = null;

				for (let i = 0; i < this.games.length; i++) {
					for (let c = 0; c < this.games[ i ].games.length; c++) {
						if (this.games[ i ].games[ c ].id === parseInt(this.$route.params.appid)) {
							game = this.games[ i ].games[ c ];
							break;
						}
					}

					if (game) break;
				}

				return (!game ? null : game.id);
			},
		},
		methods : {
			...mapActions([
				'getLibrary',
			]),
			toggleCategory(e) {
				const $parent = $(e.target).parents('.category-group');

				$parent.toggleClass('collapsed');

				if (!$parent.hasClass('collapsed')) $parent.css('height', $parent.get(0).scrollHeight);
				else $parent.css('height', 40);
			},
			selectGame(gameID) {
				this.selected = null;

				for (let i = 0; i < this.games.length; i++) {
					for (let c = 0; c < this.games[ i ].games.length; c++) {
						if (this.games[ i ].games[ c ].id === gameID) {
							this.selected = this.games[ i ].games[ c ];
							break;
						}
					}
					if (this.selected) break;
				}

				this.$router.push({
					name  : 'library.game',
					params: {
						appid: gameID,
					},
				});
			},
		},
	}
</script>

<style scoped lang="scss">
	@import '../../scss/variables';

	.ts-library-sidebar {
		display: flex;
		flex: 0 0 $ts-library-sidebar-width;
		flex-direction: column;
		overflow-y: auto;
		overflow-x: hidden;
		background-color: darken($theme-primary-color, 5%);
		transition: flex-basis ease-in-out 0.5s;

		&.collapsed {
			flex-basis: 0;
		}

		&.has-search-results {
			.category-group {
				height: auto;

				.category-title > .fa-angle-down {
					transform: rotate(540deg);
				}
			}
		}

		.category-group {
			flex: 0 0 auto;
			overflow: hidden;
			line-height: 40px;
			height: 40px;
			min-width: $ts-library-sidebar-width;
			transition: height ease-in-out 0.5s;

			&:not(.collapsed) {
				> .category-title > .fa-angle-down {
					transform: rotate(540deg);
				}
			}

			.category-title {
				display: flex;
				cursor: pointer;
				background-color: $theme-secondary-color;

				&:hover {
					background-color: lighten($theme-secondary-color, 5%);
				}

				.fa {
					flex: 0 0 auto;
					text-align: center;
					line-height: inherit;
					padding: 0 1em;

					&.fa-angle-down {
						transition: transform ease-in-out 0.5s;
					}
				}

				.category-name {
					flex: 1 1 100%;
					font-size: 0.9em;
					white-space: nowrap;
					text-overflow: ellipsis;
					overflow: hidden;
				}
			}

			.category-item-group {
				font-weight: 500;

				.category-item {
					padding: 0 1em;
					cursor: pointer;
					white-space: nowrap;
					text-overflow: ellipsis;
					overflow: hidden;
					transition: background-color ease-in-out 0.1s, color ease-in-out 0.25s;

					&:hover {
						background-color: rgba(255, 255, 255, 0.05);
					}

					&.selected {
						color: $theme-accent-color;
					}
				}
			}
		}
	}
</style>
