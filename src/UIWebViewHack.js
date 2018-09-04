/**
 * Created by VC on 2018/8/29.
 */

export default function(){

	let
		styleElem
	;

	document.addEventListener("touchend", (evt) => {
		let
			tagName = evt.target.tagName.toUpperCase()
		;

		if(!tagName || -1 === ["INPUT", "TEXTAREA"].indexOf(tagName.toUpperCase())){ return }

		window.focus();
		evt.target.focus();

	}, false);

	// 解决 ios iframe 不能滑动
	styleElem = document.createElement("style");
	styleElem.innerHTML = "body{position: absolute!important; top: 0; left: 0; right: 0; bottom: 0; overflow-y: auto!important; -webkit-overflow-scrolling: touch!important}";
	document.head.appendChild(styleElem);

}
