/*
This file is part of Jslet framework

Copyright (c) 2013 Jslet Team

GNU General Public License(GPL 3.0) Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please visit: http://www.jslet.com/license.
*/

if(!jslet.data)
	jslet.data = {};

jslet.data.ApplyAction = {};
jslet.data.ApplyAction.QUERY = 0;

jslet.data.ApplyAction.INSERT = 1;
jslet.data.ApplyAction.UPDATE = 2;
jslet.data.ApplyAction.DELETE = 3;
jslet.data.ApplyAction.SELECTED = 4;

jslet.data.DataProvider = function() {
	this.url = '';
	this.params = new Array();
	var result = null, errorMsg = null;

	var successHandler = function(data) {
		var text = data;
		if (text && typeof(text) == 'string')
			result = jQuery.parseJSON(text);
		else
			result = text
    }

	var failureHandler = function(jqXHR, textStatus, errorThrown) {
		jslet.showException(textStatus)
	}

	var sendRequest = function(url, params, type,contentType,mimeType) {
		result = null;
		var options = {
				method : 'post',
				type:type ? type:'GET',
				async : false,
				data : params,
				success : successHandler,
				error : failureHandler
			};
		if(contentType)
			options.contentType = contentType;
		if(mimeType)
			options.mimeType = mimeType;
		
		new jQuery.ajax(url, options)
	}

	var checkErrorMessage = function(result, onApplyError, action) {
		if (!result)
			return false;

		errorMsg = result.errorMessage;
		if (errorMsg) {
			if (!onApplyError)
				jslet.showException(errorMsg);
			else
				onApplyError(action, errorMsg);
			return true
		}
		return false
	}

	this.applyQuery = function(url, condition, pageNum, pageSize, onApplyError) {
		result = null;
		var strParam = null;

		if (condition) {
			if (typeof(condition) != 'string')
				strParam = jQuery.toJSON(condition);
			else
				strParam = condition;
			strParam = 'condition=' + strParam
		}

		if (pageNum && pageNum > 0) {
			if (strParam)
				strParam += '&';
			else
				strParam = '';
			strParam += 'pageNum=' + pageNum + '&pageSize='
					+ String(pageSize > 0 ? pageSize : 200)
		}

		sendRequest(url, strParam);
		if (checkErrorMessage(result, onApplyError, jslet.data.ApplyAction.QUERY))
			return null;

		return result
	}

	this.applyInsert = function(url, insertedData, onApplyError) {
		if (!insertedData || insertedData.length == 0)
			return;
		result = null;
		sendRequest(url, jQuery.toJSON(insertedData),'POST','application/json','application/json');
		if (checkErrorMessage(result, onApplyError, jslet.data.ApplyAction.INSERT))
			return null;

		if (result && result.result)
		    result = result.result;
		return result
	}

	this.applyUpdate = function(url, updatedData, onApplyError) {
		if (!updatedData || updatedData.length == 0)
			return;
		result = null;
		sendRequest(url, jQuery.toJSON(updatedData),'POST','application/json','application/json');
		if (checkErrorMessage(result, onApplyError, jslet.data.ApplyAction.UPDATE))
			return null;

		if (result && result.result)
		    result = result.result;
		return result
	}

	this.applyDelete = function(url, deletedData, onApplyError) {
		if (!deletedData || deletedData.length == 0)
			return;
		result = null;
		sendRequest(url, jQuery.toJSON(deletedData),'POST','application/json','application/json');
		if (checkErrorMessage(result, onApplyError, jslet.data.ApplyAction.DELETE))
			return null;

		if (result && result.result)
		    result = result.result;
		return result
	}

	this.applySelected = function(url, selectedData, onApplyError) {
		if (!selectedData || selectedData.length == 0)
			return;
		result = null;
		sendRequest(url, jQuery.toJSON(selectedData),'POST','application/json','application/json');
		if (checkErrorMessage(result, onApplyError, jslet.data.ApplyAction.SELECTED))
			return null;

		if (result && result.result)
		    result = result.result;
		return result
	}

}
