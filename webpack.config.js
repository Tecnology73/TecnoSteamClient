const path    = require('path');
const webpack = require('webpack');
const plugins = require('webpack-load-plugins')();

module.exports = {
	entry  : {
		app    : './src/app.js',
		auth   : './src/auth.js',
		chat   : './src/chat.js',
		friends: './src/friends.js',
	},
	output : {
		path      : path.resolve(__dirname, './dist'),
		publicPath: '/dist/',
		filename  : '[name].js',
	},
	resolve: {
		alias: {
			vue: 'vue/dist/vue.js',
		},
	},
	plugins,
	target : 'electron-renderer',
	module : {
		loaders: [
			{
				test  : /\.vue$/,
				loader: 'vue-loader',
			},
			{
				test   : /\.js$/,
				loader : 'babel-loader',
				exclude: /node_modules/,
			},
			{
				test  : /\.(png|jpg|gif|svg|jpeg)$/,
				loader: 'file',
				query : {
					name: '[name].[ext]?[hash]',
				},
			},
		],
	},
};

if (process.env.NODE_ENV === 'production') {
	module.exports.plugins = [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"',
			},
		}),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false,
			},
		}),
	];
} else {
	module.exports.devtool = '#source-map';
}
