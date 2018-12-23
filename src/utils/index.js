/*
* 时间格式化
* @method GetDateTime
* @param {Object} dateObj 时间对象 new Date()
* @param {string} format 格式 例如 'Y-m-d h:i:s'
* @return {string}
*/
const $GetDateTime = function (dateObj, format) {
	if (dateObj) {
		if (typeof (dateObj) === 'string') {

			var tempIndex = dateObj.lastIndexOf('.');
			if (tempIndex > -1) {
				dateObj = dateObj.substring(0, tempIndex);
			}

			dateObj = dateObj.replace('T', ' ').replace(/\-/g, "/");
		}
		var date = new Date(dateObj);

		var obj = {
			y: date.getFullYear(),
			m: date.getMonth() + 1,
			d: date.getDate(),
			h: date.getHours(),
			min: date.getMinutes(),
			s: date.getSeconds()
		}
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				var element = obj[key];
				obj[key] = element < 10 ? '0' + element : element;
			}
		}
		if (format) {
			return format.replace('Y', obj.y)
				.replace('m', obj.m)
				.replace('d', obj.d)
				.replace('h', obj.h)
				.replace('i', obj.min)
				.replace('s', obj.s)
		}

		return obj.y + '-' + obj.m + '-' + obj.d + ' ' + obj.h + ':' + obj.min + ':' + obj.s; //返回时间格式
	} else
		return ''
}

export {
	$GetDateTime
}