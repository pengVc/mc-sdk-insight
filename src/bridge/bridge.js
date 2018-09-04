/**
 * Created by VC on 2018/8/29.
 */

export default class bridge {

	constructor(onf){

	}

	/**
	 * 调用 MC.App API
	 * @abstract
	 * @param { String } actionFlag 通信标识
	 * @param { * } message 通信数据
	 */
	callDomain(actionFlag, message){

		if(!actionFlag){ return false }

	}

	/**
	 * 调用 MC.App API
	 * @abstract
	 * @param { Function } callBack
	 */
	watchDomainMessage(callBack){

	}

}
