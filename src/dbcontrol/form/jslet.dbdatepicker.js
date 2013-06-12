/*
This file is part of Jslet framework

Copyright (c) 2013 Jslet Team

GNU General Public License(GPL 3.0) Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please visit: http://www.jslet.com/license.
*/

/**
 * @class DBDatePicker. Example:
 * <pre><code>
 * 		var jsletParam = {type:"DBDatePicker",dataset:"employee",field:"birthday", textReadOnly:true};
 * 
 * //1. Declaring:
 *      &lt;div data-jslet='type:"DBDatePicker",dataset:"employee",field:"birthday", textReadOnly:true' />
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
jslet.ui.DBDatePicker = jslet.Class.create(jslet.ui.DBCustomComboBox, {
	/**
	 * @override
	 */
    initialize: function ($super, el, params) {
        var Z = this;
        if (!Z.allProperties)
            Z.allProperties = 'dataset,field,textReadOnly,popupWidth, popupHeight,minDate,maxDate';
        if (!Z.requiredProperties)
            Z.requiredProperties = 'field';

        Z.dataset;
        Z.field;
        /**
         * {Boolean} Idenfity if user can input value with keyboard.
         */
        Z.textReadOnly;
        
        /**
         * {Integer} Popup panel width
         */
        Z.popupWidth;

        /**
         * {Integer} Popup panel height
         */
        Z.popupHeight;

        /**
         * {Date} minDate Minimized date of calendar range 
         */
        Z.minDate = null;

        /**
         * {Date} maxDate Maximized date of calendar range 
         */
        Z.maxDate = null;

        Z.popup = new jslet.ui.PopupPanel();
        Z.comboButtonCls = 'jl-datepick-btn';
        Z.comboButtonDisabledCls = 'jl-datepick-btn-disabled';

        $super(el, params)
    },

	/**
	 * @override
	 */
    isValidTemplateTag: function (el) {
        return true
    },

    buttonClick: function (event) {
        var el = this.parentNode, Z = el.jslet, fldObj = Z.dataset.getField(Z.field),
        jqEl = jQuery(el);
        var width = Z.popupWidth ? parseInt(Z.popupWidth) : 260;
        var height = Z.popupHeight ? parseInt(Z.popupHeight) : 226;
        var dateValue = Z.dataset.fieldValue(Z.field);
        var range = fldObj.range();
        if(range){
        	if(range.from)
        		Z.minDate = range.from;
        	if(range.to)
        		Z.maxDate = range.to;
        }
        if (!this.contentPanel)
            this.contentPanel = jslet.ui.createControl({ type: 'Calendar', value: dateValue, minDate: Z.minDate, maxDate: Z.maxDate,
                onDateSelected: function (date) {
                    Z.popup.hide();
                    Z.dataset.fieldValue(Z.field, date);
                }
            }, null, width + 'px', height + 'px');

        jslet.ui.PopupPanel.excludedElement = this;//event.element();
        var r = jqEl.offset(), h = jqEl.outerHeight(), x = r.left, y = r.top + h;
		if(jslet.locale.isRtl){
			x = x + jqEl.outerWidth() - width;
		}
        Z.popup.setContent(this.contentPanel.el);
        this.contentPanel.setValue(dateValue);
        Z.popup.show(x, y, width + 3, height + 3, 0, h)
    }
});

jslet.ui.register('DBDatePicker', jslet.ui.DBDatePicker);
jslet.ui.DBDatePicker.htmlTemplate = '<div></div>';
