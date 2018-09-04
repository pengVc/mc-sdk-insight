/**
 * Created by VC on 2017/9/21.
 */

const
	webpack = require("webpack")
;

const
	kit = require("../utils")
;

const
	baseConfig = require("./config.base"),
	devConfig = require("./config.dev"),
	prodConfig = require("./config.prod")
;

Flow.dev = dev;
Flow.build = build;


/**
 * 开发(调试)级别构建
 */
function dev(){

	const webpackConfig = _refineConfig();

	return _runWebpack(webpackConfig);

}

/**
 * 产品级别构建
 */
function build(){

	const webpackConfig = _refineConfig();

	// @Think: do sth else to help building project friendly

	return _runWebpack(webpackConfig);

}

/**
 * 运行 webpack 构建
 * @param webpackConfig
 * @return { Promise }
 * @private
 */
function _runWebpack(webpackConfig){

	return new Promise((resolve, reject) =>{

		webpack(webpackConfig, (err, stats) =>{
			if(err || stats.hasErrors()){
				// 在这里处理错误
				reject({
					info: err
				});
			}

			// 处理完成
			console.log(stats.toString({
				chunks: false,  // 使构建过程更静默无输出
				colors: true    // 在控制台展示颜色
			}));

			resolve();
		});

	});

}


function _refineConfig(){

	const isProduction = kit.isProduction();
	const webpackConfig = kit.assignInsight(baseConfig, isProduction ? prodConfig : devConfig);

	console.log(`构建类型: ${isProduction ? "产品级" : "开发级"} \n`);

	return webpackConfig;

}

function Flow(){

}

module.exports = Flow;
