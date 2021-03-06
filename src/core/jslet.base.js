/*
This file is part of Jslet framework

Copyright (c) 2013 Jslet Team

GNU General Public License(GPL 3.0) Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please visit: http://www.jslet.com/license.
*/

if (window.jslet === undefined || jslet === undefined){
	/**
	 * Root object/function of jslet framework. Example:
	 * <pre><code>
	 * var jsletObj = jslet('#tab');
	 * </code></pre>
	 * @param {String} Html tag id, like '#id'
	 * 
	 * @return {Object} jslet object of the specified Html tag
	 */
    jslet=window.jslet = function(id){
    	var ele = jQuery(id)[0];
    	return (ele && ele.jslet)?ele.jslet:null;
    }
}
jslet.version = '2.0.0.35';

jslet._AUTOID = 0;
jslet.nextId = function(){
	return 'jslet' + (jslet._AUTOID++);
}

/**
 * Namespace
 */
if(!jslet.data)
	jslet.data = {};
if(!jslet.ui)
	jslet.ui = {};
if(!jslet.locale)
	jslet.locale={};

//if (!jslet.rootUri) {
//    var ohead = document.getElementsByTagName('head')[0], uri = ohead.lastChild.src;
//    uri = uri.substring(0, uri
//					.lastIndexOf('/')
//					+ 1);
//    jslet.rootUri = uri
//}

/**
 * Javascript language enhancement
 */
if(!Array.indexOf){
	Array.prototype.indexOf = function(value){
		for(var i = 0, cnt = this.length; i < cnt; i++){
			if(this[i] == value)
				return i;
		}
		return -1
	}
}

if(!Object.deepClone){
	/**
	 * Deep clone object.
	 * <pre><code>
	 * 	var obj = {attr1: 'aaa', attr2: 123, attr3: {y1: 12, y2:'test'}};
	 *  var objClone = obj.deepClone();
	 * </code></pre>
	 * 
	 * @param {Function} callBack Identify these attributes will not be cloned.
	 * pattern:
	 *   function(object, attrName){}
	 *   //object: Object, cloning object
	 *   //attrName: String, attribute name
	 *   //return: 
	 */
/*	Object.prototype.deepClone = function(callBack){
	    var objClone;
	    if (this.constructor == Object){
	        objClone = new this.constructor(); 
	    }else{
	        objClone = new this.constructor(this.valueOf()); 
	    }
	    for(var key in this){
	        if ( objClone[key] != this[key] ){ 
	            if ( typeof(this[key]) == 'object' ){ 
	                objClone[key] = this[key].deepClone();
	            }else{
	                objClone[key] = this[key];
	            }
	        }
	    }
	    objClone.toString = this.toString;
	    objClone.valueOf = this.valueOf;
	    return objClone; 
	}*/ 
}

if(!String.prototype.trim){
	String.prototype.trim = function(){
		this.replace(/^\s+/, '').replace(/\s+$/, '')	
	}	
}

if(!String.prototype.startsWith){
	String.prototype.startsWith = function(pattern) {
    return this.lastIndexOf(pattern, 0) === 0;
  }
}

if(!String.prototype.endsWith){
	//From Prototype.js
	String.prototype.endsWith = function(pattern){
	    var d = this.length - pattern.length;
	    return d >= 0 && this.indexOf(pattern, d) === d;		
	}	
}

/*
 * Javascript language enhancement(end)
 */

/**
 * A simple map for Key/Value data. Example:
 * <pre><code>
 * var map = new jslet.SimpleMap();
 * map.set('background', 'red');
 * var color = map.get('background');//return 'red'
 * </code></pre>
 */
jslet.SimpleMap = function () {
    var _keys = new Array(), _values = new Array();
    this.get = function (key) {
        var len = _keys.length;
        for (var i = 0; i < len; i++) {
            if (key == _keys[i])
                return _values[i];
        }
        return null;
    }

    this.set = function (key, value) {
        var k = _keys.indexOf(key);
        if(k >=0){
            _values[k] = value;
        }else{
            _keys.push(key);
            _values.push(value);
        }
    }

    this.clear = function () {
        _keys.length = 0;
        _values.length = 0;
    }

    this.unset = function (key) {
        var len = _keys.length;
        for (var i = 0; i < len; i++) {
            if (_keys[key] == key) {
                _keys.splice(i, 1);
                _values.splice(i, 1);
                return;
            }
        }
    }

    this.count = function () {
        return _keys.length;
    }

    this.keys = function () {
        return _keys;
    }
}

/**
 * format message with argument. Example:
 * <pre><code>
 * var msg = jslet.formatString('Your name is:{0}', 'Bob');//return: your name is: Bob
 * var msg = jslet.formatString('They are:{0} and {1}', ['Jerry','Mark']);
 * </code></pre>
 * 
 * @param {String} Initial message, placeholder of argument is {n}, n is number 
 * @param {String/Array of String} args arguments
 * @return formatted message
 */
jslet.formatString = function (msg, args) {
    if (!args)
        return msg;

    if (typeof (args) == 'string')
        return msg.replace('\{0\}', args);
    var result = msg, cnt;
    if (args.length) {// array
        cnt = args.length;
        for (var i = 0; i < cnt; i++)
            result = result.replace('\{' + i + '\}', args[i])
    } else {// Hash
        var arrKeys = args.keys(), sKey;
        cnt = arrKeys.length;
        for (var i = 0; i < cnt; i++) {
            sKey = arrKeys[i];
            result = result.replace('\{' + sKey + '\}', args.get(sKey))
        }
    };
    return result
};

/**
 * private constant value
 */
jslet._SCALEFACTOR = '100000000000000000000000000000000000';

/**
 * Format a number. Example:
 * <pre><code>
 * var strNum = formatNumber(12345.999,'#,##0.00'); //return '12,346.00'
 * var strNum = formatNumber(12345.999,'#,##0.##'); //return '12,346'
 * var strNum = formatNumber(123,'000000'); //return '000123'
 * </code></pre>
 * 
 * 
 * @param {Number} num number that need format 
 * @param {String} pattern pattern for number, like '#,##0.00'
 * 	# - not required
 *  0 - required, if the corresponding digit of the number is empty, fill in with '0'
 *  . - decimal point
 *
 * @return {String}
 */
jslet.formatNumber = function(num, pattern) {
	if (!pattern)
		return num;
	var preFix = '', c;
	for (var i = 0; i < pattern.length; i++) {
		c = pattern.substr(i, 1);
		if (c == '#' || c == '0' || c == ',') {
			if (i > 0) {
				preFix = pattern.substr(0, i);
				pattern = pattern.substr(i)
			};
			break
		}
	};

	var suffix = '';
	for (var i = pattern.length - 1; i >= 0; i--) {
		c = pattern.substr(i, 1);
		if (c == '#' || c == '0' || c == ',') {
			if (i > 0) {
				suffix = pattern.substr(i + 1);
				pattern = pattern.substr(0, i + 1)
			};
			break
		}
	};

	var fmtarr = pattern ? pattern.split('.') : [''],fmtDecimalLen = 0;
	if (fmtarr.length > 1)
		fmtDecimalLen = fmtarr[1].length;

	var strarr = num ? num.toString().split('.') : ['0'],dataDecimalLen = 0;
	if (strarr.length > 1)
		dataDecimalLen = strarr[1].length;

	if (dataDecimalLen > fmtDecimalLen) {
		var factor = parseInt(jslet._SCALEFACTOR.substring(0, fmtDecimalLen
						+ 1));
		num = Math.round(num * factor) / factor;
		strarr = num ? num.toString().split('.') : ['0']
	};
	var retstr = '',str = strarr[0],fmt = fmtarr[0],comma = false,k = str.length - 1;
	for (var f = fmt.length - 1; f >= 0; f--) {
		switch (fmt.substr(f, 1)) {
			case '#' :
				if (k >= 0)
					retstr = str.substr(k--, 1) + retstr;
				break;
			case '0' :
				if (k >= 0)
					retstr = str.substr(k--, 1) + retstr;
				else
					retstr = '0' + retstr;
				break;
			case ',' :
				comma = true;
				retstr = ',' + retstr;
				break;
		}
	};
	if (k >= 0) {
		if (comma) {
			var l = str.length;
			for (; k >= 0; k--) {
				retstr = str.substr(k, 1) + retstr;
				if (k > 0 && ((l - k) % 3) == 0)
					retstr = ',' + retstr
			}
		} else
			retstr = str.substr(0, k + 1) + retstr
	};

	retstr = retstr + '.';

	str = strarr.length > 1 ? strarr[1] : '';
	fmt = fmtarr.length > 1 ? fmtarr[1] : '';
	k = 0;
	for (var f = 0; f < fmt.length; f++) {
		switch (fmt.substr(f, 1)) {
			case '#' :
				if (k < str.length)
					retstr += str.substr(k++, 1);
				break;
			case '0' :
				if (k < str.length)
					retstr += str.substr(k++, 1);
				else
					retstr += '0';
				break;
		}
	};
	return preFix + retstr.replace(/^,+/, '').replace(/\.$/, '') + suffix
}

/**
 * Format date with specified format. Example:
 * <pre><code>
 * var date = new Date();
 * console.log(jslet.formatDate(date, 'yyyy-MM-dd'));//2012-12-21
 * </code></pre>
 * 
 * @param {Date} date value.
 * @param {String} date format.
 * @return {String} String date after format
 */
jslet.formatDate = function(date, format) {
	var o = {
		'M+' : date.getMonth() + 1, // month
		'd+' : date.getDate(), // day
		'h+' : date.getHours(), // hour
		'm+' : date.getMinutes(), // minute
		's+' : date.getSeconds(), // second
		'q+' : Math.floor((date.getMonth() + 3) / 3), // quarter
		'S' : date.getMilliseconds()
		// millisecond
	};
	if (/(y+)/.test(format))
		format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4
						- RegExp.$1.length));
	for (var k in o)
		if (new RegExp('(' + k + ')').test(format))
			format = format.replace(RegExp.$1, RegExp.$1.length == 1
							? o[k]
							: ('00' + o[k]).substr(('' + o[k]).length));
	return format
};

/**
 * Convert a string to Date object. Example
 * <pre><code>
 * var date = jslet.strToDate('2014-03-25', 'ymd');
 * var date = jslet.strToDate('03/25/2014', 'mdy');
 * var date = jslet.strToDate('25/03/2014', 'dmy');
 * 
 * </code></pre>
 * 
 * @param {String} strDate String date
 * @param {String} format Date format, it a string which combines 'Y','M', 'D', like: 'YMD', 'MDY', 'DMY'
 * @return Date Object
 */
jslet.strToDate = function(strDate, format){
	if(!format || format.length <3)
		throw new Error('Date format required!');
	if(!strDate)
		return null;
	
	strDate = strDate.replace(/[^0-9]/ig, '');
	format = format.toUpperCase();
	var strYear = null, strMonth = null, strDay = null;
	var k = 0;
	
	function parse(index){
		var fmt = format.charAt(index);
		if(fmt == 'Y'){
			strYear = strDate.substr(k, 4);
			k += 4;
		}
		else{
			if(fmt == 'M')
				strMonth = strDate.substr(k, 2);
			else
				strDay = strDate.substr(k, 2);
			k += 2;
		}
	}
	
	parse(0);
	parse(1);
	parse(2);
	
	var today = new Date(), 
    year, month = today.getMonth(),
    day = today.getDate();

	if(strYear){
		if(strYear.length == 2)
			strYear = '20' + strYear;
		year = parseInt(strYear);
	}else
		year = today.getFullYear();
	
	month = strMonth ? parseInt(strMonth) - 1: today.getMonth(); 
	day = strDay ? parseInt(strDay) : today.getDate(); 
		
	return new Date(year, month, day);
}

/**
 * Convert string(ISO date format) to date
 * 
 * @param {String} dateStr date string with ISO date format. Example: 2012-12-21T09:30:24Z
 * @return {Date} 
 */
jslet.convertISODate= function(dateStr) {
    var a;
    if (typeof dateStr === 'string') {
        a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(dateStr);
        if (a) {
            return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
        }
    }
    return dateStr;
};

/**
 * private variable for convertToJsPattern,don't use it in your program
 */
jslet._currentPattern = {};

/**
 * private variable for convertToJsPattern,don't use it in your program
 * Convert sql pattern to javascript pattern
 * 
 * @param {String} pattern sql pattern
 * @param {String} escapeChar default is '\'
 * @return {String} js regular pattern
 */
jslet._convertToJsPattern = function(pattern, escapeChar) {
	if (jslet._currentPattern.pattern == pattern
			&& jslet._currentPattern.escapeChar == escapeChar)
		return jslet._currentPattern.result;

	jslet._currentPattern.pattern = pattern;
	jslet._currentPattern.escapeChar = escapeChar;

	var jsPattern = new Array(),len = pattern.length - 1,c, nextChar,bgn = 0, end = len,hasLeft = false,hasRight = false;
	if(pattern.charAt(0) == '%'){
	   bgn = 1;
	   hasLeft = true;
	}
        if(pattern.charAt(len) == '%'){
	   end = len - 1;
	   hasRight = true;
	}
	if(hasLeft && hasRight){
	   jsPattern.push('.*');
	}
	else if(hasRight){
	   jsPattern.push('^');
	}	
	for (var i = bgn; i <= end; i++) {
		c = pattern.charAt(i);
		if (c == '\\' && i < len) {
			nextChar = pattern.charAt(i + 1);
			if (nextChar == '%' || nextChar == '_') {
				jsPattern.push(nextChar);
				i++;
				continue
			}
		}
		else if (c == '_')
			jsPattern.push('.');
		else {
			if (c == '.' || c == '*' || c == '[' || c == ']' || c == '{'
					|| c == '}' || c == '+' || c == '(' || c == ')'
					|| c == '\\' || c == '?' || c == '$' || c == '^')
				jsPattern.push('\\');
			jsPattern.push(c)
		}
	};// end for
	if(hasLeft && hasRight || hasRight){
	   jsPattern.push('.*');
	}else
	if(hasLeft){
	   jsPattern.push('$');
	};

	jslet._currentPattern.result = new RegExp(jsPattern.join(''), 'ig');
	return jslet._currentPattern.result
};

/**
 *  Test if  the value to match pattern or not,for example:
 *  like('abc','%b%') -> true, like('abc','%b') -> false 
 *  
 *  @param {String} testValue need to test value
 *  @param {String} pattern sql pattern, syntax like SQL
 *  @return {Boolean} True if matched, false otherwise
 */
like = window.like = function(testValue, pattern, escapeChar) {
	if (!testValue || !pattern)
		return false;

	if (pattern.length == 0)
		return false;

	if (!escapeChar)
		escapeChar = '\\';

	var jsPattern = jslet._convertToJsPattern(pattern, escapeChar);
	return testValue && testValue.match(jsPattern) != null;
};

/**
 * Between function, all parameters' type must be same. Example:
 * <pre><code>
 * return between(4,2,5) //true
 * return between('c','a','b') // false
 * </code></pre>
 * 
 * @param {Object} testValue test value
 * @param {Object} minValue minimum value
 * @param {Object} maxValue maximum value
 * @return {Boolean} True if matched, false otherwise
 */
between = window.between = function(testValue, minValue, maxValue) {
	if (arguments.length != 3)
		return false;
	return testValue >= minValue && testValue <= maxValue
};

/**
 * Test if the value is in the following list. Eexample:
 * <pre><code>
 * return inlist('a','c','d','e') // false
 * 
 * </code></pre>
 * @param {Object} testValue test value
 * @param {Object} valueList - one or more arguments
 * @return {Boolean} True if matched, false otherwise
 */
inlist = window.inlist = function(testValue, valueList) {
	var cnt = arguments.length;
	if (cnt <= 2)
		return false;

	for (var i = 1; i < cnt; i++) {
		if (testValue == arguments[i])
			return true
	}
	return false
};

/**
 * Test if the given value is an array.
 * 
 * @param {Object} testValue test value
 * @return {Boolean} True if the given value is an array, false otherwise
 */
jslet.isArray = function (testValue) {
    return Object.prototype.toString.apply(testValue) === '[object Array]'
}

jslet.setTimeout = function(obj, func, time) {
    jslet.delayFunc = function () {
        func.call(obj);
    }
    setTimeout(jslet.delayFunc, time);
};

/**
 * Encode html string. Example:
 * <pre><code>
 * return jslet.htmlEncode('<div />') // 'lt;div /gt;'
 * </code></pre>
 * 
 * @param {String} htmlText html text
 * @return {String}
 */
jslet.htmlEncode = function(htmlText){
    if (htmlText) {
        return jQuery('<div />').text(htmlText).html();
    } else {
        return '';
    }
}

/**
 * Decode html string. Example:
 * <pre><code>
 * return jslet.htmlDecode('lt;div /gt;') // '<div />'
 * </code></pre>
 * 
 * @param {String} htmlText encoded html text
 * @return {String}
 */
jslet.htmlDecode = function(htmlText) {
    if (htmlText) {
        return jQuery('<div />').html(htmlText).text();
    } else {
        return '';
    }
}
