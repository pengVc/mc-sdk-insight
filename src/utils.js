/**
 * Created by VC on 2018/8/29.
 */


let _is_ios_runtime_vir;
function isIos(){

	let result;

	if(_is_ios_runtime_vir){
		result = _is_ios_runtime_vir;
	}else{
		let ua = navigator.userAgent;
		result = -1 !== ua.indexOf("iPhone") || ua.indexOf("iPad");
	}

	return result;

}

/**
 *
 * @return {string | *}
 */
function getUrlQsByRuntimeScript(paramKey){
	const scripts = document.getElementsByTagName("script");

	let
		reqUrl,
		ret
	;

	reqUrl = scripts[scripts.length - 1].src;
	ret = reqUrl.match(new RegExp(`[\\?&]${ paramKey }=([^&]+)`, "i"));

	getQueryFormatVal(reqUrl, paramKey);

	return ret ? ret[1] : null;
}

/**
 * 从 QueryString 格式字符串, 根据 key 拿到 value
 * @param { String } qsStr
 * @param { String } key
 * @returns { String || Null }
 */
function getQueryFormatVal(qsStr, key){

	let
		rawHash
	;

	if(!qsStr){ return null }

	qsStr = decodeURIComponent(qsStr).replace(/^\?/, "");
	rawHash = {};

	qsStr
		.split("&")
		.forEach((partial) => {
			let rawItem = partial.split("=");
			rawHash[rawItem[0]] = rawItem[1] || "";
		})
	;

	return rawHash.hasOwnProperty(key) ? rawHash[key] : null;

}

/**
 * 生成uuid
 * @param { Number } [count] 几倍8位长度
 * @returns {string}
 */
function generateUuid(count){

	if("number" !== typeof count || count !== count){
		count = 2;
	}

	return (count <= 1 ? "" : generateUuid(--count)) +
	       (Number((Math.random() + "").slice(2, 10) + ((new Date()).getTime() + "").slice(-10)).toString(16) + "").slice(0, 8)
	;
}


export {
	isIos,
	getUrlQsByRuntimeScript,
	generateUuid
};
