/**
 * Created by Tan on 2015/7/29.
 *
 * @description SDK.js For MobileCampus.Lantu 3rd Frame
 * @author Lantu FED TEAM
 * @version 1.0.5
 *
 */

;(function(exports, win, undefined){

	"use strict";

	var
		conflict,

		sdkNamespace = "MCK",

		_appKey,

		AUTH_STATE,
		AUTH_STATE_HASH,

		_watchStack = [],
		_readyStack = [],
		APIs = []
	;

	conflict = exports[sdkNamespace];

	AUTH_STATE_HASH = {

		// 未验证
		"PRISTINE": 0,

		// 已发送验证, 但还未返回
		"PENDING" : 1,

		// 验证失败
		"REJECTED": 2,

		// 验证成功
		"RESOLVED": 3
	};
	AUTH_STATE = AUTH_STATE_HASH["PRISTINE"];

	/**
	 *
	 * @returns sdk
	 * @private
	 */
	function sdk(){
		return sdk;
	}

	sdk.version = "1.0.5";
	sdk.h5 = {};

	/**
	 * 自动获取 appkey
	 * @returns {string}
	 */
	function getUrlAppKey(){
		var 
			scripts = document.getElementsByTagName("script"),
			reqUrl,

			raw
		;

		reqUrl = scripts[scripts.length - 1].src;
		raw = reqUrl.match(/[\?&]appkey=([^&]+)/i);

		return raw[1];
	}

	/**
	 * 调用 MC API
	 * @param { String } action
	 * @param { *} message
	 * @private
	 */
	function _callH5(action, message){
		if(!action){ return }
		parent.postMessage({
			action : action.toUpperCase(),
			message: message
		}, "*");
	}

	_watchApp();

	function _watchApp(){
		win.addEventListener("message", function(evt){

			var
				data = evt.data,
				action = data.action,
				message = data.message
			;

			//console.log("receive message form [移动校园] --head:");
			//console.log(evt);

			if(0 === _watchStack.length){ return }

			if(AUTH_STATE !== AUTH_STATE_HASH["RESOLVED"] && "AUTH_SUCCESS" !== action){
				return
			}

			(function(listenStack, currentAction){

				var
					len = listenStack.length,
					listen
				;

				while(len--){
					listen = listenStack[len];
					if(currentAction !== listen.action){ continue }

					listen.callback(message, listen);
					if(listen.once){
						listenStack.splice(len, 1);
					}
				}

			})(_watchStack, action);

		});
	}

	/**
	 * 验证 访问 APP 权限
	 */
	sdk.auth = function(){

		AUTH_STATE = AUTH_STATE_HASH["PENDING"];

		_callH5("auth",{
			appKey: _appKey || getUrlAppKey(),
			domain: location.origin
		});

	};

	/**
	 * 等待 app 验证通过之后, 执行回调栈
	 * @param { Function } fn
	 * @param { Function } [fallback]
	 * @returns { sdk }
	 */
	sdk.ready = function(fn, fallback){

		if("function" !== typeof fn){ return sdk }

		switch (AUTH_STATE){

			case AUTH_STATE_HASH["RESOLVED"]:
				fn(sdk);
				break;

			case AUTH_STATE_HASH["PRISTINE"]:
			case AUTH_STATE_HASH["PENDING"]:
				_readyStack.push(fn);
				break;

			default:
				"function" === typeof fallback && fallback();
		}

		return sdk;
	};

	/**
	 * 调用 App API
	 * @param { String } apiName
	 * @param {*} [data]
	 * @param { Function } [callback]
	 */
	sdk.h5.call = function(apiName, data, callback){

		var isAuth;

		switch (AUTH_STATE){
			case AUTH_STATE_HASH["PRISTINE"]:
				throw new Error("请确认你的 appKey 正确.");
				break;

			case AUTH_STATE_HASH["PENDING"]:
				console.log("仍在验证中.. 请使用 `MCK.ready(fn)` 注册回调.");
				break;

			case AUTH_STATE_HASH["RESOLVED"]:
				isAuth = true;
				break;

			default :
				throw new Error("请确认你的 appKey 正确.");
		}

		if(!isAuth){ return }

		if(apiName && -1 !== APIs.indexOf(apiName.toUpperCase())){

			if("function" === typeof  data){
				callback = data;
				data = undefined;
			}

			_callH5(apiName, data);

			sdk.h5.watchOnce(apiName, function(data){
				callback(data);
			});

		}else{
			throw new Error("未找到该 [" + apiName + "] API, 请确认你调用的 API .");
		}

	};

	/**
	 * 监听 APP 数据返回
	 * @param { String } strAction
	 * @param { Function } callback
	 * @param { Object } [onf]
	 * @param { Boolean } [onf.once] 仅执行一次
	 * @returns {string}
	 */
	sdk.h5.watch = function(strAction, callback, onf){

		var flag;

		if("string" !== typeof strAction || "function" !== typeof callback){ return }

		onf = onf || {};
		flag = onf.flag;
		flag = flag || (new Date).getTime() + (Math.random() + "").substring(2, 4);

		_watchStack.push({
			once    : onf.once,
			flag    : flag,
			action  : strAction.toUpperCase(),
			callback: callback
		});

		return flag;

	};

	/**
	 * 同  sdk.h5.watch
	 */
	sdk.h5.watchOnce = function(strAction, listen, onf){
		onf = onf || {};
		onf.once = true;

		sdk.h5.watch(strAction, listen, onf);

		return sdk;
	};

	/**
	 * 监听APP 数据返回
	 */
	sdk.h5.unWatch = function(flag){

		var
			len = _watchStack.length
		;

		while(len--){
			if(flag === _watchStack[len].flag){
				_watchStack.splice(len, 1);
				break;
			}
		}

		return sdk;
	};

	sdk.h5.getApi = function(){
		return APIs.concat();
	};

	sdk.conflict = function(){
		exports[sdkNamespace] = conflict;
		conflict = null;
		return Object.create(sdk);
	};

	sdk.auth();

	// 监听验证成功通信
	sdk.h5.watchOnce("AUTH_SUCCESS", function(isResolved){

		if(!isResolved){
			_readyStack.length = 0;
			AUTH_STATE = AUTH_STATE_HASH["REJECTED"];
			return;
		}

		AUTH_STATE = AUTH_STATE_HASH["RESOLVED"];

	});

	sdk.h5.watchOnce("AVAILABLE_API", function(api){

		var _sdk;

		APIs.push.apply(APIs, api);

		if(0 === _readyStack.length){ return }

		_sdk = exports[sdkNamespace];
		_sdk = sdk.isPrototypeOf(_sdk) ?
			_sdk :
			Object.create(sdk)
		;

		_readyStack.forEach(function(fn){
			fn.call(null, _sdk);
		});

	});

	exports[sdkNamespace] = Object.create(sdk);

})(this, window);