/**
 * Created by VC on 2018/08/28.
 */

const
	pkg = require("../../package.json"),
	utils = require("../utils")
;

const configProd = {

	mode: "production",

	optimization: {
		nodeEnv: "production",
	},

	output: {

		filename: `mc-sdk.${ pkg.version }_${ utils.getVersionStamp() }.js`

	},

	plugins: [

	],

};

module.exports = configProd;

