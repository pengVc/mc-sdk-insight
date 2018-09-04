/**
 * Created by VC on 2018/08/28.
 */

const
	kit = require("../utils"),
	CONSTANT = require("../const")
;

Git.checkSubmoduleEnVir = checkSubmoduleEnVir;

Git.initSubModule = initSubModule;
Git.makeGitAlias = makeGitAlias;
Git.up2Date = dayDayUp;
Git.smUpdate = smUpdate;

/**
 * 检测集成开发环境, 检测 submodule子工程 完整性
 * @returns { boolean }
 */
function checkSubmoduleEnVir(){

	const
		path = require("path"),
		shell = require("shelljs")
	;

	if(!shell.test("-f", path.join(__dirname, "../../", `${ CONSTANT.PUBLIC_PROJECT_NAME }/README.md`))){

		kit.log("\n\n");
		kit.log(`缺乏 [${ CONSTANT.PUBLIC_PROJECT_NAME }] 子工程!`);
		kit.log(
			"请执行: \nnpm run git" +
			"\n\n"
		);
		shell.exit();
		return;
	}

	return true;

}

/**
 * 初始化 git submodule
 */
function initSubModule(){

	const
		shell = require("shelljs")
	;

	makeGitAlias();
	shell.exec("git sub-i");
	kit.log("Git Submodule 初始化完毕!");
	kit.log("若需要拉取子工程代码, 请执行: git sub-up ");

}

function makeGitAlias(){

	execCommand(
		[
			"git config alias.fetchs \"fetch --recurse-submodules=yes\"",
			"git config alias.sub-i \"!git submodule init; git submodule update --remote\"",
			"git config alias.sub-up \"submodule -q foreach 'pwd; git checkout -q master; git reset -q HEAD --hard; git pull -r'\"",
			"git config alias.sub-push \"submodule -q foreach 'pwd; git push'\"",
			"git config alias.sub-sm \"submodule summary\"",
			"git config alias.sub-fetch \"submodule -q foreach 'pwd; git fetch'\"",
			"git config alias.pushc \"push --recurse-submodules=check\"",
			"git config alias.pusho \"push --recurse-submodules=on-demand\"",
			"git config fetch.recurseSubmodules yes"
		]
	);

	kit.log("Git Alias Complete!");
}

function dayDayUp(){
	0 && execCommand(

	);
}

function smUpdate(){
	let
		results
	;

	kit.log("正在更新同步 Git Submodule....");

	results = execCommand(
		"git submodule -q foreach \"pwd; git checkout -q master; git pull -r\""
	);

	return results[0] && results[0].output;
}

/**
 * 执行 cmd 命令
 * @param { Array | String } cmds
 * @returns { Array }
 */
function execCommand(cmds){
	const
		shell = require("shelljs")
	;

	if("string" === typeof cmds){
		cmds = [cmds];
	}

	return cmds.map((cmd) => shell.exec(cmd));
}

/**
 *
 * @param { String } hellMsg
 * @return {boolean}
 * @private
 */
function _hasNewRepoPullMsg(shellMsg){
	return !!(shellMsg.match(/From\s+git\.oschina\.net/i) || shellMsg.match(/From\s+gitee\.com/i));
}

function Git(){

}

module.exports = Git;

