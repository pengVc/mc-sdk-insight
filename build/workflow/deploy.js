/**
 * Created by VC on 2018/08/28.
 */

const
	utils = require("../utils"),
	git = require("./git"),
	CONSTANT = require("../const")
;

const
	pkg = require("../../package"),
	shellExeConfig = {
		silent: true,
		fatal : true
	}
;

/**
 * 部署构建混淆文件到 public 子工程
 * @return { Promise }
 */
function Deploy(){

	const prDeploy = new Promise((resolve, reject) =>{

		_valid()

			.then(() =>{
				return _confirm();
			})

			.then(() =>{
				return _deploy();
			})

			.then(() =>{
				resolve();
				require("shelljs").exit(0);

			}, (err) =>{
				reject(err);
			})
		;

	});

	prDeploy.catch((err) =>{
		console.log(err);
	});

	return prDeploy;

}

Deploy.commit = _commit;
Deploy.deploy = _deploy;

/**
 * @Todo 混淆检测
 * @private
 */
function _valid(){
	return new Promise((resolve, reject) =>{

		if(!git.checkSubmoduleEnVir()){
			return reject();
		}

		resolve();
	});
}

/**
 * 确认提示
 * @return { Promise }
 * @private
 */
function _confirm(){

	const inquirer = require("inquirer");

	return new Promise((resolve, reject) =>{

		inquirer
			.prompt({
				type   : "confirm",
				name   : "confirmedDeploy",
				message: "Caution: 请再一次确认: \n-已经过测试 \n-已经过产品级构建",
				default: false
			})
			.then((result) =>{

				if(result.confirmedDeploy){
					resolve();
				}else{
					reject("NOT_CONFIRM_CONTINUE_DEPLOY");
				}

			}, reject)

		;

	});
}

/**
 * git commit
 * @private
 */
function _commit(){

	const
		path = require("path"),
		shell = require("shelljs")
	;

	const
		cliParams = utils.getCliParams()
	;

	let
		cmdResults,
		originFileName = `mc-sdk.${ pkg.version }_${ utils.getVersionStamp() }.js`,
		fileName = `mc-sdk.${ pkg.version }.js`
	;

	cmdResults = shell.exec("git sub-up", shellExeConfig);
	console.log(cmdResults.stdout);

	shell.cd(
		path.join(__dirname, "../../", CONSTANT.PUBLIC_PROJECT_NAME)
	);

	shell.exec(`git checkout master -f`, shellExeConfig);
	shell.exec(`git reset origin/master --hard`, shellExeConfig);

	shell.cp("-Rf",
		path.join(__dirname, "../../", `dist/${ originFileName }`),

		path.join(__dirname, "../../", `${ CONSTANT.PUBLIC_PROJECT_NAME }/${ fileName }`)
	);

	shell.cp("-Rf",
		path.join(__dirname, "../../", `dist/${ originFileName }.map`),

		path.join(__dirname, "../../", `${ CONSTANT.PUBLIC_PROJECT_NAME }/${ originFileName }.map`)
	);

	let
		commitCmds,
		commitParams
	;

	commitParams = cliParams.amend ? "--amend" : "";

	commitCmds = [
		`git add ${ fileName }`,
		`git commit -m "release: ${_getTimeSemantic(new Date)}" ${commitParams}`
	];

	commitCmds.forEach((cmd) =>{
		console.log(cmd);

		let cmdResults = shell.exec(cmd, shellExeConfig);

		console.log(cmdResults.stdout);
	});

}

/**
 * git push
 * @private
 */
function _push(){

	const
		path = require("path"),
		shell = require("shelljs")
	;

	const
		cliParams = utils.getCliParams()
	;

	shell.cd(
		path.join(__dirname, "../../", CONSTANT.PUBLIC_PROJECT_NAME)
	);

	shell.exec(`git checkout master -f`, shellExeConfig);

	let commitParams = cliParams.amend ? "-f" : "";
	shell.exec(`git push origin master ${commitParams}`);

}

/**
 * 执行构建部署
 * @private
 */
function _deploy(){

	return new Promise((resolve, reject) =>{

		console.log("\n");
		utils.log("start deploy flow:");

		_commit();
		_push();

		utils.log("success deploy flow!");

		resolve();

	});

}

function _getTimeSemantic(date){
	return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
}

module.exports = Deploy;
