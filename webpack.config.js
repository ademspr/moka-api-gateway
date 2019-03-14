const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

var nodeModules = {};
fs.readdirSync('node_modules')
	.filter(function (x) {
		return ['.bin'].indexOf(x) === -1;
	})
	.forEach(function (mod) {
		nodeModules[mod] = 'commonjs ' + mod;
	});

module.exports = {
	// the main source code file
	entry: './src/index.ts',
	output: {
		// the output file name
		filename: 'index.js',
		// the output path               
		path: path.resolve(__dirname, 'dist')
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js"]
	},
	module: {
		rules: [
			{ test: /\.ts$/, loader: 'ts-loader' },
			{ test: /\.json$/, loader: 'json-loader' }
		]
	},
	plugins: [
		new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true })
	],
	target: "node",
	externals: nodeModules,
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		compress: true,
		port: 5000,
		hot: true
	}
};