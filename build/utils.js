/**
 * Created by VC on 2017/9/21.
 */

const
	moment = require("moment")
;

Utils.getCliParams = getCliParamsFactory();
Utils.isProduction = isProduction;
Utils.log = log;
Utils.assignInsight = assignInsight;
Utils.isObject = isObject;
Utils.isArray = isArray;
Utils.getVersionStamp = getVersionStampFactory();

function getCliParamsFactory(){

	const
		minimist = require("minimist")
	;

	let
		cliAgr
	;

	return (isFore) => {
		if(!cliAgr && !isFore){
			cliAgr = cliAgr || minimist(process.argv.slice(2), {
				default: {}
			});
		}
		return cliAgr;
	};

}

/**
 * 是否为 产生环境 构建
 * @return { Boolean }
 */
function isProduction(){

	let aliOnf = Utils.getCliParams();

	return !!(aliOnf["p"] || aliOnf["production"]);

}

const slice = Array.prototype.slice;

function log(){
	let arrLog = slice.call(arguments);
	arrLog.unshift("-----");
	console.log.apply(console, arrLog);
}

/**
 * Smart Deep Mode For Object.assign
 * @param target
 * @param source
 * @returns {*}
 */
function assignInsight(target, source){

	for(let prop in source){

		let
			isExtendAssign,
			isPushAssign
		;

		if(!source.hasOwnProperty(prop)){ continue }

		isExtendAssign = isObject(source[prop]);
		isPushAssign = isArray(source[prop]);

		if(isExtendAssign){

			target[prop] = isObject(target[prop]) ?
				target[prop] :
				{}
			;

			target[prop] = assignInsight(target[prop], source[prop]);

		}else if(isPushAssign){

			target[prop] = isArray(target[prop]) ?
				target[prop].concat(source[prop]) :
				source[prop]
			;

		}else{

			target[prop] = "" === source[prop] ?
				target[prop] :
				source[prop]
			;

		}

	}

	return target;

}

const toString = Object.prototype.toString;

function isObject(target){
	return "[object Object]" === toString.call(target);

}

function isArray(target){
	return "[object Array]" === toString.call(target);
}

function getVersionStampFactory(){
	let _stamp;
	return () =>{
		if(!_stamp){
			_stamp = moment().format("YY-ww-d-HH-mm".split("-").reverse().join(""));
		}
		return _stamp;
	};
}

function Utils(){ }

module.exports = Utils;
