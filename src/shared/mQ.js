/**
* Shortcutted querySelectorAll
*
**/

function mQ(selector, ref){
	return ((ref || document).querySelectorAll(selector)||[]);
}

export default mQ;