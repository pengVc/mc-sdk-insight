/**
 * Created by VC on 2017/9/21.
 */

const
	kit = require("./build/utils")
;

main();

function main(){

	const
		shell = require("shelljs"),
		cliOnf = kit.getCliParams(),
		isProduction = kit.isProduction()
	;

	if(__dirname !== process.cwd()){
		kit.log("请在项目根目录运行命令!");
		return shell.exit(1);
	}

	if(isProduction){
		process.env.NODE_ENV = "production";
	}

	_dispatchBuildFlow(cliOnf["action"])

}

/**
 * 引导构建工作流
 * @param { String } action
 * @private
 */
function _dispatchBuildFlow(action){

	const
		wpFlow = require("./build/webpack/flow"),
		deploy = require("./build/workflow/deploy"),
		git = require("./build/workflow/git")
	;

	switch((action || "").toUpperCase()){

		// prod级构建
		case "BUILD-PROJECT":
			wpFlow.build();
			break;

		// dev级构建
		case "DEV":
			wpFlow.dev();
			break;

		// 推送部署
		case "DEPLOY":
			deploy();
			break;

		// 产品级别构建 & 推送部署
		case "RELEASE":
			wpFlow
				.build()
				.then(deploy)
			;
			break;

		case "COMMIT":
			deploy.commit();
			break;

		case "GIT":
			git.makeGitAlias();
			git.initSubModule();
			break;

		default:
			kit.log(`未捕获的构建任务: ${action}`);
			break;

	}

}

