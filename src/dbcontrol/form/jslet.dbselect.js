/*
This file is part of Jslet framework

Copyright (c) 2013 Jslet Team

GNU General Public License(GPL 3.0) Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please visit: http://www.jslet.com/license.
*/

/**
 * @class DBSelect. Example:
 * <pre><code>
 * 		var jsletParam = {type:"DBSelect",dataset:"employee",field:"department"};
 * 
 * //1. Declaring:
 *      &lt;select data-jslet='type:"DBSelect",dataset:"employee",field:"department"' />
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
jslet.ui.DBSelect = jslet.Class.create(jslet.ui.DBControl, {
	/**
	 * @override
	 */
    initialize: function ($super, el, params) {
		var Z = this;
        if (!Z.allProperties)
            Z.allProperties = 'dataset,field,groupField';
        if (!Z.requiredProperties)
            Z.requiredProperties = 'field';

        Z.dataset;
        /**
         * {String} Field name, required and there must be lookup field.
         */
        Z.field;
        /**
         * {String} Group field name, you can use this to group options.
         * Detail to see html optgroup element.
         */
        Z.groupField;
        $super(el, params)
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
        Z.renderOptions();
        Z.renderAll();

        jQuery(Z.el).on('change', Z._doChanged)// end observe
    }, // end bind

    _doChanged: function (event) {
        this.jslet.updateToDataset()
    },
    
    renderOptions: function () {
        var Z = this;
        var f = Z.dataset.getField(Z.field), lkf = f.lookupField();
        if (!lkf)
            return;

        var lkds = lkf.lookupDataset(),
        oldRecno = lkds.recno(),
        groupIsLookup = false,
        groupLookupField, gf, extraIndex;

        try {
            if (Z.groupField) {
                gf = lkds.getField(Z.groupField);
                if (gf == null)
                    throw 'NOT found field: ' + Z.groupField
									+ ' in ' + lkds.name();
                groupLookupField = gf.lookupField();
                groupIsLookup = (groupLookupField != null);
                if (groupIsLookup)
                    extraIndex = Z.groupField + '.'
									+ groupLookupField.codeField();
                else
                    extraIndex = Z.groupField;

                var indfld = lkds.indexFields();
                if (indfld != null && !indfld.blank())
                    lkds.indexFields(extraIndex + ';' + indfld);
                else
                    lkds.indexFields(extraIndex);
            }
            var preGroupValue, groupValue, groupDisplayValue, optParent = Z, s = [], cnt = lkds.recordCount();
            if(!f.required() && f.nullText()){
            	s.push('<option value="_null_">');
            	s.push(f.nullText());
            	s.push('</option>');
            }
            for (var i = 0; i < cnt; i++) {
                lkds.innerSetRecno(i);
                if (Z.groupField) {
                    groupValue = lkds.fieldValue(Z.groupField);
                    if (groupValue != preGroupValue) {

                        if (preGroupValue != null)
                            s.push('</optgroup>');
                        if (groupIsLookup) {
                            if (!groupLookupField.lookupDataset()
											.findByField(
													groupLookupField
															.keyField(),
													groupValue))
                                throw 'Not found: <'
												+ groupValue
												+ '> in Dataset:<'
												+ groupLookupField
														.lookupDataset()
														.name()
												+ '>field: <'
												+ groupLookupField
														.keyField() + '>';
                            groupDisplayValue = groupLookupField
											.getCurrentDisplayValue()
                        } else
                            groupDisplayValue = groupValue;

                        s.push('<optgroup label="');
                        s.push(groupDisplayValue);
						s.push('">');
                    }
                }
                s.push('<option value="');
				s.push(lkds.fieldValue(lkf.keyField()));
				s.push('">');
				s.push(lkf.getCurrentDisplayValue());
				s.push('</option>');
            } // end while
            if (preGroupValue != null)
                s += '</optgroup>';
            jQuery(Z.el).html(s.join(''))
        } finally {
            lkds.innerSetRecno(oldRecno)
        }
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
                var value = Z.dataset.fieldValue(Z.field),
                cnt = Z.el.options.length, opt, flag;
               // window.setTimeout(function(){
	                for (var i = 0; i < cnt; i++) {
	                    opt = Z.el.options[i];
	                    if(opt)
	                    opt.selected = false
	                }
              //  },10);
                
                if (!Z.el.multiple) {
                    if (value == null){
                        var f = Z.dataset.getField(Z.field);
                        if(!f.required() && f.nullText())
                        	value = '_null_';
                    }
                    Z.el.value = value;
                } else {
                    var arrValue;
                    if (value != null)
                        arrValue = value.split(',');
                    else
                        arrValue = null;

                    Z._keep_silence_ = true;
                    try {
                        for (var i = 0; i < cnt; i++) {
                            opt = Z.el.options[i];

                            var vcnt = arrValue.length - 1;
                            if (vcnt < 0)
                                break;
                       //     window.setTimeout(function(){
	                            for (j = vcnt; j >= 0; j--) {
	                                flag = (arrValue[j] == opt.value);
	                                if (flag) {
	                                	if(opt)
	                                    opt.selected = flag;
	                                    arrValue.splice(j, 1);
	                                    break
	                                }
	                            } // end for j
                     //       },10);
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
    }, // end renderAll

    updateToDataset: function () {
        var Z = this;
        if (Z._keep_silence_)
            return;
        var opt, value = '';
        if (!Z.el.multiple) {
            value = Z.el.value;
            if (!value) {
                opt = Z.el.options[Z.el.selectedIndex];
                value = opt.innerHTML
            }
        } else {
            var opts = jQuery(Z.el).find('option'),
            cnt = opts.length - 1;
            for (var i = 0; i <= cnt; i++) {
                opt = opts[i];
                if (opt.selected) {
                    value += ',';
                    value += opt.value ? opt.value : opt.innerHTML
                }
            }
            value = value.slice(1)
        }
        if (!value) {
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
    }, // end updateToDataset
    
	/**
	 * @override
	 */
    destroy: function($super){
    	jQuery(this.el).off();
    	$super()
    }
});

jslet.ui.register('DBSelect', jslet.ui.DBSelect);
jslet.ui.DBSelect.htmlTemplate = '<select></select>';
