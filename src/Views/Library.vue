<template>
	<div class="view-library">
		<library-nav-bar></library-nav-bar>

		<div class="content">
			<library-sidebar></library-sidebar>

			<div class="transition-container">
				<transition name="libraryFade">
					<router-view :key="$route.path"></router-view>
				</transition>
			</div>
		</div>
	</div>
</template>

<script>
import LibraryNavBar from '../Components/Library/NavBar.vue';
import LibrarySidebar from '../Components/Library/Sidebar.vue';
import { mapActions, mapState } from 'vuex';
import { remote } from 'electron';

export default {
    created() {
        if (this.games.length <= 0) {
            this.getLibrary().then(game => {
                if (isNaN(parseInt(this.$route.params.appid))) {
                    if (game === null)
                        return console.warn(
                            'You have no games in your library!'
                        );
                    this.$router.push({
                        name: 'library.game',
                        params: {
                            appid: game.id,
                        },
                    });
                }
                this.getInstalledGames();
            });
        }
    },
    methods: {
        ...mapActions(['getLibrary', 'updateGameInstallState']),
        getInstalledGames() {
            if (this.SteamClient.steamCMD.isReady) {
                this.SteamClient.steamCMD
                    .installedApps()
                    .then(games =>
                        this.updateGameInstallState({ games: games.list })
                    )
                    .catch(console.error);
            } else
                this.SteamClient.steamCMD.once(
                    'ready',
                    this.getInstalledGames.bind(this)
                );
        },
    },
    computed: {
        ...mapState({
            games: ({ library }) => library.games,
        }),
        SteamClient() {
            return remote.app.SteamClient;
        },
    },
    components: {
        LibraryNavBar,
        LibrarySidebar,
    },
};
</script>

<style scoped lang="scss">
@import '../scss/variables';

.view-library {
    display: flex;
    flex-direction: column;

    .ts-library-nav-bar {
        flex: 0 0 $ts-library-nav-bar-height;
    }

    .content {
        display: flex;
        flex: 1 1 100%;

        .transition-container {
            position: relative;
            flex: 1 1 100%;
        }
    }
}
</style>
