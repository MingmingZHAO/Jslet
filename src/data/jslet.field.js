/*
This file is part of Jslet framework

Copyright (c) 2013 Jslet Team

GNU General Public License(GPL 3.0) Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please visit: http://www.jslet.com/license.
*/

jslet.data.DataType = {
	NUMBER: 'N', //Number
	STRING: 'S', //String
	DATE: 'D',  //Date
	TIME: 'T',  //Time
	BOOLEAN: 'B', //Boolean
	DATASET: 'V', //Dataset field
	GROUP: 'G'  //Group Field
};
/**
 * @class Field 
 * 
 * @param {String} fieldName Field name
 * @param {jslet.data.DataType} dataType Data type of field
 */
jslet.data.Field = function (fieldName, dataType) {
	/**
	 * {jslet.data.Dataset}
	 */
    this.dataset;

    var findex = 0,
    ffieldName = fieldName,
    fdataType = dataType,
    flength = 0,
    fscale = 0,
    falignment = 'left',
    fdefaultExpr,
    fdefaultValue,
    fdisplayLabel,
    fdisplayWidth = 0,
    feditMask,
    fdisplayFormat,
    fdateFormat,
	fformula,
    freadOnly = false,
    fvisible = true,
    fenabled = true,
    funitConverted = false,
    flookupField,
    fdisplayControl,
    feditControl,
    fsubDataset,
    furlExpr,
    finnerUrlExpr,
    furlTarget,
    fclientTranslate = true,
    finputValueField,
    fdisplayValueField,
    fbetweenStyle = false,
    fmaxValueField,
    frequired = false,
    fnullText,
    frange,
    fregularExpr,
    fxss = true,
    fcustomValidator,
    fvalidChars, //Array of characters
    fdateChar = null,
    fdateRegular,
    fparent, //parent field object
    fchildren; //child field object, only group field has child field object.

    this.validator = new jslet.data.FieldValidator(this);
    /**
     * Get field name
     * 
     * @return {String}
     */
    this.name = function () {
        return ffieldName
    }

    /**
     * Get field data type
     * 
     * @param {jslet.data.DataType}
     */
    this.getType = function () {
        return fdataType
    }

    /**
     * Get or set parent field object.
     * It is ignored if dataType is not jslet.data.DataType.GROUP
     * 
     * @param {jslet.data.Field or undefined} parent Parent field object.
     * @return {jslet.data.Field or this}
     */
    this.parent = function (parent) {
    	if(parent===undefined)
    		return fparent;
    	fparent = parent;
        return this
    }

    /**
     * Get or set child fields of this field.
     * It is ignored if dataType is not jslet.data.DataType.GROUP
     * 
     * @param {jslet.data.Field[] or undefined} children Child field object.
     * @return {jslet.data.Field or this}
     */
    this.children = function (children) {
    	if(children === undefined)
    		return fchildren;
    	
    	fchildren = children;
        return this
    }
    
    /**
     * Get or set field index.
     * Dataset uses this property to resolve field order.
     * 
     * @param {Integer or undefined} index Field index.
     * @return {Integer or this}
     */
    this.index = function (index) {
    	if(index===undefined)
    		return findex;
        findex = index;
        return this
    }

    /**
     * Get or set field stored length.
     * If it's a database field, it's usually same as the length of database.  
     * 
     * @param {Integer or undefined} len Field stored length.
     * @return {Integer or this}
     */
    this.length = function (len) {
    	if(len === undefined)
    		return flength;
        flength = len;
        return this
    }
    
    /**
     * Get edit length.
     * Edit length is used in editor to input data.
     * 
     * @return {Integer}
     */
    this.getEditLength = function () {
        if (flookupField) {
            var codeFld = flookupField.codeField();
            var lkds = flookupField.lookupDataset();
            if (lkds && codeFld) {
                var lkf = lkds.getField(codeFld);
                if (lkf)
                    return lkf.getEditLength()
            }
        }

        return flength > 0 ? flength : 10
    }

    /**
     * Get or set field decimal length.
     * 
     * @param {Integer or undefined} scale Field decimal length.
     * @return {Integer or this}
     */
    this.scale = function (scale) {
    	if(scale===undefined)
    		return fscale;
    	
        fscale = scale;
        return this
    }

    /**
     * Get or set field alignment.
     * 
     * @param {String or undefined} alignment Field alignment.
     * @return {String or this}
     */
    this.alignment = function (alignment) {
    	if(alignment === undefined){
    		if(fdataType == jslet.data.DataType.NUMBER){
    			return 'right';
    		}
    		return falignment;
    	}
    	
        falignment = alignment;
        if (this.dataset != null) {
            var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.UPDATECOLUMN, {
                fieldName: ffieldName
            });
            this.dataset.refreshControl(evt)
        }
        return this
    }

    /**
     * Get or set field default expression.
     * This expression will be calculated when inserting a record.
     * 
     * @param {String or undefined} defaultExpr Field default expression.
     * @return {String or this}
     */
    this.defaultExpr = function (defaultExpr) {
    	if(defaultExpr === undefined)
    		return fdefaultExpr;
    	
        fdefaultExpr = defaultExpr;
        return this
    }

    /**
     * Get or set field default value.
     * The data type of default value must be same as Field's.
     * Example:
     *   Number field: fldObj.defauleValue(100);
     *   Date field: fldObj.defaultValue(new Date());
     *   String field: fldObj.defaultValue('test');
     * 
     * @param {Object or undefined} dftValue Field default value.
     * @return {Object or this}
     */
    this.defaultValue = function (dftValue) {
    	if(dftValue === undefined)
    		return fdefaultValue;
        fdefaultValue = dftValue;
        return this
    }

    /**
     * Get or set field label.
     * 
     * @param {String or undefined} label Field label.
     * @return {String or this}
     */
    this.label = function (label) {
    	if(label === undefined)
    		return fdisplayLabel || ffieldName;
    	
        fdisplayLabel = label;
        if (this.dataset != null) {
            var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.METACHANGE, {
                displayLabel: fdisplayLabel,
                required: frequired
            });
            this.dataset.refreshControl(evt)
        }
        return this
    }

    /**
     * Get or set field is required or not.
     * 
     * @param {Boolean or undefined} required Field is required or not.
     * @return {Boolean or this}
     */
    this.required = function (required) {
    	if(required === undefined)
    		return frequired;
    	
        frequired = required;
        if (this.dataset != null) {
            var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.METACHANGE, {
                displayLabel: fdisplayLabel,
                required: frequired
            });
            this.dataset.refreshControl(evt)
        }
        return this
    }
    
    /**
     * Get or set null text if the field value is null.
     * 
     * @param {String or undefined} nullText Field null text.
     * @return {String or this}
     */
    this.nullText = function (nullText) {
    	if(nullText === undefined)
    		return fnullText;
        fnullText = nullText;
        return this
    }

    /**
     * Get or set field display width.
     * Display width is usually used in DBTable column.
     * 
     * @param {Integer or undefined} displayWidth Field display width.
     * @return {Integer or this}
     */
    this.displayWidth = function (displayWidth) {
    	if(displayWidth === undefined){
            if (fdisplayWidth <= 0) {
                if (flength > 0)
                    return flength;
                return 12;
            } else
                return fdisplayWidth
    	}
        fdisplayWidth = displayWidth;
        return this
    }
    
    /**
     * Get or set field edit mask.
     * 
     * @param {jslet.data.EditMask or undefined} mask Field edit mask.
     * @return {jslet.data.EditMask or this}
     */
    this.editMask = function (mask) {
    	if(mask === undefined)
    		return feditMask;
    	
    	var maskObj = mask;
        if (typeof maskObj == 'string')
            var maskObj = new Function('return ' + maskObj)();
    	
        feditMask = maskObj;
        return this
    }
    
    /**
     * Get or set field display format.
     * For number field like: #,##0.00
     * For date field like: yyyy/MM/dd
     * 
     * @param {String or undefined} format Field display format.
     * @return {String or this}
     */
    this.displayFormat = function (format) {
    	if(format === undefined){
    		if(!fdisplayFormat && fdisplayFormat !== undefined)
    			return fdisplayFormat;
    		else{
    			if(fdataType == jslet.data.DataType.DATE)
    				return jslet.locale.Date.format;
    			else
    				return fdisplayFormat;
    		}
    	}
    	
        fdisplayFormat = format;
        fdateFormat = null;
        fdateChar = null;
        fdateRegular = null;
        
        if (this.dataset != null) {
            var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.UPDATECOLUMN, {
                fieldName: ffieldName
            });
            this.dataset.refreshControl(evt)
        }
        return this
    }

    this.dateFormat = function(){
    	if(fdateFormat)
    		return fdateFormat;
    	
    	if(this.getType() != jslet.data.DataType.DATE)
    		return null;
    	
    	var displayFmt = this.displayFormat().toUpperCase();
    	fdateFormat = '';
    	var c;
    	for(var i = 0, len = displayFmt.length; i < len; i++){
    		c = displayFmt.charAt(i);
    		if('YMD'.indexOf(c) < 0)
    			continue;
    		
    		if(fdateFormat.indexOf(c) < 0)
    			fdateFormat += c;
    	}
    	return fdateFormat;
    }
    
    this.dateSeparator = function(){
    	if(fdateChar)
    		return fdateChar;
    	
    	if(this.getType() != jslet.data.DataType.DATE)
    		return null;
    	
    	var displayFmt = this.displayFormat().toUpperCase();
    	for(var i = 0, c, len = displayFmt.length; i < len; i++){
    		c = displayFmt.charAt(i);
    		if('YMD'.indexOf(c) < 0){
    			fdateChar = c;
    			return c;
    		}
    	}
    }
    
    this.dateRegular = function(){
    	if(fdateRegular)
    		return fdateRegular;
    	var dateFmt = this.dateFormat(),
    	    dateSeparator = this.dateSeparator(),
    	    result = ['^'];
    	for(var i = 0, c; i < dateFmt.length; i++){
    		if(i > 0){
    			result.push('\\');
    			result.push(dateSeparator);
    		}
    		c = dateFmt.charAt(i);
    		if(c == 'Y')
    			result.push('(\\d{4}|\\d{2})');
    		else
    		if(c == 'M')
    			result.push('(0?[1-9]|1[012])')
    		else
    			result.push('(0?[1-9]|[12][0-9]|3[01])');
    	}
    	result.push('$');
    	fdateRegular = {expr: new RegExp(result.join(''), 'gim'), message: jslet.locale.Dataset.invalidDate};
    	return fdateRegular;
    }
    /**
     * Get or set field formula. Example: 
     * <pre><code>
     *  fldObj.formula('[price]*[num]');
     * </code></pre>
     * 
     * @param {String or undefined} formula Field formula.
     * @return {String or this}
     */
    this.formula = function (formula) {
    	if(formula === undefined)
    		return fformula;
    	
        fformula = formula;
        if (this.dataset != null) {
            this.dataset.removeInnerFormularFields(ffieldName);
            var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.UPDATECOLUMN, {
                fieldName: ffieldName
            });
            this.dataset.refreshControl(evt)
        }
        return this
    }

    /**
     * Get or set field is visible or not.
     * 
     * @param {Boolean or undefined} visible Field is visible or not.
     * @return {Boolean or this}
     */
    this.visible = function (visible) {
    	if(visible === undefined){
    		if(fvisible){
    			var p = this.parent();
    			while(p){
    				if(!p.visible()) //if parent is invisible
    					return false;
    				p = p.parent();
    			}
    		}
    		return fvisible;
    	}
        fvisible = visible;
        if (this.dataset != null) {
            var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.METACHANGE, {
                visible: fvisible
            });
            this.dataset.refreshControl(evt)
        }
        return this
    }

    /**
     * Get or set field is enabled or not.
     * 
     * @param {Boolean or undefined} enabled Field is enabled or not.
     * @return {Boolean or this}
     */
    this.enabled = function (enabled) {
    	if(enabled === undefined)
    		return fenabled;
        fenabled = enabled;
        if (this.dataset != null) {
            var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.METACHANGE, {
                enabled: fenabled
            });
            this.dataset.refreshControl(evt)
        }
        return this
    }

    /**
     * Get or set field is readOnly or not.
     * 
     * @param {Boolean or undefined} readOnly Field is readOnly or not.
     * @return {Boolean or this}
     */
    this.readOnly = function (readOnly) {
    	if(readOnly === undefined){
            if (fformula)
                return true;
            // if translate beside server and 'finputValueField' is null, then it's
            // readonly.
            if (!freadOnly && !fclientTranslate && !finputValueField)
                return false;

            return freadOnly
    	}
    	
        freadOnly = readOnly;
        if (this.dataset != null) {
            var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.METACHANGE, {
                readOnly: freadOnly
            });
            this.dataset.refreshControl(evt)
        }
        return this
    }
    
    /**
     * Get or set if field participates unit converting.
     * 
     * @param {Boolean or undefined} unitConverted .
     * @return {Boolean or this}
     */
    this.unitConverted = function (unitConverted) {
    	if(unitConverted === undefined)
    		return fdataType == jslet.data.DataType.NUMBER? funitConverted:false;
    	
        funitConverted = unitConverted;
        if (fdataType == jslet.data.DataType.NUMBER && this.dataset != null && this.dataset.unitConvertFactor() != 1) {
            var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.UPDATECOLUMN, {
                fieldName: ffieldName
            });
            this.dataset.refreshControl(evt)
        }
        return this
    }

    /**
     * Get or set if field need be anti-xss.
     * If true, field value will be encoded.
     * 
     * @param {Boolean or undefined} isXss.
     * @return {Boolean or this}
     */
    this.xss = function(isXss){
    	if(isXss === undefined)
    		return fxss;
    	fxss = isXss;
    }

    /**
     * Get or set if field is a between style field.
     * 
     * @param {Boolean or undefined} flag.
     * @return {Boolean or this}
     */
    this.betweenStyle = function (flag) {
    	if(flag===undefined)
    		return fbetweenStyle;
        fbetweenStyle = flag;
        return this
    }

    /**
     * Get or set maximized value field name.
     * 
     * @param {String or undefined} fldName Maximized value field name.
     * @return {String or this}
     */
    this.maxValueField = function (fldName) {
    	if(fldName===undefined)
    		return fmaxValueField;
    	
        fmaxValueField = fldName;
        fbetweenStyle = fldName ? true : false;
        return this
    }
    
    /**
     * Get or set field display control. It is similar as DBControl configuration.
     * Here you need not set 'dataset' and 'field' property.   
     * Example:
     * <pre><code>
     * //Normal DBControl configuration
     * //var normalCtrlCfg = {type:"DBSpinEdit",dataset:"employee",field:"age",minValue:10,maxValue:100,step:5};
     * 
     * var displayCtrlCfg = {type:"DBSpinEdit",minValue:10,maxValue:100,step:5};
     * fldObj.displayControl(displayCtrlCfg);
     * </code></pre>
     * 
     * @param {DBControl Config or String} dispCtrl If String, it will convert to DBControl Config.
     * @return {DBControl Config or this}
     */
     this.displayControl = function (dispCtrl) {
    	 if(dispCtrl === undefined){
    	        if (fdataType == jslet.data.DataType.BOOLEAN && !fdisplayControl)
    	            return {
    	                type: 'dbcheckbox'
    	            };

    	        return fdisplayControl
    	 }
    	 
    	 fdisplayControl = (typeof (ffieldName) == 'string')?{ type: dispCtrl }:dispCtrl;
    	 return this
     }

     /**
      * Get or set field edit control. It is similar as DBControl configuration.
      * Here you need not set 'dataset' and 'field' property.   
      * Example:
      * <pre><code>
      * //Normal DBControl configuration
      * //var normalCtrlCfg = {type:"DBSpinEdit",dataset:"employee",field:"age",minValue:10,maxValue:100,step:5};
      * 
      * var editCtrlCfg = {type:"DBSpinEdit",minValue:10,maxValue:100,step:5};
      * fldObj.displayControl(editCtrlCfg);
      * </code></pre>
      * 
      * @param {DBControl Config or String} editCtrl If String, it will convert to DBControl Config.
      * @return {DBControl Config or this}
      */
     this.editControl = function (editCtrl) {
    	 if(editCtrl=== undefined){
	        if (this.feditControl)
	            return this.feditControl;

	        if (fdataType == jslet.data.DataType.BOOLEAN)
	            return {type: 'dbcheckbox'};
	        else if (fdataType == jslet.data.DataType.DATE)
	            return {type: 'dbdatepicker'};
	        else
	            return (flookupField != null)? {type: 'dbselect'}:{type: 'dbtext'}
    	 }
    	 
    	 this.feditControl = (typeof (editCtrl) === 'string') ? { type: editCtrl }:editCtrl;
     }

     /**
      * {Event} Get customized field text.
      * Pattern: function(fieldName, value){}
      *   //fieldName: String, field name;
      *   //value: Object, field value, the value type depends on field type;
      *   //return: String, field text;
      */
    this.onCustomFormatFieldText = null; // (fieldName, value)

    /**
     * Set boolean display value.
     */
    if (fdataType == jslet.data.DataType.BOOLEAN) {
        this.trueValue = true;
        this.falseValue = false
    } else {
        if (fdataType == jslet.data.DataType.NUMBER) {
            this.trueValue = 1;
            this.falseValue = 0
        } else {
            this.trueValue = 'True';
            this.falseValue = 'False'
        }
    }

    /**
     * {Event} Fired when get Lookup field object.
     * Pattern: function(lookupFieldObj){}
     *  //lookupFieldObj: jslet.data.LookupField
     */
    this.onGetLookupField = null;

    /**
     * Get or set lookup field object
     * 
     * @param {jslet.data.LookupField or undefined} lkFld lookup field Object.
     * @return {jslet.data.LookupField or this}
     */
    this.lookupField = function (lkFldObj) {
    	if(lkFldObj ===undefined){
            if (flookupField == null)
                return null;
            if (this.onGetLookupField != null && !this._inProcessing) {
                this._inProcessing = true;
                try {
                    this.onGetLookupField(flookupField);
                    // this.dataset.renderOptions(ffieldName);
                } finally {
                    this._inProcessing = false;
                    delete this._inProcessing
                }
            }
            return flookupField
    	}
        flookupField = lkFldObj;
        if (falignment != 'left')
            falignment = 'left';
        return this
    }

    /**
     * Set or get sub dataset.
     * 
     * @param {jslet.data.Dataset or undefined} subdataset
     * @return {jslet.data.Dataset or this}
     */
    this.subDataset = function (subdataset) {
    	if(subdataset === undefined)
    		return fsubDataset;
    	
        if (fsubDataset)
            fsubDataset.datasetField(null);
        fsubDataset = subdataset;
        subdataset.datasetField(this);
        return this
    }

    this.urlExpr = function (urlExpr) {
    	if(urlExpr === undefined)
    		return furlExpr;
    	
        furlExpr = urlExpr;
        finnerUrlExpr = null;
        return this
    }

    this.urlTarget = function (target) {
    	if(target === undefined){
            if (!furlTarget)
                return jslet.data.Field.URLTARGETBLANK;
            return furlTarget
    	}
        furlTarget = target
    }

    this.calcUrl = function () {
        if (!this.dataset || !furlExpr)
            return null;
        if (!finnerUrlExpr)
            finnerUrlExpr = new jslet.FormulaParser(this.dataset, furlExpr);
        return finnerUrlExpr.evalExpr()
    }

    /**
     * Get or set if transforming display text in client or server.
     * 
     * @param {Boolean or undefined} flag.
     * @return {Boolean or this}
     */
    this.clientTranslate = function (flag) {
    	if(flag === undefined)
    		return fclientTranslate;
        fclientTranslate = flag;
        return this
    }

    /**
     * Get or set input value field name.
     * 
     * @param {String or undefined} fldName Input value field name.
     * @return {String or this}
     */
    this.inputValueField = function (fldName) {
    	if(fldName === undefined)
    		return finputValueField;
    	
        finputValueField = fldName;
        return this
    }

    /**
     * Get or set display value field name.
     * 
     * @param {String or undefined} fldName Display value field name.
     * @return {String or this}
     */
    this.displayValueField = function (fldName) {
    	if(fldName === undefined)
    		return fdisplayValueField;
    	
        fdisplayValueField = fldName;
        return this
    }

    /**
     * Get or set field rang.
     * Range is an object as: {from: x, to: y}. Example:
     * <pre><code>
     * 	//For String field
     *    var range = {from: 'a', to: 'z'};
     *  //For Date field
     *    var range = {from: new Date(2000,1,1), to: new Date(2010,12,31)};
     *  //For Number field
     *    var range = {from: 0, to: 100};
     *  fldObj.range(range);
     * </code></pre>
     * 
     * @param {Range or Json String} range Field range;
     * @return {Range or this}
     */
    this.range = function (range) {
    	if(range === undefined)
    		return frange;
    	
        if (typeof (subds) == 'string')
            frange = new Function('return ' + range);
        else
            frange = range;
        return this
    }

    /**
     * Get or set regular expression.
     * You can specify your own validator with regular expression. If regular expression not specified, 
     * The default regular expression for Date and Number field will be used.
     * 
     * @param {String} expre Regular expression;
     * @param {String} message Message for invalid.
     * @return {Object} An object as: { expr: expr, message: message }
     */
    this.regularExpr = function (expr, message) {
    	if(arguments.length == 0){
            return fregularExpr;
    	}
    	
        fregularExpr = { expr: expr, message: message };
        return this
    }

    /**
     * Get or set customized validator.
     * 
     * @param {Function} validator Validator function.
     * Pattern:
     *   function(fieldObj, fieldValue){}
     *   //fieldObj: jslet.data.Field, Field object
     *   //fieldValue: Object, Field value
     *   //return: String, if validate failed, return error message, otherwise return null; 
     */
    this.customValidator = function (validator) {
    	if(validator === undefined)
    		return fcustomValidator;
    	
        fcustomValidator = validator;
        return this
    }
    /**
     * Valid characters for this field.
     */
    this.validChars = function(chars){
    	if(chars === undefined){
    		if(fvalidChars)
    			return fvalidChars;
    		if(fdataType == jslet.data.DataType.NUMBER){
    		   if(fscale)
    			  return '+-0123456789.';
    		   else
    		      return '+-0123456789';
    		}
    		if(fdataType == jslet.data.DataType.DATE){
    			return '0123456789' + (this.dateSeparator() ? this.dateSeparator() : '');
    		}
    	}
    	
    	fvalidChars = chars;
    }
}

jslet.data.Field.URLTARGETBLANK = '_blank';

/**
 * Create field object.
 * 
 * @param {Json Object} fieldConfig A json object which property names are same as jslet.data.Field. Example: {name: 'xx', type: 'N', ...}
 * @param {jslet.data.Field} parent Parent field object. It must be a 'Group' field.
 * @return {jslet.data.Field}
 */
jslet.data.createField = function (fieldConfig, parent) {
    var cfg = fieldConfig;
    if (!cfg.name)
        throw new Error('Property: name required!');
    var dtype = cfg.type;
    if (dtype == null)
    	dtype = jslet.data.DataType.STRING;
    else{
    	dtype = dtype.toUpperCase();
    	if(dtype != jslet.data.DataType.STRING && 
				dtype != jslet.data.DataType.NUMBER && 
				dtype != jslet.data.DataType.DATE && 
				dtype != jslet.data.DataType.BOOLEAN && 
				dtype != jslet.data.DataType.DATASET && 
				dtype != jslet.data.DataType.GROUP)
        dtype = jslet.data.DataType.STRING;
    }
    var fldObj = new jslet.data.Field(cfg.name, dtype);
    if (cfg.index != undefined)
        fldObj.index(cfg.index);
    
    fldObj.parent(parent);
    
    if (cfg.label != undefined)
        fldObj.label(cfg.label);

    if(dtype == jslet.data.DataType.DATASET){
        var subds = cfg.subDataset;
        if (subds) {
            if (typeof (subds) == 'string')
                subds = jslet.data.dataModule.get(subds);
            fldObj.subDataset(subds)
        }
        fldObj.visible(false);
    	return fldObj;
    }
    
    if (cfg.readOnly != undefined)
        fldObj.readOnly(cfg.readOnly);
    
    if (cfg.visible != undefined)
        fldObj.visible(cfg.visible);

    if (cfg.enabled != undefined)
        fldObj.enabled(cfg.enabled);

    if(dtype == jslet.data.DataType.GROUP){
        if (cfg.children){
        	var fldChildren = [];
        	for(var i = 0, cnt = cfg.children.length; i < cnt; i++){
        		fldChildren.push(jslet.data.createField(cfg.children[i], fldObj))
        	}
            fldObj.children(fldChildren);
        }
    	fldObj.alignment('center');
    	return fldObj
    }
    
    if (cfg.length != undefined)
        fldObj.length(cfg.length);

    if (cfg.scale != undefined)
        fldObj.scale(cfg.scale);

    if (cfg.alignment != undefined)//left,right,center
        fldObj.alignment(cfg.alignment);

    if (cfg.defaultExpr != undefined)
        fldObj.defaultExpr(cfg.defaultExpr);

    if (cfg.displayWidth != undefined)
        fldObj.displayWidth(cfg.displayWidth);

    if (cfg.editMask != undefined){
        fldObj.editMask(cfg.editMask);
    }
    if (cfg.displayFormat != undefined)
        fldObj.displayFormat(cfg.displayFormat);
    if (cfg.formula != undefined)
        fldObj.formula(cfg.formula);

    if (cfg.required != undefined)
        fldObj.required(cfg.required);
    if (cfg.nullText != undefined)
        fldObj.nullText(cfg.nullText);

    if (cfg.unitConverted != undefined)
        fldObj.unitConverted(cfg.unitConverted);
    var lkf = cfg.lookupField;
    if (lkf != undefined) {
        if (typeof lkf == 'string')
            lkf = new Function('return ' + lkf)();

        fldObj.lookupField(jslet.data.createLookupField(lkf))
    }
    if (cfg.editControl != undefined)
        fldObj.editControl(cfg.editControl);
    if (cfg.urlExpr != undefined)
        fldObj.urlExpr(cfg.urlExpr);

    if (cfg.urlTarget != undefined)
        fldObj.urlTarget(cfg.urlTarget);

    if (cfg.clientTranslate != undefined)
        fldObj.clientTranslate(cfg.clientTranslate);

    if (cfg.inputValueField != undefined)
        fldObj.inputValueField(cfg.inputValueField);

    if (cfg.displayValueField != undefined)
        fldObj.displayValueField(cfg.displayValueField);

    if (cfg.betweenStyle != undefined)
        fldObj.betweenStyle(cfg.betweenStyle);

    if (cfg.maxValueField != undefined)
        fldObj.maxValueField(cfg.maxValueField);

    if(cfg.range)
    	fldObj.range(cfg.rang);
    
    if(cfg.customValidator)
    	fldObj.customValidator(cfg.customValidator);
    
    return fldObj
}

/**
 * Create string field object.
 * 
 * @param {String} fldName Field name.
 * @param {Integer} length Field length.
 * @param {jslet.data.Field} parent (Optional)Parent field object. It must be a 'Group' field.
 * @return {jslet.data.Field}
 */
jslet.data.createStringField = function(fldName, length, parent) {
	var fldObj = new jslet.data.Field(fldName, jslet.data.DataType.STRING, parent);
	fldObj.length(length);
	return fldObj
}

/**
 * Create number field object.
 * 
 * @param {String} fldName Field name.
 * @param {Integer} length Field length.
 * @param {Integer} scale Field scale.
 * @param {jslet.data.Field} parent (Optional)Parent field object. It must be a 'Group' field.
 * @return {jslet.data.Field}
 */
jslet.data.createNumberField = function(fldName, length, scale, parent) {
	var fldObj = new jslet.data.Field(fldName, jslet.data.DataType.NUMBER, parent);
	fldObj.length(length);
	fldObj.scale(scale);
	return fldObj
}

/**
 * Create boolean field object.
 * 
 * @param {String} fldName Field name.
 * @param {jslet.data.Field} parent (Optional)Parent field object. It must be a 'Group' field.
 * @return {jslet.data.Field}
 */
jslet.data.createBooleanField = function(fldName, parent) {
	return new jslet.data.Field(fldName, jslet.data.DataType.BOOLEAN, parent)
}

/**
 * Create date field object.
 * 
 * @param {String} fldName Field name.
 * @param {jslet.data.Field} parent (Optional)Parent field object. It must be a 'Group' field.
 * @return {jslet.data.Field}
 */
jslet.data.createDateField = function(fldName, parent) {
	var fldObj = new jslet.data.Field(fldName, jslet.data.DataType.DATE, parent);
	return fldObj
}

/**
 * Create dataset field object.
 * 
 * @param {String} fldName Field name.
 * @param {jslet.data.Dataset} subDataset Detail dataset object.
 * @param {jslet.data.Field} parent (Optional)Parent field object. It must be a 'Group' field.
 * @return {jslet.data.Field}
 */
jslet.data.createDatasetField = function(fldName, subDataset, parent) {
	if (!subDataset)
		throw new Error('expected property:dataset in DatasetField!');
	if (typeof (subDataset) == 'string')
	    subDataset = jslet.data.dataModule.get(subDataset);

	var fldObj = new jslet.data.Field(fldName, jslet.data.DataType.DATASET, parent);
	fldObj.subDataset(subDataset);
	fldObj.visible(false);
	return fldObj
}

/**
 * Create group field object.
 * 
 * @param {String} fldName Field name.
 * @param {String} fldName Field label.
 * @param {jslet.data.Field} parent (Optional)Parent field object. It must be a 'Group' field.
 * @return {jslet.data.Field}
 */
jslet.data.createGroupField = function(fldName, label, parent) {
	var fldObj = new jslet.data.Field(fldName, jslet.data.DataType.GROUP, parent);
	fldObj.label(label);
	return fldObj
}

/**
 * @private
 */
jslet.data.Field.prototype.sortByIndex = function(fld1, fld2) {
	return fld1.index() - fld2.index();
}

/**
 * @class LookupField
 * 
 * A lookup field represents a field value is from another dataset named "Lookup Dataset";
 */
jslet.data.LookupField = function() {
    var flookupDataset,
    fkeyField,
    fcodeField,
    fnameField,
    fcodeFormat,
    fdisplayFields,
    finnerdisplayFields,
    fparentField,
    fmultiSelect,
    fmultiValueSeparator = ',',
    fonlyLeafLevel = true;

    /**
     * Get or set lookup dataset.
     * 
     * @param {jslet.data.Dataset or undefined} dataset Lookup dataset.
     * @return {jslet.data.Dataset or this}
     */
	this.lookupDataset = function(dataset) {
		if(dataset === undefined)
			return flookupDataset;
		
		flookupDataset = dataset;
		return this
	}

    /**
     * Get or set key field.
     * Key field is optional, if it is null, it will use LookupDataset.keyField instead. 
     * 
     * @param {String or undefined} keyFldName Key field name.
     * @return {String or this}
     */
	this.keyField = function(keyFldName) {
		if(keyFldName === undefined){
			if (fkeyField)
				return fkeyField;
			return flookupDataset.keyField();
		}
	    fkeyField = keyFldName;
	    return this
	}

    /**
     * Get or set code field.
     * Code field is optional, if it is null, it will use LookupDataset.codeField instead. 
     * 
     * @param {String or undefined} codeFldName Code field name.
     * @return {String or this}
     */
	this.codeField = function(codeFldName) {
		if(codeFldName === undefined){
			if (fcodeField)
				return fcodeField;
			return flookupDataset.codeField();
		}
		fcodeField = codeFldName;
	    return this
	}
	
	this.codeFormat = function(format) {
		if(format === undefined)
			return fcodeFormat;
		fcodeFormat = format;
		return this
	}

    /**
     * Get or set name field.
     * Name field is optional, if it is null, it will use LookupDataset.nameField instead. 
     * 
     * @param {String or undefined} nameFldName Name field name.
     * @return {String or this}
     */
	this.nameField = function(nameFldName) {
		if(nameFldName === undefined){
			if (fnameField)
				return fnameField;
			return flookupDataset.nameField();
		}
		fnameField = nameFldName;
	    return this
	}

    /**
     * Get or set parent field.
     * Parent field is optional, if it is null, it will use LookupDataset.parentField instead. 
     * 
     * @param {String or undefined} parentFldName Parent field name.
     * @return {String or this}
     */
	this.parentField = function(parentFldName) {
		if(parentFldName === undefined){
			if (fparentField)
				return fparentField;
			return flookupDataset.parentField();
		}
		fparentField = parentFldName;
	    return this
	}

	/**
	 * Identify if user can select multiple value.
	 * 
	 * @param {Boolean or undefined} multiSelect True - Use can select multiple value, false - otherwise.
	 * @return {Boolean or this}
	 */
	this.multiSelect = function(multiSelect) {
		if(multiSelect===undefined)
			return fmultiSelect;
		fmultiSelect = multiSelect;
		return this
	}
	
	/**
	 * An expression for display field value. Example:
	 * <pre><code>
	 * lookupFldObj.displayFields('[code]+"-"+[name]'); 
	 * </code></pre>
	 */
	this.displayFields = function(fieldExpr) {
		if(fieldExpr === undefined)
			return !fdisplayFields? this.getDefaultDisplayFields(): fdisplayFields;
		
		if (fdisplayFields != fieldExpr) {
			fdisplayFields = fieldExpr;
			finnerdisplayFields = new jslet.FormulaParser(flookupDataset,fieldExpr)
		}
		return this
	}
	
	/**
	 * @private
	 */
	this.getDefaultDisplayFields = function() {
		var expr = '[',fldName = this.codeField();
		if (fldName)
			expr += fldName + ']';
		fldName = this.nameField();

		if (fldName) {
			expr += '+"-"+[';
			expr += fldName + ']'
		}
		if (expr == '')
			expr = '"Not set displayFields"';
		return expr
	}

	/**
	 * @private
	 */
	this.getCurrentDisplayValue = function() {
		if (fdisplayFields == null)
			this.displayFields(this.getDefaultDisplayFields());
		finnerdisplayFields.setDataset(flookupDataset);
		return finnerdisplayFields.evalExpr()
	}

	/**
	 * Multi value separator. Single character allowed.
	 * Default is comma(,)
	 * 
	 * @param {String} seperator Single Character.
	 */
	this.multiValueSeparator = function(separator) {
		if(separator === undefined)
			return fmultiValueSeparator || ',';
		fmultiValueSeparator = separator;
		return this
	}

	/**
	 * Identify whether user can select leaf level item if lookup dataset is a tree-style dataset.
	 * 
	 * @param {Boolean or undefined} flag True - Only leaf level item user can selects, false - otherwise.
	 * @return {Boolean or this}
	 */
	this.onlyLeafLevel = function(flag) {
		if(flag === undefined)
			return fonlyLeafLevel;
		
		fonlyLeafLevel = flag;
		return this
	}
}

/**
 * Create lookup field object.
 * 
 * @param {Json Object} param A json object which property names are same as jslet.data.LookupField. Example: {lookupDataset: fooDataset, keyField: 'xxx', ...}
 * @return {jslet.data.LookupField}
 */
jslet.data.createLookupField = function(param) {
	var lkds = param.lookupDataset;
	if (!lkds)
		throw new Error('Property: lookupDataset required!');
	var lkf = new jslet.data.LookupField();

	if (typeof(lkds) == 'string')
		lkds = jslet.data.dataModule.get(lkds);

	lkf.lookupDataset(lkds);
	if (param.keyField != undefined)
		lkf.keyField(param.keyField);

	if (param.codeField != undefined)
		lkf.codeField(param.codeField);

	if (param.nameField != undefined)
		lkf.nameField(param.nameField);

	if (param.codeFormat != undefined)
		lkf.codeFormat(param.codeFormat);

	if (param.displayFields != undefined)
		lkf.displayFields(param.displayFields);

	if (param.parentField != undefined)
		lkf.parentField(param.parentField);

	if (param.multiSelect != undefined)
		lkf.multiSelect(param.multiSelect);

	if (param.multiValueSeperator != undefined)
		lkf.multiValueSeperator(param.multiValueSeperator);

	if (param.onlyLeafLevel != undefined)
		lkf.onlyLeafLevel(param.onlyLeafLevel);
	return lkf
}

/**
 * @class 
 */
jslet.data.EditMask = function(mask, keepChar, transform){
	/**
	 * {String} Mask String, rule:
	 *  '#': char set: 0-9 and -, not required
     *  '0': char set: 0-9, required
     *  '9': char set: 0-9, not required
     *  'L': char set: A-Z,a-z, required
     *  'l': char set: A-Z,a-z, not required
     *  'A': char set: 0-9,a-z,A-Z, required
     *  'a': char set: 0-9,a-z,A-Z, not required
     *  'C': char set: any char, required
     *  'c': char set: any char, not required
	 */
	this.mask = mask; 
	/**
	 * {Boolean} keepChar Keep the literal character or not
	 */
	this.keepChar = keepChar !== undefined ? keepChar: true;
	/**
	 * {String} transform Transform character into UpperCase or LowerCase,
	 *  optional value: upper, lower or null.
	 */
	this.transform = transform;
}

jslet.data.FieldValidator = function(fieldObj){
	this._fieldObj = fieldObj;
	this._checkRegularMessage();
}

jslet.data.FieldValidator.prototype = {
	
	intRegular: { expr: /(^-?[1-9][0-9]*$)|\d/ig},
	
	floatRegular: { expr: /((^-?[1-9])|\d)\d*(\.[0-9]*)?$/ig},

	setFieldObj: function(fieldObj){
		this._fieldObj = fieldObj;
	},
	
    /**
     * @private
     * Use this method to resolve reference between jslet.data.Field and jslet.locale
     */
    _checkRegularMessage: function(){
		if(!this.intRegular.message){
			this.intRegular.message = jslet.locale.Dataset.invalidInt;
			this.floatRegular.message = jslet.locale.Dataset.invalidFloat;
		}
    },
	
   /**
     * Check the specified character is valid or not.
     * Usually use this when user presses a key down.
     * 
     * @param {String} inputChar Single character
     * @param {Boolean} True for passed, otherwise failed.
     */
    checkInputChar: function (inputChar) {
    	var fldObj = this._fieldObj,
    	    validChars = fldObj.validChars();
    	
    	if(validChars && inputChar){
    		var c = inputChar.charAt(0);
    		return validChars.indexOf(c) >= 0;
    	}
        return true;
    },
    
    /**
     * Check the specified text is valid or not
     * Usually use this when a field loses focus.
     * 
     * @param {String} inputText Input text, it is original text that user inputed. 
     * @return {String} If input text is valid, return null, otherwise return error message.
     */
    checkInputText: function (inputText) {
    	var fldObj = this._fieldObj;
        //check required
    	if(!inputText){
	        if (fldObj.required())
	            return jslet.formatString(jslet.locale.Dataset.fieldValueRequired, [fldObj.label()]);
	        else
	        	return null;
    	}
    	
        var fldType = fldObj.getType();
        
    	//Check with regular expression
        var regular = fldObj.regularExpr();
        if(!regular){
            if (fldType == jslet.data.DataType.DATE)
            	regular = fldObj.dateRegular();
            else {
                if (fldType == jslet.data.DataType.NUMBER) {
                    if (!fldObj.scale())
                    	regular = this.intRegular;
                    else
                    	regular = this.floatRegular;
                }
            }
        }
        
        if (regular){
        	var regExpObj = regular.expr;
        	if(typeof regExpObj == 'string')
	           regExpObj = new RegExp(regular.expr, 'ig');
        	regExpObj.lastIndex = 0;
	        if (!regExpObj.test(inputText))
	            return regular.message;
        }
        
        //Check range
        var fldRange = fldObj.range();
        
        var value = inputText;
    	if(!fldObj.lookupField()){//Not lookup field
    		if(fldType == jslet.data.DataType.NUMBER){
                if (fldObj.scale() == 0)
                    value = parseInt(inputText);
                else
                    value = parseFloat(inputText)
    		}
    		if (fldType == jslet.data.DataType.DATE)// Date convert
                value = jslet.strToDate(inputText, fldObj.dateFormat());        		
    	}
        if(fldRange){
            var strFrom = from = fldRange.from, strTo = to = fldRange.to;
            var fmt = fldObj.displayFormat();
            
            if(fldType == jslet.data.DataType.DATE){
	            if(from)
	            	strFrom = jslet.formatDate(from, fmt);
	            if(to)
	            	strTo = jslet.formatDate(to, fmt);
            }
            
            if(fldType == jslet.data.DataType.NUMBER){
            	strFrom = jslet.formatNumber(from, fmt);
            	strTo = jslet.formatNumber(to, fmt);
            }
            
            if (from != undefined && to != undefined && (value < from || value > to))
                return jslet.formatString(jslet.locale.Dataset.notInRange, [strFrom, strTo]);
            
            if (from != undefined && to == undefined && value < from)
                return jslet.formatString(jslet.locale.Dataset.moreThanValue, [strFrom]);
            
            if (from == undefined && to != undefined && value > to)
                return jslet.formatString(jslet.locale.Dataset.lessThanValue, [strTo]);
        }
        //Customized sort
        if (fldObj.customValidator())
            return fldObj.customValidator()(fldObj, value)
        
        return null;
    }

}