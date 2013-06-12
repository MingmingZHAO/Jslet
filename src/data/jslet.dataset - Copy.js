/**
 * Jslet JavaScript framework, version 2.0 (c) 2013
 * 
 * License: GPL 3.0, visit http://www.jslet.com/ for details.
 * 
 */

/**
 * keep all dataset object,
 * key for dataset name, value for dataset object
 */

jslet.data.dataModule = new jslet.SimpleMap();
jslet.data.getDataset = function (dsName) {
    return jslet.data.dataModule.get(dsName)
}

/**
 * @class Dataset
 * 
 * @param {String} name dataset's name that must be unique in jslet.data.dataModule variable.
 */
jslet.data.Dataset = function (name) {
    var Z = this;
    Z._dsname = null; //Dataset name
    Z._dataList; //Array of data records
    Z._datasetListener = null; //Dataset event listener object, like: function(eventType/*jslet.data.DatasetEvent*/, dataset/*jslet.data.Dataset*/){}
    Z._translateListener = null; //Dataset event listener object, like: function(dataset/*jslet.data.Dataset*/, fieldName/*String*/, fieldText/*String*/){} 

    Z._fields = []; //Array of jslet.data.Field
    Z._normalFields = []; //Array of jslet.data.Field except group field
    Z._recno = -1;
    Z._filteredRecnoArray = null;

    Z._unitConvertFactor = 1;
    Z._unitName = null;

    Z._isAborted = false;
    Z._insertedDelta = []; //Array of record
    Z._updatedDelta = []; //Array of record
    Z._deletedDelta = []; //Array of record

    Z._status = 0; // 0:browse;1:created;2:updated;3:deleted;
    Z._subDatasetFields; //Array of dataset field object

    Z._filter = '';
    Z._innerFilter; //inner variable
    Z._findCondition;
    Z._innerFindCondition; //inner variable

    Z._innerFormularFields; //inner variable

    Z._filtered = false;
    Z._bof = false;
    Z._eof = false;
    Z._igoreEvent = false;
    Z._logChanged = true;

    Z._modiObject = null;
    Z._lockCount = 0;

    Z._indexFields = '';
    Z._innerIndexFields = null;
    var finnerIndexDataset = null;

    Z._convertDestFields = null;
    Z._innerConvertDestFields = null;

    Z._masterDataset = null;
    Z._detailDatasets = null; // array

    Z._datasetField = null; //jslet.data.Field 

    Z._linkedControls = []; //Array of DBControl except DBLabel
    Z._linkedLabels = []; //Array of DBLabel
    Z._silence = 0;
    Z._keyField;
    Z._codeField;
    Z._nameField;
    Z._parentField;
    Z._levelField;
    
    Z._contextRule = null;
    Z._contextRuleEnabled = false;

    Z._dataProvider = jslet.data.DataProvider ? new jslet.data.DataProvider() : null;

    Z._condition; //String query parameters 
    Z._queryUrl; //String

    Z._pageSize = 200;
    Z._pageNum = 1;
    Z._pageCount = 0;
    Z._errorFields = []; //Array of invalid field name 
    Z.name(name)
}

jslet.data.Dataset.prototype = new function () {

    /**
    * Clone a new dataset without data.
    * 
    * @param {String} newDsName New dataset's name.
    * @return {jslet.data.Dataset} Cloned dataset object
    */
    this.cloneDataset = function (newDsName) {
        var Z = this;
        if (!newDsName)
            newDsName = Z._dsname + '_copy';

        var result = new jslet.data.Dataset(newDsName);
        result._datasetListener = Z._datasetListener;
        result._translateListener = Z._translateListener;
        result._fields = Z._fields;
        result._normalFields = Z._normalFields;
        result._unitConvertFactor = Z._unitConvertFactor;
        result._unitName = Z._unitName;
        result._subDatasetFields = Z._subDatasetFields;
        result._filter = Z._filter;
        result._filtered = Z._filtered;
        result._logChanged = Z._logChanged;
        result._indexFields = Z._indexFields;
        result._keyField = Z._keyField;
        result._codeField = Z._codeField;
        result._nameField = Z._nameField;
        result._parentField = Z._parentField;
        result._levelField = Z._levelField;
        result._contextRule = Z._contextRule;
        return result
    }

    /**
     * Set or get page size.
     * 
     * @param {int} pageSize.
     * @return {Integer or this}
     */
    this.pageSize = function(pageSize){
    	if(pageSize === undefined)
    		return this._pageSize;
    	
   		this._pageSize = pageSize;
    	return this
    }

    /**
     * Set or get page number.
     * 
     * @param {int} pageNum.
     * @return {Integer or this}
     */
    this.pageNum = function(pageNum){
    	if(pageNum === undefined)
    		return this._pageNum;
    	
    	this._pageNum = pageNum;
    	return this
    }
    
    /**
     * Set or get page count.
     * 
     * @param {int} pageCount.
     * @return {Integer or this}
     */
    this.pageCount = function(pageCount){
    	if(pageCount === undefined)
    		return this._pageCount;
    	
    	this._pageCount = pageCount;
    	return this
    }
        
  /**
  * Set dataset's name.
  * 
  * @param {String} name Dataset's name that must be unique in jslet.data.dataModule variable.
  * @return {String or this}
  */
    this.name = function(name){
    	if(name === undefined)
    		return this._dsname;
    	
        var sn = this._dsname;
        if (sn)
            jslet.data.dataModule.unset(sn);

        if (name) {
            jslet.data.dataModule.unset(name);
            jslet.data.dataModule.set(name, this)
        }
        this._dsname = name;
        return this
    }
    
    /**
     * Set unit converting factor.
     * 
     * @param {Double} factor When changed this value, the field's display value will be changed by 'fieldValue/factor'.
     * @param {String} unitName Unit name that displays after field value.
     * @return {Double or this}
     */
    this.unitConvertFactor = function (factor, unitName) {
        var Z = this;
    	if(arguments.length == 0)
    		return Z._unitConvertFactor;
    	
        if (factor > 0)
            Z._unitConvertFactor = factor;
        else
            Z._unitConvertFactor = 1;

        Z._unitName = unitName;

        for (var i = 0, cnt = Z._normalFields.length, fldObj; i < cnt; i++) {
        	fldObj = Z._normalFields[i];
            if (fldObj.getType == jslet.data.DataType.NUMBER && fldObj.unitConverted())
                Z.refreshControl(new jslet.data.UpdateEvent(
						jslet.data.UpdateEvent.UPDATECOLUMN, {
						    fieldName: fldObj.name()
						}))
        } //end for
        return Z
    }

    /**
     * Set or get dataset event listener.
     * Pattern:
     * function(eventType, dataset){}
     * //eventType: jslet.data.DatasetEvent
     * //dataset: jslet.data.Dataset
     * 
     * Example:
     * <pre><code>
     *   dsFoo.datasetListener(function(eventType, dataset){
     *   	console.log(eventType);
     *   });
     * </code></pre>
     * 
     * @param {Function} listener Dataset event listener
     * @return {Function or this}
     */
    this.datasetListener = function(listener){
    	if(arguments.length ==0)
    		return this._datasetListener;
    	
    	this._datasetListener = listener;
    	return this
    }

    /**
     * Set or get translate event listener.
     * Pattern:
     * function(dataset, fieldName, fieldText){} 
     * // dataset: jslet.data.Dataset, 
     * // fieldName and fieldText: String
     * // return: {keyValue: key1, displayValue: 'displayValue'}
     * 
     * Example:
     * <pre><code>
     *   dsFoo.datasetListener(function(dataset, fieldName, inputText){
     *   	console.log(fieldName);
     *   var key = getKeyValue(); //getKeyValue is your own function
     *   var value = getDisplayValue();//getDisplayValue is your own function
     *   return {keyValue: key, displayValue: value};
     *   });
     * </code></pre>
     * 
     * @param {Function} listener.
     */
    this.translateListener = function(listener){
    	if(arguments.length ==0)
    		return this._translateListener;
    	
    	this._translateListener = listener;
    	return this
    }

    /**
     * Get dataset fields.
     * @return {Array of jslet.data.Field}
     */
    this.getFields = function () {
        return this._fields
    }

    /**
     * Get fields except group field
     * @return {Array of jslet.data.Field}
     */
    this.getNormalFields = function(){
    	return this._normalFields;
    }
    
    /**
     * @private
     */
    this.travelField = function(fields, callBackFn){
    	if(!callBackFn || !fields)
    		return;
    	var isBreak = false;
    	for(var i = 0, len = fields.length; i < len; i++){
    		var fldObj = fields[i];
    		isBreak = callBackFn(fldObj);
    		if(isBreak)
    			break;
    		
    		if(fldObj.getType() == jslet.data.DataType.GROUP){
    			isBreak = this.travelField(fldObj.children(), callBackFn);
    			if(isBreak)
    				break;
    		}
    	}
    	return isBreak;
    }
    
    /**
     * @private
     */
    this._cacheNormalFields = function(){
    	var arrFields = this._normalFields = [];
    	this.travelField(this._fields, function(fldObj){
    		if(fldObj.getType() != jslet.data.DataType.GROUP)
    			arrFields.push(fldObj);
    		return false //Identify if cancel traveling or not
    	});
    }
    
    /**
     * Set or get datasetField object
     * 
     * @param {Field} datasetField.
     * @return {jslet.data.Field or this}
     */
    this.datasetField = function(datasetField){
    	if(datasetField === undefined)
    		return this._datasetField;
    	this._datasetField = datasetField;
    	return this
    }

    /**
    * Add a new field object.
    * 
    * @param {jslet.data.Field} fldObj: field object.
    */
    this.addField = function (fldObj) {
        var Z = this;
        Z._fields.push(fldObj);
        fldObj.dataset = Z;
        if (fldObj.index() != 0)
            Z._fields.sort(fldObj.sortByIndex);
        if (fldObj.getType() == jslet.data.DataType.DATASET) {
            if (!Z._subDatasetFields)
                Z._subDatasetFields = [];
            Z._subDatasetFields.push(fldObj)
        }
        Z._cacheNormalFields();
    }

    /**
     * Remove field from dataset by name.
     * 
     * @param {String} fldName: field name.
     */
    this.removeField = function (fldName) {
        var Z = this;
    	var fldObj = Z.getField(fldName);
        if (fldObj) {
            if (fldObj.getType() == jslet.data.DataType.DATASET) {
                var k = Z._subDatasetFields.indexOf(fldObj);
                if (k >= 0)
                    Z._subDatasetFields.splice(k, 1)
            }
            Z._fields.splice(i, 1);
            fldObj.dataset = null;
            Z._cacheNormalFields();
        }
    }

    /**
     * Get field object by name.
     * 
     * @param {String} fldName: field name.
     * @return jslet.data.Field
     */
    this.getField = function (fldName) {
        if (!fldName || typeof (fldName) != 'string')
            return null;

        var arrField = fldName.split('.'), fldName1 = arrField[0];
        var fldObj = null;
    	this.travelField(this._fields, function(fldObj1){
    		var cancelTravel = false;
        	if(fldObj1.name() == fldName1){
        		fldObj = fldObj1;
        		cancelTravel = true;
        	}
    		return cancelTravel //Identify if cancel traveling or not
    	});

        if(!fldObj)
        	return null;
        
        if (arrField.length == 1)
            return fldObj;
        else {
            arrField.splice(0, 1);
            var lkf = fldObj.lookupField();
            if (lkf) {
                var lkds = lkf.lookupDataset();
                if (lkds)
                    return lkds.getField(arrField.join('.'))
            }
        }
        return null
    }

    /**
     * Get field object by name.
     * 
     * @param {String} fldName: field name.
     * @return jslet.data.Field
     */
    this.getTopField = function (fldName) {
        if (!fldName || typeof (fldName) != 'string')
            return null;
        var fldObj = this.getField(fldName);
        if(fldObj != null){
        	while(true){
        	if(fldObj.parent == null)
        		return fldObj;
        	}
        	fldObj = fldObj.parent;
        }
        return null;
    }
    
    /**
     * @Private,Sort function.
     * 
     * @param {Object} rec1: dataset record.
     * @param {Object} rec2: dataset record.
     */
    this.sortFunc = function (rec1, rec2) {
        var indexFlds = finnerIndexDataset._innerIndexFields, v1, v2, fname, flag = 1;
        for (var i = 0, cnt = indexFlds.length; i < cnt; i++) {
            fname = indexFlds[i].fieldName;
            v1 = finnerIndexDataset.fieldValueByRec(rec1, fname);
            v2 = finnerIndexDataset.fieldValueByRec(rec2, fname);
            if (v1 == v2)
                continue;
            if (v1 != null && v2 != null) {
                if (v1 < v2)
                    flag = -1;
                else
                    flag = 1
            } else if (v1 == null && v2 != null)
                flag = -1;
            else {
                if (v1 != null && v2 == null)
                    flag = 1
            }
            return flag * indexFlds[i].order
        } //end for
        return 0
    }

    /**
     * Set index fields,multiple fields joined by ','
     * 
     * @param {String} indFlds: index field name.
     * @return jslet.data.Field
     */
    this.indexFields = function (indFlds) {
        var Z = this;
        if(indFlds === undefined)
        	return Z._indexFields;
        
        Z._indexFields = indFlds;
        if (!Z._dataList || Z._dataList.length == 0 || !indFlds)
            return;
        var arrFlds = Z._indexFields.split(','), fname, fldObj, arrFName, indexNameObj, 
        	order = 1;//asce
        Z._innerIndexFields = [];
        for (var i = 0, cnt = arrFlds.length; i < cnt; i++) {
            fname = arrFlds[i];
            arrFName = fname.split(' ');
            if (arrFName.length == 1)
            	order = 1;
            else if (arrFName[1].toLowerCase() == 'asce')
            	order = 1; //asce
            else
            	order = -1; //desc
            fname = arrFName[0];
            fldObj = Z.getField(fname);
            Z._createIndexCfg(fldObj, order);
        } //end for

        var currec = Z.getRecord(), flag = Z.isContextRuleEnabled();
        if (flag)
            Z.disableContextRule();
        Z.disableControls();
        try {
            finnerIndexDataset = Z;
            Z._dataList.sort(Z.sortFunc);
            delete finnerIndexDataset;
            Z._refreshInnerRecno();
            var recCnt = Z.recordCount();
            if (recCnt > 2) {
                var rec;
                for (var i = 0; i < recCnt; i++) {
                    Z.innerSetRecno(i);
                    rec = Z.getRecord();
                    if (rec === currec)
                        break
                }
            }
        } finally {
            if (flag)
                Z.enableContextRule();
            Z.enableControls()
        }
        return this
    }

    /**
     * @private
     */
    this._createIndexCfg = function(fldObj, order){
        if(!fldObj)
        	return;
        if(fldObj.getType() != jslet.data.DataType.GROUP){
            this._combineIndexCfg(fldObj.name(), order)
        }else{
        	var children = fldObj.children();
        	if(children){
        		for(var k = 0, childCnt = children.length; k < childCnt; k++){
        			this._createIndexCfg(children[k], order);
        		}
        	}
        }
    }
    
    /**
     * @private
     */
    this._combineIndexCfg = function(fldName, order){
        for(var i = 0, len = this._innerIndexFields.length; i < len; i++){
        	if(this._innerIndexFields[i].fieldName == fldName){
        		this._innerIndexFields.splice(i,1);//remove duplicated field
        	}
        }
        var indexNameObj = {
                fieldName: fldName,
                order: order
            };
        this._innerIndexFields.push(indexNameObj)
    }
    
    /**
     * Set or get dataset filter expression
     * Filter to work depend on property: filtered,filtered must be true
     * <pre><code>
     *   dsFoo.filter('[name] like "Bob%"');
     *   dsFoo.filter('[age] > 20');
     * </code></pre>
     * 
     * @param {String} filterExpr: filter expression.
     * @return {String or this}
     */
    this.filter = function (filterExpr) {
        var Z = this;
        if(filterExpr === undefined)
        	return Z._filter;
        
        if (!filterExpr) {
            Z._innerFilter = null;
            Z._filtered = false;
            Z._filter = null;
            Z._filteredRecnoArray = null;
            return
        }
        Z._filter = filterExpr;
        Z._innerFilter = new jslet.FormulaParser(Z, filterExpr);
        return this
    }

    /**
     * Set or get filtered flag
     * Only filtered is true, the filter can work
     * 
     * @param {Boolean} afiltered: filter flag.
     * @return {Boolean or this}
     */
    this.filtered = function (afiltered) {
        var Z = this;
        if(afiltered === undefined)
        	return Z._filtered;
        
        if (afiltered && !Z._filter)
            Z._filtered = false;
        else
            Z._filtered = afiltered;

        Z.disableControls();
        try {
            if (!Z._filtered)
                Z._filteredRecnoArray = null;
            else
                Z._refreshInnerRecno();
            Z.first()
        }
        finally {
            Z.enableControls()
        }
        return this
    }
    
    /**
     * @private, filter data
     */
    this._filterData = function () {
        var Z = this;
        if (!Z._filtered || !Z._filter
				|| Z._status == jslet.data.DataSetStatus.INSERT
				|| Z._status == jslet.data.DataSetStatus.UPDATE)
            return true;
        var result = Z._innerFilter.evalExpr();
        return result
    }

    /**
     * @private
     */
    this._refreshInnerRecno = function () {
        var Z = this;
        if (!Z._dataList || Z._dataList.length == 0) {
            Z._filteredRecnoArray = null;
            return
        }
        Z._filteredRecnoArray = null;
        var tempRecno = [];
        for (var i = 0, cnt = Z._dataList.length; i < cnt; i++) {
            Z._recno = i;
            if (Z._filterData())
                tempRecno.push(i)
        }
        Z._filteredRecnoArray = tempRecno
    }

    /**
     * @private
     */
    this._fireDatasetEvent = function (evtType, dataset) {
        var Z = this;
        if (Z._silence || Z._igoreEvent || !Z._datasetListener)
            return;
        Z._datasetListener(evtType, dataset || Z)
    }

    /**
     * Get record count
     * 
     * @return {Integer}
     */
    this.recordCount = function () {
        if (this._dataList) {
            if (!this._filteredRecnoArray)
                return this._dataList.length;
            else
                return this._filteredRecnoArray.length
        }
        return 0
    }

    /**
     * Set or get record number
     * 
     * @param {Integer}record number
     * @return {Integer or this}
     */
    this.recno = function (recno) {
        var Z = this;
        if(recno === undefined)
        	return Z._recno;
        
        recno = parseInt(recno);
        if (recno == Z._recno)
            return;
        if (Z._status != jslet.data.DataSetStatus.BROWSE) {
            Z.confirm();
            if (Z._isAborted)
                return
        }
        Z._gotoRecno(this._checkEofBof(recno));
        return this
    }
    
    /**
     * @private
     */
    this._checkEofBof = function (recno) {
        var Z = this, cnt = Z.recordCount();
        if (cnt == 0) {
            Z._bof = true;
            Z._eof = true;
            return
        }
        Z._eof = false;
        Z._bof = false;
        if (recno >= cnt) {
            recno = cnt - 1;
            Z._eof = true
        }
        if (recno < 0) {
            recno = 0;
            Z._bof = true
        }
        return recno
    }

    /**
     * @private
     * Set record number(Private)
     * 
     * @param {Integer}recno - record number
     */
    this.innerSetRecno = function (recno) {
        this._recno = this._checkEofBof(recno)
    }

    /**
     * @private
     * Goto specified record number(Private)
     * 
     * @param {Integer}recno - record number
     */
    this._gotoRecno = function (recno) {
        var Z = this;
        if (Z._recno == recno)
            return false;
        var cnt = Z.recordCount(), k;
        if (cnt > 0) {
            if (recno < cnt || recno >= 0)
                k = recno;
            else
                k = -1
        } else
            k = -1;

        if (k < 0)
            return false;
        if (!Z._silence) {
            Z._isAborted = false;
            Z._fireDatasetEvent(jslet.data.DatasetEvent.BEFORESCROLL);
            if (Z._isAborted)
                return false;
            if (!Z._lockCount) {
                var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.BEFORESCROLL,
						{
						    recno: Z._recno
						});
                Z._refreshInnerControl(evt)
            }
        }

        var preno = Z._recno;
        Z._recno = k;
        if (Z._subDatasetFields && Z._subDatasetFields.length > 0) {
            var fldObj, subds;
            for (var i = 0, cnt = Z._subDatasetFields.length; i < cnt; i++) {
            	fldObj = Z._subDatasetFields[i];
                subds = fldObj.subDataset();
                if (subds) {
                    subds.confirm();
                    subds.dataList(Z.fieldValue(fldObj.name()));
                    var indexflds = subds.indexFields();
                    if (indexflds)
                        subds.indexFields(indexflds);
                    else
                        subds.refreshControl(jslet.data.UpdateEvent.updateAllEvent)
                }
            } //end for
        } //end if
        if (Z._contextRuleEnabled)
            Z.calcContextRule();

        if (!Z._silence) {
            Z._fireDatasetEvent(jslet.data.DatasetEvent.AFTERSCROLL);
            if (!Z._lockCount) {
                var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.SCROLL, {
                    preRecno: preno,
                    recno: k
                });
                Z._refreshInnerControl(evt)
            }
        }
        return true
    }

    /**
     * Abort insert/update/delete
     */
    this.abort = function () {
        this._isAborted = true
    }

    /**
     * @private
     * Move cursor back to startRecno(Private)
     * 
     * @param {Integer}startRecno - record number
     */
    this.moveCursorPrior = function (startRecno) {
        var Z = this;
        if (Z._status != jslet.data.DataSetStatus.BROWSE) {
            Z.confirm();
            if (Z._isAborted)
                return
        }

        if (Z.recordCount() == 0) {
            Z._bof = true;
            Z._eof = true;
            return
        }
        if (startRecno < 0) {
            Z._bof = true;
            return
        }
        Z._eof = false;
        Z._bof = false;
        Z._gotoRecno(startRecno - 1)
    }

    /**
     * @private
     * Move cursor forward to startRecno(Private)
     * 
     * @param {Integer}startRecno - record number
     */
    this.moveCursorNext = function (startRecno) {
        var Z = this;
        if (Z._status != jslet.data.DataSetStatus.BROWSE) {
            Z.confirm();
            if (Z._isAborted)
                return
        }
        var recCnt = Z.recordCount();
        if (recCnt == 0) {
            Z._bof = true;
            Z._eof = true;
            return
        }
        if (startRecno == recCnt - 1) {
            Z._eof = true;
            return
        }
        Z._bof = false;
        Z._eof = false;
        Z._gotoRecno(startRecno + 1)
    }

    /**
     * Move record cursor by record object
     * 
     * @param {Object}recordObj - record object
     * @return {Boolean} true - Move successfully, false otherwise. 
     */
    this.moveTo = function (recordObj) {
        var Z = this;
        if (Z._status != jslet.data.DataSetStatus.BROWSE) {
            Z.confirm();
            if (Z._isAborted)
                return
        }
        if (!Z._dataList || Z._dataList.length == 0)
            return false;
        var k = Z._dataList.indexOf(recordObj);
        if (k < 0)
            return false;
        if (Z._filteredRecnoArray) {
            k = Z._filteredRecnoArray.indexOf(k);
            if (k < 0)
                return false
        }
        Z._gotoRecno(k);
        return true
    }

    /**
     * @private
     */
    this.startSilenceMove = function (notLogPos) {
        var Z = this;
        var context = {};
        if (!notLogPos)
            context.recno = Z._recno;
        else
            context.recno = -999;

        Z._silence++;
        return context
    }

    /**
     * @private
     */
    this.endSilenceMove = function (context) {
        var Z = this;
        if (context.recno != -999 && context.recno != Z._recno)
            Z._gotoRecno(context.recno);
        Z._silence--
    }

    /**
     * Check dataset cursor at the last line
     * 
     * @return {Boolean}
     */
    this.isBof = function () {
        return this._bof
    }

    /**
     * Check dataset cursor at the first line
     * 
     * @return {Boolean}
     */
    this.isEof = function () {
        return this._eof
    }

    /**
     * Move cursor to first line
     */
    this.first = function () {
        this.moveCursorNext(-1)
    }

    /**
     * Move cursor to last line
     */
    this.next = function () {
        this.moveCursorNext(this._recno);
        return false
    }

    /**
     * Move cursor to prior line
     */
    this.prior = function () {
        this.moveCursorPrior(this._recno);
        return false
    }

    /**
     * Move cursor to next line
     */
    this.last = function () {
        this.moveCursorPrior(this.recordCount())
    }

    /**
     * @private
     * Check dataset status and confirm dataset 
     */
    this.checkStatusAndConfirm = function () {
        if (this._status != jslet.data.DataSetStatus.BROWSE)
            this.confirm()
    }

    /**
     * @private
     * Check dataset status and cancel dataset 
     */
    this.checkStatusByCancel = function () {
        if (this._status != jslet.data.DataSetStatus.BROWSE)
            this.cancel()
    }

    /**
     * Get child record count of current record
     * 
     * @return {Integer}
     */
    this.childCount = function () {
        var Z = this;
        if (!Z.parentField() || !Z.keyField())
            return 0;

        var plevel = Z.levelValue();
        var context = Z.startSilenceMove();
        try {
            var result = 0;
            Z.next();
            while (!Z.isEof()) {
                if (Z.levelValue() <= plevel)
                    break;
                result++;
                Z.next()
            }
        } finally {
            Z.endSilenceMove(context)
        }
        return result
    },

    /**
     * Insert child record by parentId, and move cursor to the newly record.
     * 
     * @param {Object} parentId - key value of parent record
     */
    this.insertChild = function (parentId) {
        var Z = this;
        if (!Z._parentField || !Z.keyField() || !Z._levelField)
            throw new Error('parentField and keyField not set,use insertRec() instead!');

        if (!Z._dataList || Z._dataList.length == 0) {
            Z.innerInsert();
            return
        }

        var context = Z.startSilenceMove(true);
        try {
            Z.getRecord()._expanded_ = true;
            if (parentId) {
                if (!Z.findByKey(parentId))
                    return
            }
            else
                parentId = Z.keyValue();

            var level = Z.levelValue();
            var pfldname = Z.parentField(), parentParentId = Z.fieldValue(pfldname);
            while (true) {
                Z.next();
                if (Z.isEof())
                    break;
                if (parentParentId == Z.fieldValue(pfldname)) {
                    Z.prior();
                    break
                }
            }
        } finally {
            Z.endSilenceMove(context)
        }

        Z.innerInsert(function (newRec) {
            newRec[Z._parentField] = parentId;
            newRec[Z._levelField] = level + 1
        })
    }

    /**
     * Insert sibling record of current record, and move cursor to the newly record.
     */
    this.insertSibling = function () {
        var Z = this;
        if (!Z._parentField || !Z._keyField)
            throw new Error('parentField and keyField not set,use insertRec() instead!');

        if (!Z._dataList || Z._dataList.length == 0) {
            Z.innerInsert();
            return
        }

        var parentId = Z.fieldValue(Z.parentField()),
        currLevel = Z.levelValue();
        var context = Z.startSilenceMove(true);
        try {
            var found = false;
            Z.next();
            while (!Z.isEof()) {
                if (Z.levelValue() <= currLevel) {
                    Z.prior();
                    found = true;
                    break
                }
                Z.next()
            }
            if (!found)
                Z.last()
        } finally {
            Z.endSilenceMove(context)
        }

        Z.innerInsert(function (newRec) {
            newRec[Z._parentField] = parentId;
            newRec[Z._levelField] = currLevel
        })
    }

    /**
     * Insert record after current record, and move cursor to the newly record.
     */
    this.insertRec = function () {
        this.innerInsert();
    }

    /**
     * Add record after last record, and move cursor to the newly record.
     */
    this.appendRec = function () {
        var Z = this;
        Z._silence++;
        try {
            Z.last()
        } finally {
            Z._silence--
        }
        Z.insertRec()
    }

    /**
     * @Private
     */
    this.innerInsert = function (beforeInsertFn) {
        var Z = this;
        var mfld = Z._datasetField, mds = null;
        if (mfld) {
            mds = mfld.dataset;
            if (mds.recordCount() == 0)
                throw new Error(jslet.locale.Dataset.insertMasterFirst)
        }

        if (Z._dataList == null)
            Z._dataList = [];
        Z._isAborted = false;
        Z.checkStatusAndConfirm();
        if (Z._isAborted)
            return;

        Z._fireDatasetEvent(jslet.data.DatasetEvent.BEFOREINSERT);
        if (Z._isAborted)
            return;

        var preRecno = Z.recno(), k;
        if (this.recordCount() > 0)
            k = Z._dataList.indexOf(this.getRecord()) + 1;
        else
            k = Z._dataList.length;

        Z._modiObject = {};
        Z._dataList.splice(k, 0, Z._modiObject);

        if (Z._filteredRecnoArray) {
            for (var i = Z._filteredRecnoArray.length; i >= 0; i--) {
                Z._filteredRecnoArray[i] += 1;
                if (Z._filteredRecnoArray[i] == k) {
                    Z._filteredRecnoArray.splice(i, 0, k);
                    Z._recno = i;
                    break
                }
            }
        } else
            Z._recno = k;
        
        Z._status = jslet.data.DataSetStatus.INSERT;
        Z.calDefaultValue();
        if (beforeInsertFn)
            beforeInsertFn(Z._modiObject);

        if (mfld && mds) {
            mds.updateRec();
            var subFields = mfld.name();
            if(!mds.fieldValue(subFields))
            	mds.fieldValue(subFields, Z._dataList)
        }

        Z._isAborted = false;
        Z._fireDatasetEvent(jslet.data.DatasetEvent.AFTERINSERT);
        var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.INSERT, {
            preRecno: preRecno,
            recno: Z.recno(),
            updateAll: Z._recno < Z.recordCount() - 1
        });
        Z.refreshControl(evt)
    }

    /**
     * Insert all records of source dataset into current dataset;
     * Source dataset's structure must be same as current dataset 
     * 
     * @param {Integer}srcDataset - source dataset
     */
    this.insertDataset = function (srcDataset) {
        Z.filtered(false);
        var k;
        if (this.recordCount() > 0)
            k = Z._dataList.indexOf(this.getRecord()) + 1;
        else
            k = Z._dataList.length;

        var context = srcDataset.startSilenceMove(true), rec;
        try {
            srcDataset.first();
            while (!srcDataset.isEof()) {
                rec = srcDataset.getRecord();
                Z._dataList.splice(k++, 0, rec);
                srcDataset.next();
            }
        } finally {
            srcDataset.endSilenceMove(context);
        }
    }

    /**
     * Append all records of source dataset into current dataset;
     * Source dataset's structure must be same as current dataset 
     * 
     * @param {Integer}srcDataset - source dataset
     */
    this.appendDataset = function (srcDataset) {
        var Z = this;
        Z._silence++;
        try {
            Z.last()
        } finally {
            Z._silence--
        }
        Z.insertDataset(srcDataset)
    }

    /**
     * @rivate
     * Calculate default value.
     */
    this.calDefaultValue = function () {
        var Z = this;
        var fldObj, expr, value, fname;
        for (var i = 0, fldcnt = Z._normalFields.length; i < fldcnt; i++) {
        	fldObj = Z._normalFields[i];
            fname = fldObj.name();
            if (fldObj.getType() == jslet.data.DataType.DATASET) {
                var subds = fldObj.subDataset();
                Z.fieldValue(fname, null);
                continue
            }
            value = fldObj.defaultValue();
            if (!value) {
                expr = fldObj.defaultExpr();
                if (!expr)
                    continue;
                value = window.eval(expr);
                Z.fieldValue(fname, value)
            } else
                Z.fieldValue(fname, value)
        }
    }

    /**
     * Get record object by record number.
     * 
     * @param {Integer} recno Record Number.
     * @return {Object} Dataset record.
     */
    this.getRecord = function (recno) {
        var Z = this, k;
        if (Z.recordCount() == 0)
            return null;
        if (typeof (recno) == 'undefined')
            recno = Z._recno >= 0 ? Z._recno : 0;
        else
            if (recno < 0 || recno >= Z.recordCount())
                return null;

        if (Z._filteredRecnoArray)
            k = Z._filteredRecnoArray[recno];
        else
            k = recno;

        return Z._dataList[k]
    }

    /**
     * @private
     */
    this.getRelativeRecord = function (delta) {
        return this.getRecord(this._recno + delta)
    }

    /**
     * @private
     */
    this.isSameAsPrevious = function (fldName) {
        var preRec = this.getRelativeRecord(-1);
        if (!preRec)
            return false;
        var currRec = this.getRecord();
        return preRec[fldName] == currRec[fldName]
    }

    /**
     * Check the current record has child records or not
     * 
     * @return {Boolean}
     */
    this.hasChildren = function () {
        var Z = this;
        if (!Z._parentField || !Z._levelField)
            return false;
        var context = Z.startSilenceMove();
        var currLevel = Z.levelValue(), oldRecno = Z.recno();
        try {
            Z.next();
            if (!Z.isEof()) {
                var level = Z.levelValue();
                if (level > currLevel)
                    return true
            }
            return false
        } finally {
            Z.endSilenceMove(context);
        }
    }

    /**
     * Update record and send dataset to update status.
     * You can use cancel() or confirm() method to return browse status.
     */
    this.updateRec = function () {
        var Z = this;
        if (Z._status == jslet.data.DataSetStatus.UPDATE)
            return;

        if (Z._dataList == null || Z._dataList.length == 0)
            Z.insertRec();
        else {
            Z._isAborted = false;
            Z._fireDatasetEvent(jslet.data.DatasetEvent.BEFOREUPDATE);
            if (Z._isAborted)
                return;

            Z._modiObject = {};
            jQuery.extend(Z._modiObject, Z.getRecord());
            var mfld = Z._datasetField;
            if (mfld && mfld.dataset)
                mfld.dataset.updateRec();

            Z._status = jslet.data.DataSetStatus.UPDATE;
            Z._isAborted = false;
            Z._fireDatasetEvent(jslet.data.DatasetEvent.AFTERUPDATE)
        }
    }

    /**
     * Delete record
     */
    this.deleteRec = function () {
        var Z = this;
        var recCnt = Z.recordCount();
        if (recCnt == 0)
            return;
        if (Z._status == jslet.data.DataSetStatus.INSERT) {
            Z.cancel();
            return
        }

        Z._silence++;
        try {
            Z.checkStatusByCancel()
        } finally {
            Z._silence--
        }

        if (Z.hasChildren()) {
            jslet.showInfo(jslet.locale.Dataset.cannotDelParent);
            return
        }

        Z._isAborted = false;
        Z._fireDatasetEvent(jslet.data.DatasetEvent.BEFOREDELETE);
        if (Z._isAborted)
            return;
        if (Z._logChanged) {
            var rec = Z.getRecord(), isNew = false;
            for (var i = 0, cnt = Z._insertedDelta.length; i < cnt; i++) {
                if (Z._insertedDelta[i] == rec){
                    Z._insertedDelta.splice(i, 1);
                    isNew = true
                    break;
                }
            }
            if(!isNew){
                for (var i = 0, cnt = Z._updatedDelta.length; i < cnt; i++) {
                    if (Z._updatedDelta[i] == rec){
                        Z._updatedDelta.splice(i, 1);
                        break
                    }
                }
                Z._deletedDelta.push(rec)
            }
        }
        var prerecno = Z.recno(), isLast = prerecno == (recCnt - 1), k = Z._recno;
        if (Z._filteredRecnoArray) {
            k = Z._filteredRecnoArray[Z._recno];
            Z._filteredRecnoArray.splice(Z._recno, 1)
        }
        Z._dataList.splice(k, 1);
        var mfld = Z._datasetField;
        if (mfld && mfld.dataset)
            mfld.dataset.updateRec();

        Z._status = jslet.data.DataSetStatus.BROWSE;

        var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.DELETE, {
            recno: prerecno
        });
        Z.refreshControl(evt);

        if (isLast) {
            Z._silence++;
            try {
                Z.prior()
            } finally {
                Z._silence--
            }
        }
        if (Z.isBof() && Z.isEof())
            return;
        evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.SCROLL, {
            recno: Z._recno
        });
        Z.refreshControl(evt)
    }

    /**
     * @private
     */
    this.innerValidateData = function () {
        var Z = this;
        if (Z._status == jslet.data.DataSetStatus.BROWSE || Z.recordCount() == 0)
            return true;
        var fldObj, v, fldName, maxFld, fmax, vmax;

        for (var i = 0, cnt = Z._normalFields.length; i < cnt; i++) {
        	fldObj = Z._normalFields[i];
            if (!fldObj.enabled() || fldObj.readOnly() || !fldObj.visible())
                continue;
            if (fldObj.validate(this.fieldValue(fldObj.name())))
                return false
        } //end for
        return true
    }

    /**
     * Confirm insert or update
     */
    this.confirm = function () {
        var Z = this;
        if (Z._silence || Z._status == jslet.data.DataSetStatus.BROWSE)
            return;
        if (!Z.innerValidateData()) {
            jslet.showInfo(jslet.locale.Dataset.cannotConfirm);
            Z._isAborted = true;
            return
        }
        Z._isAborted = false;
        Z._fireDatasetEvent(jslet.data.DatasetEvent.BEFORECONFIRM);
        if (Z._isAborted)
            return;
        if (Z._status == jslet.data.DataSetStatus.INSERT) {
            if (Z._logChanged) {
                var rec = Z.getRecord();
                Z._insertedDelta.push(rec)
            }
        } else {
            if (Z._logChanged) {
                var rec = Z.getRecord();
                if (Z._insertedDelta.indexOf(rec) < 0 ) {
                    var k = Z._updatedDelta.indexOf(rec);
                    if (k < 0)
                        Z._updatedDelta.push(rec);
                    else
                        Z._updatedDelta[k] = rec
                }
            }
        }
        Z._modiObject = null;
        Z._status = jslet.data.DataSetStatus.BROWSE;

        Z._fireDatasetEvent(jslet.data.DatasetEvent.AFTERCONFIRM);

        var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.UPDATERECORD);
        Z.refreshControl(evt)
    }

    /**
     * Cancel insert or update
     */
    this.cancel = function () {
        var Z = this;
        if (Z._status == jslet.data.DataSetStatus.BROWSE)
            return;

        if (Z.recordCount() == 0)
            return;

        Z._isAborted = false;
        Z._fireDatasetEvent(jslet.data.DatasetEvent.BEFORECANCEL);
        if (Z._isAborted)
            return;

        if (Z._status == jslet.data.DataSetStatus.INSERT) {
            var no = Z.recno(), k = Z._recno;
            if (Z._filteredRecnoArray) {
                k = Z._filteredRecnoArray[Z._recno];
                Z._filteredRecnoArray.splice(Z._recno, 1)
            }
            Z._dataList.splice(k, 1);

            var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.DELETE, {
                recno: no
            });
            Z.refreshControl(evt);
            Z._status = jslet.data.DataSetStatus.BROWSE;
            Z.next();
            return
        } else {
            var k = Z._recno;
            if (Z._filteredRecnoArray)
                k = Z._filteredRecnoArray[Z._recno];
            Z._dataList[k] = Z._modiObject;
            Z._modiObject = null
        }

        Z._status = jslet.data.DataSetStatus.BROWSE;
        Z._isAborted = false;
        Z._fireDatasetEvent(jslet.data.DatasetEvent.AFTERCANCEL);

        var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.UPDATERECORD);
        Z.refreshControl(evt)
    }

    /**
     * Get inserted records, use this method to get inserted records that need apply to server.
     * 
     * @return {Array of Object} 
     */
    this.getInsertedRecord = function () {
        this.checkStatusAndConfirm();
        return this._insertedDelta
    }

    /**
     * Get updated records, use this method to get updated records that need apply to server.
     * 
     * @return {Array of Object}
     */
    this.getUpdatedRecord = function () {
        this.checkStatusAndConfirm();
        return this._updatedDelta
    }

    /**
     * Get deleted records, use this method to get deleted records that need apply to server.
     * 
     * @return {Array of Object}
     */
    this.getDeletedRecord = function () {
        return this._deletedDelta
    }

    /**
     * Set or get logChanges
     * if NOT need send changes to Server, can set logChanges to false  
     * 
     * @param {Boolean} logChanged
     */
    this.logChanges = function (logChanged) {
        if(logChanged === undefined)
        	return Z._logChanged;

        this._logChanged = logChanged
    }

    /**
     * Disable refreshing controls, you often use it in a batch operation;
     * After batch operating, use enableControls()
     */
    this.disableControls = function () {
        this._lockCount++;
        var fldObj, lkf, lkds;
        for (var i = 0, cnt = this._normalFields.length; i < cnt; i++) {
        	fldObj = this._normalFields[i];
            lkf = fldObj.lookupField();
            if (lkf != null) {
                lkds = lkf.lookupDataset();
                if (lkds != null)
                    lkds.disableControls()
            }
        }
    }

    /**
     * Enable refreshing controls.
     * 
     * @param {Boolean} refreshCtrl true - Refresh control immediately, false - Otherwise.
     */
    this.enableControls = function (needRefreshCtrl) {
        if (this._lockCount > 0)
            this._lockCount--;
        if (!needRefreshCtrl)
            this.refreshControl(jslet.data.UpdateEvent.updateAllEvent);

        var fldObj, lkf, lkds;
        for (var i = 0, cnt = this._normalFields.length; i < cnt; i++) {
        	fldObj = this._normalFields[i];
            lkf = fldObj.lookupField();
            if (lkf != null) {
                lkds = lkf.lookupDataset();
                if (lkds != null)
                    lkds.enableControls(needRefreshCtrl)
            }
        }
    }

    /**
     * @private
     */
    this._convertDate = function () {
        var Z = this;
        if (!Z._dataList || Z._dataList.length == 0)
            return;

        var dateFlds = new Array();
        for (var i = 0, cnt = Z._normalFields.length, fldObj; i < cnt; i++) {
        	fldObj = Z._normalFields[i];
            if (fldObj.getType() == jslet.data.DataType.DATE) {
                dateFlds.push(fldObj.name());
            }
        }
        if (dateFlds.length == 0)
            return;

        var rec, fname, value;
        for (var i = 0, recCnt = Z._dataList.length; i < recCnt; i++) {
            rec = Z._dataList[i];
            for (var j = 0, fcnt = dateFlds.length; j < fcnt; j++) {
                fname = dateFlds[j];
                value = rec[fname];
                if (value.toString() != '[object Date]') {
                    value = jslet.convertISODate(value);
                    if (value)
                        rec[fname] = value;
                    else
                        throw new Error(jslet.formatString(jslet.locale.Dataset.invalidDateFieldValue,[fldName]));

                } //end if
            } //end for j
        } //end for i
    }

    /**
     * Set or get raw data list
     * 
     * @param {Object[]} datalst - raw data list
     */
    this.dataList = function (datalst) {
        var Z = this;
        if(datalst === undefined)
        	return Z._dataList;
        
        Z._dataList = datalst;
        Z._convertDate();
        Z._insertedDelta.length = 0;
        Z._updatedDelta.length = 0;
        Z._deletedDelta.length = 0;
        Z._status = jslet.data.DataSetStatus.BROWSE;
        Z.filter(null);
        Z.indexFields(Z.indexFields());
        Z.first();
        Z.refreshControl(jslet.data.UpdateEvent.updateAllEvent);
        return this
    }

    /**
     * Set or get field value of current record
     * 
     * @param {String} fldName - field name
     * @param {Object} value - field value
     * @return {Object or this}
     */
    this.fieldValue = function (fldName, value) {
    	if(arguments.length == 1){
            if (this.recordCount() == 0)
                return null;

            var currRec = this.getRecord();
            if (!currRec)
                return null;
            return this.fieldValueByRec(currRec, fldName)    		
    	}
    	
        var Z = this;
        if (Z._status == jslet.data.DataSetStatus.BROWSE) {
            if (Z.recordCount() == 0)
                Z.insertRec();
            else
                Z.updateRec()
        }

        var currRec = Z.getRecord();
        currRec[fldName] = value;
        var fldObj = Z.getField(fldName);
        if (fldObj.getType() == jslet.data.DataType.DATASET) {//dataset field
            var subds = fldObj.subDataset();
            subds.dataList(value);
            return this
        }

        //calc other fields' range to use context rule
        if (!Z._silence && Z._contextRuleEnabled && value)
            Z.calcContextRule(fldName);
        var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.UPDATERECORD, {
            fieldName: fldName
        });
        Z.refreshControl(evt);
        Z.updateFormula();
        return this
    }
    
    /**
     * @rivate
     */
    this.removeInnerFormularFields = function (fldName) {
        if (this._innerFormularFields)
            this._innerFormularFields.remove(fldName)
    }

    /**
     * Get field value of specified record
     * 
     * @param {Object} dataRec - specified record
     * @param {String} fldName - field name
     * @return {Object} field value
     */
    this.fieldValueByRec = function (dataRec, fldName) {
        var Z = this;
        if (Z.recordCount() == 0)
            return null;

        if (!dataRec)
            dataRec = Z.getRecord();

        var k = fldName.indexOf('.'), subfldName, fldObj;
        if (k > 0) {
            subfldName = fldName.substr(0, k);
            fldObj = Z.getField(subfldName);
            if (!fldObj)
                throw new Error(jslet.formatString(jslet.locale.Dataset.fieldNotFound,[subfldName]));
            var lkf = fldObj.lookupField();
            if (!lkf)
                throw new Error(jslet.formatString(jslet.locale.Dataset.lookupFieldNotFound, [subfldName]));
            var value = dataRec[subfldName], lkds = lkf.lookupDataset();
            if (lkds.findByField(lkds.keyField(), value))
                return lkds.fieldValue(fldName.substr(k + 1));
            else
                throw new Error(jslet.formatString(jslet.locale.Dataset.valueNotFound,
							[lkds.name(),lkds.keyField(), value]))
        } else {
        	fldObj = Z.getField(fldName);
            if (!fldObj)
                throw new Error(jslet.formatString(jslet.locale.Dataset.fieldNotFound, [fldName]));
            var formula = fldObj.formula();
            if (!formula) {
                var value = dataRec[fldName];
                if (value != undefined)
                    return value;
                else
                    return null
            } else {
                if (Z._innerFormularFields == null)
                    Z._innerFormularFields = new jslet.SimpleMap();
                var evaluator = Z._innerFormularFields.get(fldName);
                if (evaluator == null) {
                    evaluator = new jslet.FormulaParser(this, formula);
                    Z._innerFormularFields.set(fldName, evaluator)
                }
                return evaluator.evalExpr(dataRec)
            }
        }
    }

    /**
     * Get field display text 
     * 
     * @param {String} fldName Field name
     * @param {Boolean} inEdit In edit mode or not, if in edit mode, return 'Input Text', else return 'Display Text'
     * @return {String} 
     */
    this.getFieldText = function (fldName, inEdit) {
        var Z = this;
        if (Z.recordCount() == 0)
            return '';
        var currRec = Z.getRecord(), k = fldName.indexOf('.'), fldName, fldObj, lkf, lkds, value;
        if (k > 0) {
            fldName = fldName.substr(0, k);
            fldObj = Z.getField(fldName);
            if (!fldObj)
                throw new Error(jslet.formatString(jslet.locale.Dataset.fieldNotFound, [fldName]));
            lkf = fldObj.lookupField();
            if (!lkf)
                throw new Error(jslet.formatString(jslet.locale.Dataset.lookupFieldNotFound, [fldName]));
            value = currRec[fldName];
            if (value == null || value == undefined)
                return '';
            lkds = lkf.lookupDataset();
            if (lkds.findByField(lkds.keyField(), value)) {
                fldName = fldName.substr(k + 1);
                if (fldName.indexOf('.') > 0)
                    return lkds.fieldValue(fldName);
                else
                    return lkds.getFieldText(fldName)
            } else
                throw new Error(jslet.formatString(jslet.locale.Dataset.valueNotFound,
						[lkds.name(), lkds.keyField(), value]))
        }

        fldObj = Z.getField(fldName);
        if (!fldObj)
            throw new Error(jslet.formatString(jslet.locale.Dataset.lookupFieldNotFound, [fldName]));
        if (fldObj.getType() == jslet.data.DataType.DATASET)
            return '[dataset]';

        value = Z.fieldValue(fldName);
        if (fldObj.clientTranslate()) {
            if (value == null || value == undefined) {
                if (!fldObj.required() && fldObj.nullText())
                    return fldObj.nullText();
                else
                    return ''
            }
            lkf = fldObj.lookupField();
            if (lkf != null) {
                lkds = lkf.lookupDataset();
                if (!inEdit)
                    return lkds._convertFieldValue(lkf.keyField(), value,
							lkf.displayFields(), ',');
                else
                    return lkds._convertFieldValue(lkf.keyField(), value, '['
									+ lkf.codeField() + ']', ',')
            }
        } else {
            if (!inEdit) {
                var dispFld = fldObj.displayValueField();
                if (dispFld)
                    return currRec[dispFld];
                else
                    throw new Error(jslet.formatString(jslet.locale.Dataset.invalidFieldTranslate, [fldName]))
            } else {
                var inputFld = fldObj.inputValueField();
                if (inputFld)
                    return currRec[inputFld];
                else
                    throw new Error(jslet.formatString(jslet.locale.Dataset.invalidFieldTranslate, [fldName]))
            }
        }
        if (value == null || value == undefined)
            return '';

        if (fldObj.getType() == jslet.data.DataType.NUMBER && fldObj.unitConverted())
            value = value / Z._unitConvertFactor;

        if (fldObj.onCustomFormatFieldText != null)
            return fldObj.onCustomFormatFieldText(fldName, value);

        if (fldObj.getType() == jslet.data.DataType.NUMBER && !inEdit) {
            var rtnText = jslet.formatNumber(value, fldObj.displayFormat());
            if (fldObj.unitConverted() && Z._unitName)
                rtnText += Z._unitName;
            return rtnText
        }
        if (fldObj.getType() == jslet.data.DataType.DATE) {
            if (!value.format)
                throw new Error(jslet.formatString(jslet.locale.Dataset.invalid-datefield-value, [fldName]));

            if (!inEdit) {
                var fmt = fldObj.displayFormat();
                if (!fmt)
                    fmt = 'yyyy-MM-dd';

                return value.format(fmt)
            } else
                return value.format('yyyyMMdd')
        }
        return value
    }

    /**
     * @private
     */
    this.updateFormula = function () {
        var cnt = this._normalFields.length, fldObj;
        for (var i = 0; i < cnt; i++) {
        	fldObj = this._normalFields[i];
            if (fldObj.formula()) {//update all formular field
                var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.UPDATERECORD,
						{
						    fieldName: fldObj.name()
						});
                this.refreshControl(evt)
            }
        }
    }

    /**
     * @private
     */
    this._innerSetText = function (fldObj, value) {
        //check invalid and inform to UI
        var invalidMsg = fldObj.validate(value);
        var fldName = fldObj.name();
        if(invalidMsg){
        	this._errorFields.push(fldName);        
        }else{
        	var k = this._errorFields.indexOf(fldName);
        	if(k >= 0)
        		this._errorFields.splice(k);
        }
        this._informInvalid(fldName, invalidMsg);
        this.fieldValue(fldName, value)
    },

    /**
     * Set field value by display value
     * 
     * @param {String} fldName - field name
     * @param {String} inputText - String value inputed by user
     * @param {Object} keyValue - key value
     * @param {String} displayValue - display value
     */
    this.setFieldText = function (fldName, inputText, keyValue, displayValue) {
    	var Z = this;
        var fldObj = Z.getField(fldName);
        if (fldObj == null)
            throw new Error(jslet.formatString(jslet.locale.Dataset.fieldNotFound, [fldName]));
        var fType = fldObj.getType();
        if (fType == jslet.data.DataType.DATASET)
            throw new Error(jslet.formatString(jslet.locale.Dataset.datasetFieldNotBeSetValue, [fldName]));

        if (inputText == '' || inputText == null || inputText == undefined) {
            Z._innerSetText(fldObj, null);
            return
        }
        var invalidMsg = fldObj.checkFormat(inputText);
        this._informInvalid(fldName, invalidMsg);
        if (invalidMsg)
            return;

        var oldText = this.getFieldText(fldName, true);
        if (oldText == inputText && this._errorFields.indexOf(fldName) < 0)
            return;

        var value = inputText, lkFld = fldObj.lookupField();
        if (lkFld && fldObj.clientTranslate()) {
            value = lkFld.lookupDataset()._convertFieldValue(
					lkFld.codeField(), inputText, lkFld.keyField())
        } else if (!fldObj.clientTranslate()) {
            var dispFld = fldObj.displayValueField(), inputFld = fldObj.inputValueField();
            if (dispFld && inputFld) {
                var currRec = Z.getRecord();
                if (keyValue && displayValue) {
                    Z.fieldValue(fldName, value);
                    currRec[dispFld] = displayValue
                } else {
                    if (!Z._translateListener)
                        throw new Error(jslet.locale.Dataset.translateListenerRequired);
                    var result = Z._translateListener(this, fldName, inputText);
                    if (result && result.keyValue && result.displayValue) {
                        Z.fieldValue(fldName, result.keyValue);
                        currRec[dispFld] = result.displayValue;
                        var inputV = result.inputValue;
                        if (!inputV)
                            inputV = result.keyValue;
                        currRec[inputFld] = inputV
                    }
                }
            } else
                throw new Error(jslet.formatString(jslet.locale.Dataset.invalidFieldTranslate, [fldName]))
        } else if (fType == jslet.data.DataType.DATE)// Date convert
            value = jslet.convertToDate(inputText);
        else if (fType == jslet.data.DataType.NUMBER) { // Number convert
            if (fldObj.scale() == 0)
                value = parseInt(inputText);
            else
                value = parseFloat(inputText)
        }
        if(fType == jslet.data.DataType.STRING && fldObj.xss())
        	value = jslet.htmlEncode(value);
        Z._innerSetText(fldObj, value);
    }

    /**
     * Get key value of current record
     * 
     * @return {Object} Key value
     */
    this.keyValue = function () {
        if (!this._keyField || this.recordCount() == 0)
            return null;
        return this.fieldValue(this._keyField)
    }

    /**
     * Get parent record key value of current record
     * 
     * @return {Object} Parent record key value.
     */
    this.parentValue = function () {
        if (!this._parentField || this.recordCount() == 0)
            return null;
        return this.fieldValue(this._parentField)
    }

    /**
     * Get level value of current record
     * if dataset is not a tree mode, return null
     * 
     * @return {Integer}
     */
    this.levelValue = function () {
        if (!this._keyField || this.recordCount() == 0)
            return 0;
        var level = this.fieldValue(this._levelField);
        return level || 0
    }

    /**
     * Find record with specified condition
     * if found, then move cursor to that record
     * <pre><code>
     *   dsFoo.find('[name] like "Bob%"');
     *   dsFoo.find('[age] > 20');
     * </code></pre>
     * @param {String} condition condition expression.
     * @return {Boolean} 
     */
    this.find = function (condition) {
        var Z = this;
        if (Z.recordCount() == 0)
            return false;

        if (condition == null) {
            Z._findCondition = null;
            Z._innerFindCondition = null;
            return false
        }

        if (condition != Z._findCondition)
            Z._innerFindCondition = new jslet.FormulaParser(this, condition);

        if (Z._innerFindCondition.evalExpr())
            return true;
        Z._silence++;
        var foundRecno = -1, oldRecno = Z._recno;
        try {
            Z.first();
            while (!Z._eof) {
                if (Z._innerFindCondition.evalExpr()) {
                    foundRecno = Z._recno;
                    break
                }
                Z.next()
            }
        } finally {
            Z._silence--;
            Z._recno = oldRecno
        }
        if (foundRecno >= 0) {// can fire scroll event
            Z._gotoRecno(foundRecno);
            return true
        }
        return false
    }

    /**
     * Find record with specified field name and value
     * 
     * @param {String} fldName - field name
     * @param {Object} findingValue - finding value
     * @return {Boolean} 
     */
    this.findByField = function (fldName, findingValue) {
        var Z = this;
        if (Z.recordCount() == 0)
            return false;

        var value = Z.fieldValue(fldName);
        if (value == findingValue)
            return true;

        var foundRecno = -1, oldRecno = Z.recno();
        try {
            var cnt = Z.recordCount();
            for (var i = 0; i < cnt; i++) {
                Z.innerSetRecno(i);
                value = Z.fieldValue(fldName);
                if (value == findingValue) {
                    foundRecno = Z._recno;
                    break
                }
            }
        } finally {
            Z.innerSetRecno(oldRecno)
        }
        if (foundRecno >= 0) {// can fire scroll event
            Z._gotoRecno(foundRecno);
            return true
        }
        return false
    }

    /**
     * Find record with key value.
     * 
     * @param {Object} keyValue Key value.
     * @return {Boolean}
     */
    this.findByKey = function (keyValue) {
        var keyField = this.keyField();
        if (!keyField)
            return false;

        this.findByField(keyField, keyValue)
    }

    /**
     * Find record and return specified field value
     * 
     * @param {String} fldName - field name
     * @param {Object} findingValue - finding field value
     * @param {String} returnFieldName - return value field name
     * @return {Object} 
     */
    this.lookup = function (fldName, findingValue, returnFieldName) {
        if (this.findByField(fldName, findingValue))
            return this.fieldValue(returnFieldName);
        else
            return null
    }

    /**
     * Clone dataset by condition or onFilter flag
     * 
     * @param {String} condition - specified condition that cloned
     * @param {Boolean} onFilter - if true, clone data on dataset {@link}filter
     * @return {Object[]} Array of records. 
     */
    this.cloneDataset = function (condition, onFilter) {
        var Z = this;
        if (Z.recordCount() == 0)
            return null;

        var result = [];

        if ((!condition)
				&& (!onFilter || !Z._filtered))
            return Z._dataList.slice(0);

        var foundRecno = -1, oldRecno = Z._recno, oldFiltered = Z._filtered;
        if (!onFilter)
            Z._filtered = false;

        Z._silence++;
        try {
            Z.first();
            while (!Z._eof) {
                if (Z._innerFindCondition.evalExpr())
                    result.push(Z.getRecord());
                Z.next()
            }
        } finally {
            Z._silence--;
            Z._recno = oldRecno;
            if (!onFilter)
                Z._filtered = oldFiltered
        }
        return result
    }

    /**
     * Set or get 'key' field name
     * 
     * @param {String} keyFldName Key field name.
     * @return {String or this}
     */
    this.keyField = function (keyFldName) {
    	if(keyFldName === undefined)
    		return this._keyField;
    	
        this._keyField = keyFldName;
        return this
    }

    /**
     * Set or get 'code' field name
     * 
     * @param {String} codeFldName Code field name.
     * @return {String or this}
     */
    this.codeField = function (codeFldName) {
    	if(codeFldName === undefined)
    		return this._codeField;
    	
        this._codeField = codeFldName;
        return this
    }
    
    /**
     * Set or get 'name' field name
     * 
     * @param {String} nameFldName Name field name
     * @return {String or this}
     */
    this.nameField = function (nameFldName) {
    	if(nameFldName === undefined)
    		return this._nameField;
    	
        this._nameField = nameFldName;
        return this
    }
    
    /**
     * Set or get 'parent' field name
     * 
     * @param {String} parentFldName Parent field name.
     * @return {String or this}
     */
    this.parentField = function (parentFldName) {
    	if(parentFldName === undefined)
    		return this._parentField;
    	
        this._parentField = parentFldName;
        return this
    }
    
    /**
     * Set or get 'level' field name, this property is used in tree-style dataset
     * 
     * @param {String} levelFldName Level field name.
     * @return {String or this}
     */
    this.levelField = function (levelFldName) {
    	if(levelFldName === undefined)
    		return this._levelField;
        this._levelField = levelFldName;
        return this
    }
    
    /**
     * @private
     */
    this._convertFieldValue = function (srcField, srcValues, destFields,
			multiValueSeparator) {
        var Z = this;

        if (arguments.length <= 3)
            multiValueSeparator = ',';

        if (destFields == null)
            throw new Error('NOT set destFields in method: ConvertFieldValue');
        var flag = destFields.indexOf('[') > -1;
        if (flag) {
            if (destFields != Z._convertDestFields) {
                Z._innerConvertDestFields = new jslet.FormulaParser(this,
						destFields);
                Z._convertDestFields = destFields
            }
        }
        if (typeof (srcValues) != 'string')
            srcValues += '';
        var values = srcValues.split(multiValueSeparator), valueCnt = values.length - 1;
        if (valueCnt == 0) {
            if (!Z.findByField(srcField, values[0]))
                throw new Error(jslet.formatString(jslet.locale.Dataset.valueNotFound,[Z._dsname, srcField, values[0]]));
            if (flag)
                return Z._innerConvertDestFields.evalExpr();
            else
                return Z.fieldValue(destFields)
        }

        var fldcnt, destValue = '';
        for (var i = 0; i <= valueCnt; i++) {
            if (!Z.findByField(srcField, values[i]))
                throw new Error(jslet.formatString(jslet.locale.Dataset.valueNotFound,[Z._dsname, srcField, values[i]]));
            if (flag)
                destValue += Z._innerConvertDestFields.evalExpr();
            else
                destValue += Z.fieldValue(destFields);
            if (i != valueCnt)
                destValue += multiValueSeparator
        }
        return destValue
    }

    /**
     * Set or get context rule
     * 
     * @param {jslet.data.ContextRule} contextRule Context rule;
     * @return {jslet.data.ContextRule or this}
     */
    this.contextRule = function (contextRule) {
    	if(contextRule === undefined)
    		return this._contextRule;
    	
        this._contextRule = contextRule;
        return this
    }
    
    /**
     * Disable context rule
     */
    this.disableContextRule = function () {
        this._contextRuleEnabled = false;
        this.restoreContextRule()
    }

    /**
     * Enable context rule, any context rule will be calculated.
     */
    this.enableContextRule = function () {
        this._contextRuleEnabled = true;
        if (this._contextRule)
            this._contextRule.clearConditionFieldValues();
        this.calcContextRule()
    }

    /**
     * Check context rule enable or not.
     * 
     * @return {Boolean}
     */
    this.isContextRuleEnabled = function () {
        return this._contextRuleEnabled
    }

    this.restoreContextRule = function () {
        if (this._contextRule)
            this._contextRule.restoreContextRule()
    }

    /**
     * @private
     */
    this.calcContextRule = function (changedField) {
        if (this._contextRule)
            this._contextRule.calcContextRule(changedField)
    }

    /**
     * Select records or not.
     * 
     * @param {Boolean}selected  true - select records, false otherwise.
     * @param {Function)onSelectAll Select event handler.
     *   Pattern: function(dataset, Selected}{}
     *     //dataset: jslet.data.Dataset
     *     //checked: Boolean
     *     //return: true - allow user to select, false - otherwise.

     * @param {Boolean}noRefresh Refresh controls or not.
     */
    this.selectAll = function (selected, onSelectAll, noRefresh) {
        var Z = this;
        if (Z.recordCount() == 0)
            return;

        try {
            var oldRecno = Z.recno();
            for (var i = 0, cnt = Z.recordCount(); i < cnt; i++) {
                Z.innerSetRecno(i);

                if (onSelectAll) {
                    var flag = onSelectAll(this, selected);
                    if (flag != undefined && !flag)
                        continue
                }
                Z.getRecord()._selected = selected
            }
        } finally {
            Z.innerSetRecno(oldRecno)
        }
        if (!noRefresh) {
            var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.SELECTALLCHANGE, {
                selected: selected
            });
            Z.refreshControl(evt)
        }
    }

    /**
     * Select by key value
     * 
     * @param {Boolean} selected true - select records, false otherwise.
     * @param {Object) keyValue Key value.
     * @param {Boolean} noRefresh Refresh controls or not.
     */
    this.selectByKeyValue = function (selected, keyValue, noRefresh) {
        var Z = this;
        try {
            var oldRecno = Z.recno(), cnt = Z.recordCount(), v, changedRecNum;
            for (var i = 0; i < cnt; i++) {
                Z.innerSetRecno(i);
                v = Z.fieldValue(Z._keyField);
                if (v == keyValue) {
                    Z.getRecord()._selected = selected;
                    changedRecNum = i;
                    break;
                }
            } //end for
        } finally {
            Z.innerSetRecno(oldRecno)
        }
        if (!noRefresh) {
            var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.SELECTCHANGE, {
                selected: selected,
                recno: changedRecNum
            });
            Z.refreshControl(evt)
        }
    }

    /**
     * Select current record or not.
     * If 'selectBy' is not empty, select all records which value of 'selectBy' field is same as the current record.
     * <pre><code>
     * dsEmployee.select(true, 'gender');
     * //if the 'gender' of current value is female, all female employees will be selected.  
     * </code></pre>
     * 
     * @param {Boolean}selected - true: select records, false:unselect records
     * @param {String)selectBy - field names, multiple fields concatenated with ',' 
     */
    this.select = function (selected, selectBy) {
        var Z = this;
        if (Z.recordCount() == 0)
            return;

        var changedRecNum = [];
        if (!selectBy) {
            var rec = Z.getRecord();
            rec._selected = selected;
            changedRecNum.push(Z.recno())
        } else {
            var arrFlds = selectBy.split(','), arrValues = [], fldCnt = arrFlds.length;
            for (var i = 0; i < fldCnt; i++)
                arrValues[i] = Z.fieldValue(arrFlds[i]);
            var v, preRecno = Z.recno(), flag;
            try {
                for (var k = 0, recCnt = Z.recordCount(); k < recCnt; k++) {
                    Z.innerSetRecno(k);
                    flag = 1;
                    for (var i = 0; i < fldCnt; i++) {
                        v = Z.fieldValue(arrFlds[i]);
                        if (v != arrValues[i]) {
                            flag = 0;
                            break
                        }
                    }
                    if (flag) {
                        Z.getRecord()._selected = selected;
                        changedRecNum.push(Z.recno())
                    }
                }
            } finally {
                Z.innerSetRecno(preRecno)
            }
        }

        var evt = new jslet.data.UpdateEvent(jslet.data.UpdateEvent.SELECTCHANGE, {
            selected: selected,
            recno: changedRecNum
        });
        Z.refreshControl(evt)
    }

    /**
     * Check selected status of current record
     * 
     * @return {Boolean} true for selected, false otherwise.
     */
    this.isSelected = function () {
        if (this.recordCount() == 0)
            return false;

        var rec = this.getRecord();
        if (rec._selected == undefined || rec._selected == null)
            return false;
        else
            return rec._selected
    }

    /**
     * Get selected records
     * 
     * @return {Object[]} Array of records
     */
    this.getSelectedRecords = function () {
        if (this._dataList == null || this._dataList.length == 0)
            return null;

        var rec, result = new Array();
        for (var i = 0, cnt = this._dataList.length; i < cnt; i++) {
            rec = this._dataList[i];
            if (rec._selected)
                result.push(rec);
        }
        return result
    }

    /**
     * Get key values of selected records 
     * 
     * @return {Object[]} Array of selected record key values
     */
    this.getSelectedKeyValues = function () {
        var oldRecno = this.recno(), result = [];
        try {
            for (var i = 0, cnt = this.recordCount(); i < cnt; i++) {
                this.innerSetRecno(i);
                if (this.isSelected())
                    result.push(this.fieldValue(this._keyField))
            }
        } finally {
            this.innerSetRecno(oldRecno)
        }
        if (result.length > 0)
            return result;
        else
            return null
    }

    /**
     * Set or get data provider
     * 
     * @param {jslet.data.Provider} provider - data provider
     * @return {jslet.data.Provider or this}
     */
    this.dataProvider = function (provider) {
    	if(provider === undefined)
    		return this._dataProvider;
        this._dataProvider = provider;
        return this
    }
    
    /**
     * @private
     */
    this._checkDataProvider = function () {
        if (!this._dataProvider) {
            alert('DataProvider is NOT set,can\'t connect to server!');
            return false
        }
        return true
    }

    /**
     * Send request to server for data. Example:
     * <pre><code>
     * var condition = {name:'Bob', age:25};
     * dsEmployee.applyQuery('../getemployee.do', condition);
     * </code></pre>
     * @param {String} url url
     * @param {Object} condition Condition.
     */
    this.applyQuery = function (url, condition) {
		this._queryUrl = url;
        this._condition = condition;
        this.applyRefresh()
    }

    /**
     * Send request to refresh with current condition.
     */
    this.applyRefresh = function () {
        var Z = this;
        if (!Z._checkDataProvider() || !Z._queryUrl)
            return;

        var result = Z._dataProvider.applyQuery(Z._queryUrl, Z._condition, Z._pageNum,
				Z._pageSize);
        if (!result){
        	Z.dataList(null);
        	return;
        }

        if (result.result == undefined)
            Z.dataList(result);
        else {
            var keys = Object.keys(result), dsName, ds;
            for (var i = 0, cnt = keys.length; i < cnt; i++) {
                dsName = keys[i];
                if (dsName == 'result')
                    continue;
                ds = jslet.data.dataModule.get(dsName);
                if (ds)
                    ds.dataList(result[dsName])
            }
            Z.dataList(result.result);
            if (result.pageNum)
                Z._pageNum = result.pageNum;
            if (result.pageCount)
                Z._pageCount = result.pageCount;

            Z.refreshControl(new jslet.data.UpdateEvent(
					jslet.data.UpdateEvent.PAGECHANGE, null))
        }
    }

    /**
     * Send inserted data to server. 
     * If save successfully, return the inserted data and refresh client data automatically.
     * 
     * Cause key value is probably generated at server side(like sequence), we need an extra field that store an unique value to update the key value,
     * this extra field is named 'bookMarkField'(the second argument). If you don't provide it, '_b_k_' will be used. 
     * At server side, you need not to process this extra field, just return it. Example:
     * <pre><code>
     * dsFoo.insertRec();
     * dsFoo.fieldValue('name','Bob');
     * dsFoo.fieldValue('code','A01');
     * dsFoo.confirm();
     * 
     * //Field value of 'code' must be unique
     * dsFoo.apply('../foo_insert.do', 'code');  
     * 
     * //Use '_b_k_' field to refresh dataset after save.
     * dsFoo.apply('../foo_insert.do');
     * </code></pre>
     * 
     * @param {String} url Url
     * @param {String} bookMarkField An extra field used to update key value. 
     */
    this.applyInsert = function (url, bookMarkField) {
        var Z = this;
        if (!Z._checkDataProvider())
            return;
        var arrRecs = Z.getInsertedRecord();
        if (!arrRecs || arrRecs.length == 0)
            return;
        var newRec, bkField = bookMarkField;
        if (!bookMarkField) {
            bkField = '_b_k_';
            for (var i = 0, newCnt = arrRecs.length; i < newCnt; i++) {
                newRec = arrRecs[i];
                arrRecs[bkField] = 'i_' + i
            }
        }
        var result = Z._dataProvider.applyInsert(url, arrRecs);
        if (!result)
            return;
        var newCnt = result.length;
        if (newCnt == 0)
            return;
        var recCnt = Z._dataList.length, rec;
        for (var i = 0; i < newCnt; i++) {
            newRec = result[i];

            for (var j = 0; j < recCnt; j++) {
                rec = Z._dataList[j];
                if (newRec[bkField] == rec[bkField]) {
                    Z._dataList[j] = newRec;
                    break
                }
            } //end for

            delete newRec[bkField]
        }
        Z.refreshControl(jslet.data.UpdateEvent.updateAllEvent)
    }

    /**
     * Send updated data to server. Server side should send back the updated data to client. Example:
     * <pre><code>
     * dsFoo.fieldValue('name', 'Tom');
     * dsFoo.comfirm();
     * 
     * dsFoo.applyUpdate('../foo_update.do');
     * 
     * </code></pre>
     * @param {String} url Url
     */
    this.applyUpdate = function (url) {
        var Z = this;
        if (!Z._checkDataProvider())
            return;
        var arrRecs = Z.getUpdatedRecord();
        if (!arrRecs || arrRecs.length == 0)
            return;
        var result = Z._dataProvider.applyUpdate(url, arrRecs);
        if (!result)
            return;
        var newCnt = result.length;
        if (newCnt == 0)
            return;
        var recCnt = Z._dataList.length, 
        	rec, 
        	k, 
        	bkField = Z._keyField, 
        	keyValue, 
        	oldRecno = Z.recno(), 
        	oldFiltered = Z.filtered();
        Z._silence++;
        try {
            Z.filtered(false);
            for (var i = 0; i < newCnt; i++) {
                newRec = result[i];
                keyValue = newRec[bkField];
                if (Z.findByField(bkField, keyValue)) {
                    k = Z._dataList.indexOf(Z.getRecord());
                    if (k >= 0)
                        Z._dataList[k] = newRec
                }
            } //end for
        } finally {
            Z._silence--;
            if (oldFiltered)
                Z.filtered(true);
            Z.innerSetRecno(oldRecno)
        }
        Z.refreshControl(jslet.data.UpdateEvent.updateAllEvent)
    }

    /**
     * Send deleted data to server.
     * <pre><code>
     * dsFoo.find('[name] = "Tom"');
     * dsFoo.deleteRec();
     * 
     * dsFoo.applyDelete('../foo_delete.do');
     * 
     * </code></pre>
     * @param {String} url Url
     */
    this.applyDelete = function (url) {
        var Z = this;
        if (!Z._checkDataProvider())
            return;
        var arrRecs = Z.getDeletedRecord();
        if (!arrRecs || arrRecs.length == 0)
            return;
        var result = Z._dataProvider.applyDelete(url, arrRecs);
        if (!result)
            return;
        var newCnt = result.length;
        if (newCnt == 0)
            return;
        var recCnt = Z._dataList.length, 
        	rec, 
        	k, 
        	bkField = Z._keyField, 
        	keyValue, 
        	oldRecno = Z.recno(), 
        	oldFiltered = Z.filtered();
        Z._silence++;
        var oldfLogChanged = Z._logChanged;
        try {
            Z._logChanged = false;
            Z.filtered(false);
            for (var i = 0; i < newCnt; i++) {
                newRec = result[i];
                keyValue = newRec[bkField];
                if (Z.findByField(bkField, keyValue))
                    Z.deleteRec()
            } //end for
        } finally {
            Z._silence--;
            if (oldFiltered)
                Z.filtered(true);
            Z._logChanged = oldfLogChanged;
            var k = Math.min(oldRecno, Z.recordCount() - 1);
            if (k >= 0)
                Z.innerSetRecno(k)
        }
        Z.refreshControl(jslet.data.UpdateEvent.updateAllEvent)
    }

    /**
     * Send selected data to server whether or not the records have been changed. 
     * Under some special scenarios, we need send user selected record to server to process. 
     * Sever side need not send back the processed records. Example:
     * 
     * <pre><code>
     * //Audit the selected records, if successful, delete the selected records.
     * dsFoo.applySelected('../foo_audit.do', true);
     * 
     * </code></pre>
     * @param {String} url Url
     * @param {Boolean} deleteOnSuccess If processing successfully at server side, delete the selected record or not.
     */
    this.applySelected = function (url, deleteOnSuccess) {
        var Z = this;
        if (!Z._checkDataProvider())
            return;
        var arrRecs = Z.getSelectedRecords();
        if (!arrRecs || arrRecs.length == 0)
            return;
        var result = Z._dataProvider.applySelected(url, arrRecs);
        if (!result)
            return;
        var newCnt = result.length;
        if (newCnt == 0)
            return;
        var recCnt = Z._dataList.length, 
        	rec, 
        	k, 
        	bkField = fkeyField, 
        	keyValue, 
        	oldRecno = Z.recno(), 
        	oldFiltered = Z.filtered();
        Z._silence++;
        var oldfLogChanged = Z._logChanged;
        try {
            Z._logChanged = false;
            Z.filtered(false);
            for (var i = 0; i < newCnt; i++) {
                newRec = result[i];
                keyValue = newRec[bkField];
                if (Z.findByField(bkField, keyValue)) {
                    if (deleteOnSuccess)
                        Z.deleteRec();
                    else {
                        k = Z._dataList.indexOf(Z.getRecord());
                        if (k >= 0)
                            Z._dataList[k] = newRec
                    }
                } //end if
            } //end for
        } finally {
            Z._silence--;
            if (oldFiltered)
                Z.filtered(true);
            Z._logChanged = oldfLogChanged;
            var k = Math.min(oldRecno, Z.recordCount() - 1);
            if (k >= 0)
                Z.innerSetRecno(k)
        }
        Z.refreshControl(jslet.data.UpdateEvent.updateAllEvent)
    }

    /**
     * @private
     */
    this._informInvalid = function (fieldName, invalidMsg) {
        for (var i = 0, cnt = this._linkedControls.length, ctrl; i < cnt; i++) {
            ctrl = this._linkedControls[i];
            if (!ctrl.field || ctrl.field != fieldName)
                continue;
            if (ctrl.renderInvalid)
                ctrl.renderInvalid(invalidMsg)
        }
    }

    /**
     * @private
     */
    this._refreshInnerControl = function (updateEvt) {
    	if(jslet.data.UpdateEvent.updateAllEvent == updateEvt || updateEvt.eventType == jslet.data.UpdateEvent.METACHANGE){
            for (var i = 0, cnt = this._linkedLabels.length, ctrl; i < cnt; i++) {
                ctrl = this._linkedLabels[i];
                if (ctrl.refreshControl)
                    ctrl.refreshControl(updateEvt)
            }
    	}

        for (var i = 0, cnt = this._linkedControls.length, ctrl; i < cnt; i++) {
            ctrl = this._linkedControls[i];
            if (ctrl.refreshControl)
                ctrl.refreshControl(updateEvt)
        }
    }

    /**
     * Focus on the edit control that link specified field name.
     * 
     * @param {String} fldName Field name
     */
    this.focusEditControl = function (fldName) {
        var ctrl, el;
        for (var i = this._linkedControls.length - 1; i >= 0; i--) {
            ctrl = this._linkedControls[i];
            if (ctrl.field && ctrl.field == fldName) {
            	el = ctrl.el;
                if (el.focus) {
                    try {
                        el.focus()
                    } catch (e) {
                        //hide exeception
                    }
                }
            } //end if
        } //end for
    }

    /**
     * @private 
     */
    this.refreshControl = function (updateEvt) {
        if (this._lockCount)
            return;

        if (!updateEvt)
            updateEvt = jslet.data.UpdateEvent.updateAllEvent;
        if (updateEvt.eventType == jslet.data.UpdateEvent.UPDATEALL) {
            var flag = this.isContextRuleEnabled();
            if (flag)
                this.disableContextRule();
            try {
                this._refreshInnerControl(updateEvt)
            } finally {
                if (flag)
                    this.enableContextRule()
            }
        } else
            this._refreshInnerControl(updateEvt)
    }

    /**
     * @private 
     */
    this.renderOptions = function (fldName) {
        var refreshField = (fldName != undefined), ctrl;
        for (var i = 0, cnt = this._linkedControls.length; i < cnt; i++) {
            ctrl = this._linkedControls[i];
            if (ctrl.renderOptions == undefined
					|| (refreshField && ctrl.field != fldName))
                continue;
            ctrl.renderOptions();
            if (this._lockCount)
                continue;
            ctrl.refreshControl(jslet.data.UpdateEvent.updateAllEvent)
        } //end for
    }

    /**
     * @private 
     */
    this.addLinkedControl = function (linkedControl) {
    	if(linkedControl.isLabel)
    		this._linkedLabels.push(linkedControl);
    	else
    		this._linkedControls.push(linkedControl)
    }

    /**
     * @private 
     */
    this.removeLinkedControl = function (linkedControl) {
    	var arrCtrls = linkedControl.isLabel ? this._linkedLabels : this._linkedControls;
    	
        var k = arrCtrls.indexOf(linkedControl);
        if (k >= 0)
        	arrCtrls.splice(k, 1)
    }

    /**
     * Export data using CSV format
     * 
     * @param {String}includeFields - exported fields, can be null  
     * @param {Boolean}dispValue - true: export display value of field, false: export actual value of field 
     * @param {Boolean}onlySelected - export selected records or not.
     * @return {String} Csv Text. 
     */
    this.exportCsv = function(includeField, dispValue, onlySelected){
    	var Z= this, fldSeperator = ',', surround='"';
    	var context = Z.startSilenceMove();
    	try{
    		Z.first();
    		var result = [], arrRec, fldCnt = Z._normalFields.length, fldObj, fldName, value;
    		if(includeField){
				arrRec = [];
				for(var i = 0; i < fldCnt; i++){
					fldObj = Z._normalFields[i];
					fldName = fldObj.name();
					fldName = surround + fldName + surround;
					arrRec.push(fldName);
				}
				result.push(arrRec.join(fldSeperator));
    		}
    		while(!Z.isEof()){
    			if(onlySelected && !Z.isSelected()){
    				Z.next();
    				continue;
    			}
    			arrRec = [];
    			for(var i = 0; i < fldCnt; i++){
    				fldObj = Z._normalFields[i];
    				fldName = fldObj.name();
    				if(dispValue)
    					value = Z.getFieldText(fldName);
    				else
    					value = Z.fieldValue(fldName);
    				if(!value)
    					value = '';
    				else
    					value += '';
    				value = value.replace(/"/,'');
    				value = surround + value + surround;
    				arrRec.push(value);
    			}
    			result.push(arrRec.join(fldSeperator));
    			Z.next();
    		}
    		return result.join('\n')
    	}finally{
    		Z.endSilenceMove(context)
    	}
    }
    
    this.destroy = function () {
        var Z = this;
        Z._masterDataset = null;
        Z._detailDatasets.length = 0;
        Z._fields.length = 0;
        Z._linkedControls.length = 0;
        Z._innerFilter = null;
        Z._innerFindCondition = null;
        Z._innerIndexFields = null
    }
    
}               
// end Dataset

/**
 * Create Enum Dataset. Example:
 * <pre><code>
 * var dsGender = jslet.data.createEnumDataset('gender', 'F-Female; M-Male');
 * dsGender.fieldValue('code');//return 'F'
 * dsGender.fieldValue('name');//return 'Female'
 * dsGender.next();
 * dsGender.fieldValue('code');//return 'M'
 * dsGender.fieldValue('name');//return 'Male'
 * </code></pre>
 * 
 * @param {String} dataset name
 * @param {String} enumstr string to be created dataset<code>-<name>;<code>-<name>
 * @return {jslet.data.Dataset}
 */
jslet.data.createEnumDataset = function(dsName, enumstr) {
	var ds = new jslet.data.Dataset(dsName);
	ds.addField(jslet.data.createStringField('code', 10));
	ds.addField(jslet.data.createStringField('name', 20));

	ds.keyField('code');
	ds.codeField('code');
	ds.nameField('name');

	var recs = enumstr.split(';'),arr = new Array(),recstr;
	for (var i = 0, cnt = recs.length; i < cnt; i++) {
		recstr = recs[i];
		rec = recstr.split('-');

		arr[arr.length] = {
			'code' : rec[0],
			'name' : rec[1]
		}
	}
	ds.dataList(arr);
	return ds
}

/**
 * Create dataset by field config. Example:
 * <pre><code>
 *   var fldCfg = [{
 *       name: 'deptid',
 *       type: 'S',
 *       length: 10,
 *       label: 'ID'
 *   }, {
 *       name: 'name',
 *       type: 'S',
 *       length: 20,
 *       label: 'Dept. Name'
 *   }];
 *   var dsDepartment = jslet.data.createDataset('department', fldCfg, 'deptid',
            'deptid', 'name');
 * </code></pre>
 * 
 * @param {String} dsName - dataset name
 * @param {jslet.data.Field[]} field configuration
 * @param {String} keyField - key field name
 * @param {String} codeField - code field name
 * @param {String} nameField - name field name
 * @param {String} parentField - parent field name
 * @return {jslet.data.Dataset}
 */
jslet.data.createDataset = function(dsName, fieldConfig, keyField,
		codeField, nameField, parentField) {
	var ds = new jslet.data.Dataset(dsName),fldObj;
	for (var i = 0, cnt = fieldConfig.length; i < cnt; i++) {
		fldObj = jslet.data.createField(fieldConfig[i]);
		ds.addField(fldObj)
	}

	if (keyField)
		ds.keyField(keyField);
	if (codeField)
		ds.codeField(codeField);
	if (nameField)
		ds.nameField(nameField);
	if (parentField)
		ds.parentField(parentField);
	return ds
}

jslet.data.DatasetEvent = Object();
jslet.data.DatasetEvent.BEFORESCROLL = 'before-scroll';
jslet.data.DatasetEvent.AFTERSCROLL = 'after-scroll';

jslet.data.DatasetEvent.BEFOREINSERT = 'before-insert';
jslet.data.DatasetEvent.AFTERINSERT = 'after-insert';

jslet.data.DatasetEvent.BEFOREUPDATE = 'before-update';
jslet.data.DatasetEvent.AFTERUPDATE = 'after-update';

jslet.data.DatasetEvent.BEFOREDELETE = 'before-delete';
jslet.data.DatasetEvent.AFTERDELETE = 'after-delete';

jslet.data.DatasetEvent.BEFORECONFIRM = 'before-confirm';
jslet.data.DatasetEvent.AFTERCONFIRM = 'after-confirm';

jslet.data.DatasetEvent.BEFORECANCEL = 'before-cancel';
jslet.data.DatasetEvent.AFTERCANCEL = 'after-cancel';

jslet.data.DataSetStatus = Object;
jslet.data.DataSetStatus.BROWSE = 0;
jslet.data.DataSetStatus.INSERT = 1;
jslet.data.DataSetStatus.UPDATE = 2;
jslet.data.DataSetStatus.DELETE = 3;

jslet.data.UpdateEvent = function(evtType, evtInfo) {
	this.eventType = evtType;
	this.eventInfo = evtInfo
}

jslet.data.UpdateEvent.SCROLL = 'scroll';// preRecno, recno
jslet.data.UpdateEvent.METACHANGE = 'metachange';// fieldname, metatype(title, readonly,enabled,format)
jslet.data.UpdateEvent.UPDATEALL = 'updateAll';
jslet.data.UpdateEvent.UPDATERECORD = 'updaterecord';// fieldname

jslet.data.UpdateEvent.UPDATECOLUMN = 'updatecolumn';// fieldname

jslet.data.UpdateEvent.SELECTCHANGE = 'selectchange';//
jslet.data.UpdateEvent.SELECTALLCHANGE = 'selectallchange';//
jslet.data.UpdateEvent.INSERT = 'insert';
jslet.data.UpdateEvent.DELETE = 'delete';// recno
jslet.data.UpdateEvent.BEFORESCROLL = 'beforescroll';

jslet.data.UpdateEvent.updateAllEvent = new jslet.data.UpdateEvent(
		jslet.data.UpdateEvent.UPDATEALL, null);

jslet.data.UpdateEvent.PAGECHANGE = 'pagechange';

jslet._PARSERPATTERN = /\[\D[\.!\w]*]/gim;

/**
 * @class Formula parser. Example:
 * <pre><code>
 * var parser = new jslet.FormulaParser(dsEmployee, '[name] == "Bob"');
 * parser.evalExpr();//return true or false
 * 
 * </code></pre>
 * 
 * @param {jselt.data.Dataset} ds dataset that use to evalute.
 * @param {String} expre Expression
 */
jslet.FormulaParser = function(ds, expr) {
	var ffields = new Array(),fotherDatasetFields,parsedExpr = '',dataset = ds;

	function parseExpr(ds, expr) {
		parsedExpr = '';
		var start = 0,end, k,dsName,fldName,dsTmp, stag;
		while ((stag = jslet._PARSERPATTERN.exec(expr)) != null) {
			fldName = stag[0];

			if (!fldName|| fldName.endsWith('('))
				continue;

			dsName = null;
			fldName = fldName.substr(1, fldName.length - 2);
			k = fldName.indexOf('!');
			if (k > 0) {
				dsName = fldName.substr(0, k);
				fldName = fldName.substr(k + 1)
			}

			end = stag.index;
			if (dsName == null) {
				dsTmp = ds;
				ffields.push(fldName);
				parsedExpr = parsedExpr + expr.substring(start, end)
						+ 'dataset.fieldValueByRec(dataRec,"' + fldName
						+ '")'
			} else {
				dsTmp = jslet.data.dataModule.get(dsName);
				if (!dsTmp)
					throw new Error(jslet.formatString(jslet.locale.Dataset.datasetNotFound, [dsName]));
				parsedExpr = parsedExpr + expr.substring(start, end)
						+ 'jslet.data.dataModule.get("' + dsName
						+ '").fieldValue("' + fldName + '")';
				if (!fotherDatasetFields)
					fotherDatasetFields = new Array();
				fotherDatasetFields.push({
							dataset : dsName,
							fieldName : fldName
						})
			}
			if (dsTmp.getField(fldName) == null)
				throw new Error(jslet.formatString(jslet.locale.Dataset.fieldNotFound, [fldName]));

			start = end + stag[0].length
		}//end while
		parsedExpr = parsedExpr + expr.substr(start)
	} //end function

	parseExpr(ds, expr);

	this.setDataset = function(ds) {
		dataset = ds
	}

	/**
	 * Get fields included in the expression.
	 * 
	 * @return {Array of String}
	 */
	this.getFields = function() {
		return ffields
	}

	/**
	 * Get fields of other dataset included in the expression.
	 * Other dataset fields are identified with 'datasetName!fieldName', like: department!deptName
	 * 
	 * @return {Array of Object} the return value like:[{dataset : 'dsName', fieldName: 'fldName'}]
	 */
	this.getOtherDatasetFields = function() {
		return fotherDatasetFields
	}

	/**
	 * Evaluate the expression.
	 * 
	 * @param {Object} dataRec Data record object, this argument is used in parsedExpr 
	 * @return {Object} The value of Expression.
	 */
	this.evalExpr = function(dataRec) {
		return eval(parsedExpr)
	}
}
