/**
 * Created by VC on 2018/8/29.
 */

const AUTH_STATE_TYPE = {

	// 未验证
	"PRISTINE": 0,

	// 已发送验证, 但还未返回
	"PENDING" : 1,

	// 验证失败
	"REJECTED": 2,

	// 验证成功
	"RESOLVED": 3
};

export default class AuthStateMgr {

	constructor(){
		this._state_ = AUTH_STATE_TYPE.PRISTINE;
	}

	setState(state){
		this._state_ = state;
		return this;
	}

	getState(){
		return this._state_;
	}

}

export { AUTH_STATE_TYPE }
