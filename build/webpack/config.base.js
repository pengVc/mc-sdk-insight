/**
 * Created by VC on 2018/08/28.
 */

const
	path = require("path"),
	webpack = require("webpack"),
	CleanWebpackPlugin = require("clean-webpack-plugin")
;

const
	pkg = require("../../package.json")
;

const configBase = {

	target: "web",

	entry : "./src/index.js",

	output: {
		filename     : `mc-sdk.${ pkg.version } }.js`,
		path         : path.join(process.cwd(), "dist"),
		libraryTarget: "umd"
	},

	devtool: "source-map",

	plugins: [

		new CleanWebpackPlugin([
			"dist"
		], {
			root: process.cwd()
		}),

		new webpack.DefinePlugin({
			"$_project.version": JSON.stringify(pkg.version)
		})

	],

	module: {

		rules: [

			{
				test   : /\.js$/,
				exclude: /node_modules/,
				use    : {
					loader : "babel-loader",
					options: {

						presets: [
							[
								"@babel/preset-env",
								{
									"targets": {
										"browsers": ["chrome >= 48", "safari >= 8"]
									}
								}
							]
						],
						plugins: [
							["@babel/plugin-transform-runtime", {

							}]
						]

					}
				}
			}

		]

	}
};

module.exports = configBase;
