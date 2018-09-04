/**
 * Created by VC on 2018/8/29.
 */

import Bridge from "./bridge";
import { generateUuid } from "../utils";

export default class bridgeIab extends Bridge {

	constructor(){
		super();

		let ua = navigator.userAgent;

		if(-1 === ua.toUpperCase().indexOf("LANTUMC")){
			this.callDomain = this.noop;
			this.watchDomainMessage = this.noop;
		}

		this.iabCallbackNs = "_$mck$_" + generateUuid();

	}

	/**
	 * @override
	 * @param actionFlag
	 * @param message
	 * @return {bridgeIab}
	 */
	callDomain(actionFlag, message){

		if(false === super.callDomain.apply(this, arguments)){
			return this;
		}

		let req = {

			data  : {
				action       : actionFlag.toUpperCase(),
				message      : message,
				type         : "IAB",
				iabCallbackNs: this.iabCallbackNs
			},

			origin: location.origin

		};

		req = JSON.stringify(req);
		req = encodeURIComponent(req);

		location.href = `lantumcampus://mc_sdk?data=${ req }`;

		return this;
	}

	/**
	 * @override
	 * @param callback
	 * @return {bridgeIab}
	 */
	watchDomainMessage(callback){

		if("function" !== typeof callback){
			return this
		}

		window[this.iabCallbackNs] = function(raw){

			const data = JSON.parse(decodeURI(raw));

			callback({

				// 通信标识
				actionFlag : data.action,

				// 业务数据
				message : data.message,

				// 是否保留 回调监听
				isKeepListen : !!data.isKeepListen

			});

		};

		return this;

	}

	noop(){

	}

}
