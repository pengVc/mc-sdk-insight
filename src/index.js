/**
 * Created by Tan on 2015/7/29.
 * Update by Vc on 2018/8/29.
 *
 * @description SDK.js For MobileCampus.Lantu 3rd Frame & IAB
 * @author Lantu FED TEAM
 * @version 2.0.1
 *
 */

import AuthStateMgr, { AUTH_STATE_TYPE } from "./auth";

import BridgeIab from "./bridge/iab";
import BridgeIFrame from "./bridge/iframe";

import { isIos, generateUuid, getUrlQsByRuntimeScript } from "./utils.js";
import UIWebViewHack from "./UIWebViewHack";

const
	SDK_VERSION = $_project.version,
	sdkNamespace = "MCK"
;

const
	isTopMode = top === window,
	isIFrameMode = top !== window
;

/**
 *
 * @returns sdk
 * @private
 */
export default function sdk(){
	return sdk;
}

((window, undefined) => {

	const
		iAuthState = new AuthStateMgr(),

		_watchActionStack = [],

		_waitingReadyStack = [],

		APIs = []
	;

	let
		conflict = window[sdkNamespace],

		appKey = getUrlQsByRuntimeScript("appkey"),

		shouldLazyInit = null !== getUrlQsByRuntimeScript("lazy"),

		bridge
	;

	if(isTopMode){
		bridge = new BridgeIab();
	}

	if(isIFrameMode){
		bridge = new BridgeIFrame();
	}

	sdk.version = SDK_VERSION;
	sdk.h5 = {};

	watchDomainMessage();

	if(!shouldLazyInit){
		setTimeout(auth, 520);
	}

	// 监听验证成功通信
	watchOnce("AUTH_SUCCESS", (isResolved) => {

		if(!isResolved){
			_waitingReadyStack.length = 0;
			iAuthState.setState(AUTH_STATE_TYPE["REJECTED"]);
			return;
		}

		iAuthState.setState(AUTH_STATE_TYPE["RESOLVED"]);

	});

	watchOnce("AVAILABLE_API", (api) => {

		let _sdk;

		APIs.length = 0;
		APIs.push.apply(APIs, api);

		if(0 === _waitingReadyStack.length){ return }

		_sdk = window[sdkNamespace];
		_sdk = sdk.isPrototypeOf(_sdk) ?
			_sdk :
			Object.create(sdk)
		;

		_waitingReadyStack.forEach((fn) => {
			fn.call(null, _sdk);
		});

	});

	/**
	 * 验证 访问 APP 权限
	 */
	sdk.auth = auth;

	/**
	 * 等待 app 验证通过之后, 执行回调栈
	 * @param { Function } fn
	 * @param { Function } [fallback]
	 * @returns { sdk }
	 */
	sdk.ready = ready;

	/**
	 * 调用 App API
	 * @param { String } apiName
	 * @param { * } [data] 通信数据
	 * @param { Function } [callback]
	 */
	sdk.h5.call = callDomain;

	/**
	 * 监听 APP 数据返回
	 * @param { String } strActionFlag
	 * @param { Function } callback
	 * @param { Object } [onf]
	 * @param { Boolean } [onf.once] 仅执行一次
	 * @returns {string}
	 */
	sdk.h5.watch = watch;

	/**
	 * 同  sdk.h5.watch
	 */
	sdk.h5.watchOnce = watchOnce;

	/**
	 * 监听APP 数据返回
	 */
	sdk.h5.unWatch = unWatch;

	sdk.h5.getApi = getApi;

	sdk.conflict = rollbackConflict;

	function watchDomainMessage(){

		bridge.watchDomainMessage((res) =>{

			const {
				actionFlag,
				message,
				isKeepListen
			} = res;

			if(0 === _watchActionStack.length){
				return
			}

			if(iAuthState.getState() !== AUTH_STATE_TYPE["RESOLVED"] && "AUTH_SUCCESS" !== actionFlag){
				return
			}

			((listenerList, resCurrentAction) => {

				let
					len = listenerList.length,
					listenerItem
				;

				while(len--){

					listenerItem = listenerList[len];
					if(resCurrentAction !== listenerItem.action){ continue }

					listenerItem.callback(message, listenerItem);

					if(listenerItem.once && !isKeepListen){
						listenerList.splice(len, 1);
					}

				}

			})(_watchActionStack, actionFlag);

		});

	}

	/**
	 * @param { String } [appKeyOverWrite]
	 */
	function auth(appKeyOverWrite){

		if(appKeyOverWrite){
			appKey = appKeyOverWrite;
		}

		if(!appKey){
			return alert("没有获取到 appKey .\n请按照 https://gitee.com/lantutech/mc-sdk 排查.");
		}

		iAuthState.setState(AUTH_STATE_TYPE["PENDING"]);

		bridge.callDomain("auth", {
			appKey: appKey,
			domain: location.origin
		});

	}

	/**
	 *
	 * @param { Function } fn
	 * @param { Function } [fallback]
	 * @return {function(): function()}
	 */
	function ready(fn, fallback){

		if("function" !== typeof fn){ return sdk }

		switch(iAuthState.getState()){

			case AUTH_STATE_TYPE["RESOLVED"]:
				fn(sdk);
				break;

			case AUTH_STATE_TYPE["PRISTINE"]:
			case AUTH_STATE_TYPE["PENDING"]:
				_waitingReadyStack.push(fn);
				break;

			default:
				"function" === typeof fallback && fallback();
		}

		return sdk;
	}

	function callDomain(apiName, data, callback){

		let
			isAuth,
			_actionFlag
		;

		switch(iAuthState.getState()){
			case AUTH_STATE_TYPE["PRISTINE"]:
				throw new Error("请确认你的 appKey 正确.");
				break;

			case AUTH_STATE_TYPE["PENDING"]:
				console.log("仍在验证中.. 请使用 `MCK.ready(fn)` 注册回调.");
				break;

			case AUTH_STATE_TYPE["RESOLVED"]:
				isAuth = true;
				break;

			default :
				throw new Error("请确认你的 appKey 正确.");
		}

		if(!isAuth){ return }

		if(apiName && -1 !== APIs.indexOf(apiName.toUpperCase())){

			// 没有传入 data 的情况
			if("function" === typeof data){
				callback = data;
				data = undefined;
			}

			_actionFlag = apiName + "_!_" + generateUuid();

			bridge.callDomain(_actionFlag, data);

			if("function" === typeof callback){
				sdk.h5.watchOnce(_actionFlag, (data) => {
					callback(data);
				});
			}

		}else{
			throw new Error("未找到该 [" + apiName + "] API, 请确认你调用的 API .");
		}

	}

	/**
	 *
	 * @param { String } strActionFlag
	 * @param { Function } callback
	 * @param { Object } [onf]
	 * @param { String } onf.flag
	 * @param { Boolean } onf.once
	 *
	 * @return {string|*|string}
	 */
	function watch(strActionFlag, callback, onf){

		let uuidFlag;

		if("string" !== typeof strActionFlag || "function" !== typeof callback){ return }

		onf = onf || {};

		// 目前 flag 标识用于 "删除"
		uuidFlag = onf.flag || generateUuid();

		_watchActionStack.push({
			once    : onf.once,
			flag    : uuidFlag,
			action  : strActionFlag.toUpperCase(),
			callback: callback
		});

		return uuidFlag;

	}

	function watchOnce(strActionFlag, listen, onf){
		onf = onf || {};
		onf.once = true;

		watch(strActionFlag, listen, onf);

		return sdk;
	}

	function unWatch(uuidFlag){

		let
			len = _watchActionStack.length
		;

		while(len--){
			if(uuidFlag === _watchActionStack[len].flag){
				_watchActionStack.splice(len, 1);
				break;
			}
		}

		return sdk;
	}

	function getApi(){
		return APIs.concat();
	}

	function rollbackConflict(){
		window[sdkNamespace] = conflict;
		conflict = null;
		return Object.create(sdk);
	}

	window[sdkNamespace] = Object.create(sdk);

})(window);


// 解决 ios 下的 iframe 中的表单无法获取焦点的bug
if(isIFrameMode && isIos()){
	UIWebViewHack();
}
