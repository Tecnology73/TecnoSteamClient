export default {
	findGameInCategories(categories, gameID) {
		if (typeof categories !== 'object' || isNaN(parseInt(gameID))) return null;

		if (typeof gameID === 'string')
			gameID = parseInt(gameID);

		for (let i = 0; i < categories.length; i++) {
			for (let c = 0; c < categories[ i ].games.length; c++) {
				if (categories[ i ].games[ c ].id === gameID)
					return categories[ i ].games[ c ];
			}
		}

		return null;
	},
}
