/**
 * Created by VC on 2018/8/29.
 */

import Bridge from "./bridge";

export default class bridgeIFrame extends Bridge{

	constructor(){
		super();
	}

	/**
	 * @override
	 * @param actionFlag
	 * @param message
	 * @return {bridgeIFrame}
	 */
	callDomain(actionFlag, message){

		if(false === super.callDomain.apply(this, arguments)){
			return this;
		}

		parent.postMessage({
			action : actionFlag.toUpperCase(),
			message: message,
			type   : "IFRAME"
		}, "*");

		return this;

	}

	/**
	 * @override
	 * @param callback
	 * @return {bridgeIFrame}
	 */
	watchDomainMessage(callback){

		if("function" !== typeof callback){
			return this
		}

		window.addEventListener("message", (evt) => {

			const
				resInfo = evt.data
			;

			callback({

				// 通信标识
				actionFlag : resInfo.action,

				// 业务数据
				message : resInfo.message,

				// 是否保留 回调监听
				isKeepListen : !!resInfo.isKeepListen

			});

		});

		return this;
	}

}
