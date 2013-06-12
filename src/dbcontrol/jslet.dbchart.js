/*
This file is part of Jslet framework

Copyright (c) 2013 Jslet Team

GNU General Public License(GPL 3.0) Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please visit: http://www.jslet.com/license.
*/

/**
 * @class DBChart, show data as a chart. There are five chart type: column, bar, line, area, pie  
 * Example:
 * <pre><code>
 * 		var jsletParam = {type:"dbchart", dataset:"summary", chartType:"column",categoryField:"area,month",valueField:"amount"};
 * 
 * //1. Declaring:
 *      &lt;div id="chartId" data-jslet='type:"dbchart",chartType:"column",categoryField:"area,month",valueField:"amount", dataset:"summary"' />
 *      or
 *      &lt;div data-jslet='jsletParam' />
 *      
 *  //2. Binding
 *      &lt;div id="ctrlId"  />
 *  	//Js snippet
 * 		var el = document.getElementById('ctrlId');
 *  	jslet.ui.bindControl(el, jsletParam);
 *
 *  //3. Create dynamically
 *  	jslet.ui.createControl(jsletParam, document.body);
 *  	
 * </code></pre>
 */
jslet.ui.DBChart = jslet.Class.create(jslet.ui.DBControl, {
	/**
	 * @override
	 */
    initialize: function ($super, el, params) {
		var Z = this;
        Z.allProperties = 'dataset,chartUrl,chartType,chartTitle,chartColor,onlySelected,categoryField,valueField,legendPos';
        Z.requiredProperties = 'valueField,categoryField';
        
        Z.dataset;
        /**
         * {String} Chart url. You don't care about this argument if you use default chart render.
         */
        Z.chartUrl;
        /**
         * {String} Chart type. Optional value is: column, bar, line, area, pie
         */
        Z.chartType;
        /**
         * {String} Category field, use comma(,) to separate multiple fields.
         */
        Z.categoryField;
        /**
         * {Number} Value field, only one field allowed.
         */
        Z.valueField;
        /**
         * {String} Chart title
         */
        Z.chartTitle;
        /**
         * {String} Background color of chart, like: #FFF
         */
        Z.chartColor;
        /**
         * {Boolean} True - Only selected record will be shown in chart, false - All records will be shown.
         */
        Z.onlySelected;
        /**
         * {String} Legend position, optional value: none, top, bottom, left, right
         */
        Z.legendPos;
        
        $super(el, params)
    },

	/**
	 * @override
	 */
    isValidTemplateTag: function (el) {
        return el.tagName.toLowerCase() == 'div'
    },

	/**
	 * @override
	 */
    bind: function () {
        var Z = this;
        if (!Z.chartUrl)
            Z.chartUrl = jslet.rootUri + 'resources/common/jsletchart.swf';

        var odiv = document.createElement('div');
        Z.chartId = 'jsletchart' + jslet.AUTOID++;
        odiv.id = Z.chartId;
        Z.el.appendChild(odiv);

        var params = {
            allowScriptAccess: 'always',
            no_flash: 'Sorry, you need to install flash to see this content.',
            bgcolor: '#ffffff',
            wmode: 'opaque'
        }, vars = {
            allowedDomain: document.location.hostname
        };

        new swfobject.embedSWF(Z.chartUrl, Z.chartId, '100%', '100%',
				'9.0.45', undefined, vars, params);

        Z.onlySelected = Z.onlySelected ? true : false;
        if (!Z.legendPos)
            Z.legendPos = 'none';
        if (Z.chartTitle == undefined)
            Z.chartTitle = '';

        Z.swf = jQuery('#' +Z.chartId)[0]
    }, // end bind

	/**
	 * @override
	 */
    refreshControl: function (evt) {
    },

    drawChart: function () {
        var Z = this;
        if (Z.dataset.recordCount() == 0)
            return;

        var arrCateFields = Z.categoryField.split(','),
        cnt = arrCateFields.length,
        isMultiCateFld = arrCateFields.length > 1;
        for (var i = 0; i < cnt; i++) {
            fldName = arrCateFields[i];
            f = Z.dataset.getField(fldName);
            if (!f)
                throw new Error(jslet.formatString(jslet.locale.Dataset.fieldNotFound,[fldName]))
        }
        var arrValueFields = Z.valueField.split(','), fldName, f;
        cnt = arrValueFields.length;
        for (var i = 0; i < cnt; i++) {
            fldName = arrValueFields[i];
            f = Z.dataset.getField(fldName);
            if (!f)
                throw new Error(jslet.formatString(jslet.locale.Dataset.fieldNotFound,[fldName]))
            if (f.getType() != jslet.data.DataType.NUMBER) {
                throw new Error(jslet.formatString(jslet.locale.DBChart.onlyNumberFieldAllowed,[fldName]))
            }
        }
        var chartData = new Object();
        chartData.jslet = true;
        var cateFldName = arrCateFields[0];
        f = Z.dataset.getField(cateFldName);
        chartData.xFields = {
            fieldName: cateFldName,
            displayName: f.label()
        };

        if (isMultiCateFld) {
            var arrCateValue = new Array(),
            hsValueFlds = new jslet.SimpleMap(),
            arrData = new Array(),
            dataObj, titleFldName = arrCateFields[1], titleValue, fldName,
            reccnt = Z.dataset.recordCount(),
            preRecno = Z.dataset.recno(),
            preCateValue = '', cateValue,
            fldIdx = 1, k,
            arrYFields = new Array(),
            valFld = arrValueFields[0],
            selRecs = Z.dataset.getSelectedRecords(),
            noSel = selRecs == null || selRecs.length == 0,
            currCateValue = null;
            if (noSel)
                currCateValue = Z.dataset.getFieldText(cateFldName);
            try {
                for (var i = 0; i < reccnt; i++) {
                    Z.dataset.innerSetRecno(i);
                    cateValue = Z.dataset.getFieldText(cateFldName);
                    if (Z.onlySelected) {
                        if (noSel) {
                            if (cateValue != currCateValue)
                                continue
                        } else if (!Z.dataset.isSelected())
                            continue
                    }
                    k = arrCateValue.indexOf(cateValue);
                    if (k < 0) {
                        arrCateValue.push(cateValue);
                        dataObj = new Object();
                        dataObj[cateFldName] = cateValue;
                        arrData.push(dataObj)
                    } else
                        dataObj = arrData[k];

                    titleValue = Z.dataset.getFieldText(titleFldName);
                    fldName = hsValueFlds.get(titleValue);
                    if (!fldName) {
                        fldName = '_fld_' + fldIdx++;
                        hsValueFlds.set(titleValue, fldName);
                        arrYFields.push({
                            fieldName: fldName,
                            displayName: titleValue
                        })
                    }

                    dataObj[fldName] = Z.dataset.fieldValue(valFld)
                }
            } finally {
                Z.dataset.innerSetRecno(preRecno)
            }
            chartData.yFields = arrYFields;
            chartData.dataArray = arrData
        } else {
            cnt = arrValueFields.length;
            var arrYFields = new Array();
            for (var i = 0; i < cnt; i++) {
                f = Z.dataset.getField(arrValueFields[i]);
                arrYFields.push({
                    fieldName: arrValueFields[i],
                    displayName: f.label()
                })
            }
            chartData.yFields = arrYFields;
            var arrData = new Array(), dataObj,
            reccnt = Z.dataset.recordCount(),
            preRecno = Z.dataset.recno();
            try {
                for (var i = 0; i < reccnt; i++) {
                    Z.dataset.innerSetRecno(i);
                    if (Z.onlySelected && !Z.dataset.isSelected())
                        continue;
                    dataObj = new Object();
                    dataObj[cateFldName] = Z.dataset
							.getFieldText(cateFldName);
                    for (var j = 0; j < cnt; j++) {
                        dataObj[arrValueFields[j]] = Z.dataset
								.fieldValue(arrValueFields[j])
                    }
                    arrData.push(dataObj)
                }
            } finally {
                Z.dataset.innerSetRecno(preRecno);
                if (Z.onlySelected && arrData.length == 0) {
                    dataObj = new Object();
                    dataObj[arrCateFields[0]] = Z.dataset
							.getFieldText(arrCateFields[0]);
                    for (var i = 0; i < cnt; i++) {
                        dataObj[arrValueFields[i]] = Z.dataset
								.fieldValue(arrValueFields[i])
                    }
                    arrData.push(dataObj)
                }
            }
            chartData.dataArray = arrData
        }
        Z.swf.drawChart(Z.chartType, Z.chartTitle, chartData, Z.legendPos)
    }, // end refreshControl

	/**
	 * @override
	 */
    renderAll: function () {
        var Z = this;
        if (this.swf.drawChart)
            this.drawChart();
        else
            setTimeout(function(){Z.drawChart();},	1000);
    },
    
	/**
	 * @override
	 */
    destroy: function($super){
    	this.swf = null;
    	$super()
    }
});

jslet.ui.register('DBChart', jslet.ui.DBChart);
jslet.ui.DBChart.htmlTemplate = '<div></div>';
