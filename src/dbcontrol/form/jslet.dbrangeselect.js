/*
This file is part of Jslet framework

Copyright (c) 2013 Jslet Team

GNU General Public License(GPL 3.0) Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please visit: http://www.jslet.com/license.
*/

/**
 * @class DBRangeSelect. 
 * Display a select which options produce with 'beginItem' and 'endItem'. Example:
 * <pre><code>
 * 		var jsletParam = {type:"DBRangeSelect",dataset:"employee",field:"age",beginItem:10,endItem:100,step:5};
 * 
 * //1. Declaring:
 *      &lt;select data-jslet='type:"DBRangeSelect",dataset:"employee",field:"age",beginItem:10,endItem:100,step:5' />
 *      or
 *      &lt;select data-jslet='jsletParam' />
 *      
 *  //2. Binding
 *      &lt;select id="ctrlId"  />
 *  	//Js snippet
 * 		var el = document.getElementById('ctrlId');
 *  	jslet.ui.bindControl(el, jsletParam);
 *
 *  //3. Create dynamically
 *  	jslet.ui.createControl(jsletParam, document.body);
 *  	
 * </code></pre>
 */
jslet.ui.DBRangeSelect = jslet.Class.create(jslet.ui.DBControl, {
	/**
	 * @override
	 */
    initialize: function ($super, el, params) {
		var Z = this;
        if (!Z.allProperties)
            Z.allProperties = 'dataset,field,beginItem,endItem,step';
        if (!Z.requiredProperties)
            Z.requiredProperties = 'field,beginItem,endItem,step';

        Z.dataset;
        Z.field;
        /**
         * {Integer} Begin item 
         */
        Z.beginItem = 0;
        /**
         * {Integer} End item
         */
        Z.endItem = 10;
        /**
         * {Integer} Step
         */
        Z.step = 1;
        $super(el, params);
    },

	/**
	 * @override
	 */
    isValidTemplateTag: function (el) {
        return (el.tagName.toLowerCase() == 'select')
    },

	/**
	 * @override
	 */
    bind: function () {
        var Z = this;
        Z.checkDataField();

        if (!Z.beginItem && isNaN(Z.beginItem))
            throw new Error(jslet.formatString(jslet.locale.DBControl.propertyValueMustBeInt,
							['begin-item']));
        Z.beginItem = parseFloat(Z.beginItem);
        if (!Z.endItem && isNaN(Z.endItem))
            throw new Error(jslet.formatString(jslet.locale.DBControl.propertyValueMustBeInt,
							['end-item']));
        Z.endItem = parseFloat(Z.endItem);

        if (!Z.step)
            Z.step = 1;
        else
            Z.step = parseInt(Z.step);

        if (isNaN(Z.step))
            throw new Error(jslet.formatString(jslet.locale.DBControl.propertyValueMustBeInt,
							['step']));

        Z.renderOptions();
        Z.renderAll();

        if (!Z.el.jslet)
            Z.el.jslet = Z;
        jQuery(Z.el).on('change', function () {
            Z.updateToDataset();
        })// end observe

    }, // end bind

    renderOptions: function () {
        var Z = this;
        var arrhtm = [];
        
        var f = Z.dataset.getField(Z.field);
        if(!f.required() && f.nullText()){
        	arrhtm.push('<option value="_null_">');
        	arrhtm.push(f.nullText());
        	arrhtm.push('</option>');
        }

        for (var i = Z.beginItem; i <= Z.endItem; i += Z.step) {
            arrhtm.push('<option value="');
            arrhtm.push(i);
            arrhtm.push('">');
            arrhtm.push(i);
            arrhtm.push('</option>')
        }
        jQuery(Z.el).html(arrhtm.join(''));
        delete arrhtm
    }, // end renderOptions

	/**
	 * @override
	 */
    refreshControl: function (evt, isForce) {
        var Z = this;
        if (Z._keep_silence_)
            return;
        if(!isForce && !Z.isActiveRecord())
        	return;

        if (evt.eventType == jslet.data.UpdateEvent.METACHANGE) {
            if (evt.eventInfo.enabled != undefined)
                Z.el.disabled = !evt.eventInfo.enabled;

            if (evt.eventInfo.readOnly != undefined)
                Z.el.readOnly = evt.eventInfo.readOnly;
            return
        }

        if (evt.eventType == jslet.data.UpdateEvent.SCROLL
						|| evt.eventType == jslet.data.UpdateEvent.UPDATEALL
						|| evt.eventType == jslet.data.UpdateEvent.UPDATERECORD
						|| evt.eventType == jslet.data.UpdateEvent.INSERT
						|| evt.eventType == jslet.data.UpdateEvent.DELETE
						|| evt.eventType == jslet.data.UpdateEvent.UPDATECOLUMN) {
            if (evt.eventType == jslet.data.UpdateEvent.UPDATERECORD
							&& evt.eventInfo != undefined
							&& evt.eventInfo.fieldName != undefined
							&& evt.eventInfo.fieldName != Z.field)
                return;

            try {
                var value = Z.dataset.fieldValue(Z.field);

                if (!Z.el.multiple) {
                    if (value != null)
                        Z.el.value = value;
                    else
                        Z.el.value = null;
                } else {
                    var arrValue;
                    if (value != null)
                        arrValue = value.split(',');
                    else
                        arrValue = null;

                    var cnt = Z.el.options.length, opt, flag;
                    Z._keep_silence_ = true;
                    try {
                        for (var i = 0; i < cnt; i++) {
                            opt = Z.el.options[i];
                          //  setTimeout(function () {
                            if(opt)
                                opt.selected = false
                        //    }, 1)
                        }

                        for (var i = 0; i < cnt; i++) {
                            opt = Z.el.options[i];
                            var vcnt = arrValue.length - 1;
                            if (vcnt < 0)
                                break;
                            for (j = vcnt; j >= 0; j--) {
                                flag = (arrValue[j] == opt.value);
                                if (flag) {
                             //       setTimeout(function () {
                                	if(opt)
                                        opt.selected = flag;
                             //       }, 1);
                                    arrValue.splice(j, 1);
                                    break
                                }
                            } // end for j
                        } // end for i
                    } finally {
                        Z._keep_silence_ = false
                    }
                }
            } catch (e) {
                jslet.showException(e)
            }
        }
    }, // end refreshControl

	/**
	 * @override
	 */
    renderAll: function () {
        this.refreshControl(jslet.data.UpdateEvent.updateAllEvent, true)
    },

    updateToDataset: function () {
        var Z = this;
        if (Z._keep_silence_)
            return;
        var value = '';
        if (!Z.el.multiple)
            value = Z.el.value;
        else {
            var opts = jQuery(Z.el).find('option');
            var cnt = opts.length - 1;
            for (var i = 0; i <= cnt; i++) {
                opt = opts[i];
                if (opt.selected) {
                    value += ',';
                    value += opt.value
                }
            }
            value = value.slice(1)
        }
        if (value == '') {
            Z.renderAll();
            return
        }
        Z._keep_silence_ = true;
        try {
            var f = Z.dataset.getField(Z.field);
            if(value == '_null_' && !f.required() && f.nullText())
            	value = null;
            Z.dataset.fieldValue(Z.field, value)
        } catch (e) {
            jslet.showException(e);
        } finally {
            Z._keep_silence_ = false
        }
    },
    
	/**
	 * @override
	 */
    destroy: function($super){
    	jQuery(this.el).off();
    	$super()
    }    
});

jslet.ui.register('DBRangeSelect', jslet.ui.DBRangeSelect);
jslet.ui.DBRangeSelect.htmlTemplate = '<select></select>';
