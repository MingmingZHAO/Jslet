/*
This file is part of Jslet framework

Copyright (c) 2013 Jslet Team

GNU General Public License(GPL 3.0) Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please visit: http://www.jslet.com/license.
*/

/**
 * @class DBAutoCompleteBox. Example:
 * <pre><code>
 * var jsletParam = {type:"DBAutoCompleteBox",field:"department", matchType:"start"};
 * //1. Declaring:
 *      &lt;input id="cboAuto" type="text" data-jslet='jsletParam' />
 *      
 *  //2. Binding
 *      &lt;input id="cboAuto" type="text" data-jslet='jsletParam' />
 *  	//Js snippet
 * 		var el = document.getElementById('cboAuto');
 *  	jslet.ui.bindControl(el, jsletParam);
 *
 *  //3. Create dynamically
 *  	jslet.ui.createControl(jsletParam, document.body);
 *  	
 * </code></pre>
 */
jslet.ui.DBAutoComplete = jslet.Class.create(jslet.ui.DBText, {
	/**
	 * @override
	 */
    initialize: function ($super, el, params) {
        var Z = this;
        if (!Z.allProperties)
            Z.allProperties = 'dataset,field,minChars,minDelay,displayTemplate,beforePopup,matchMode,onGetFilterField';
        if (!Z.requiredProperties)
            Z.requiredProperties = 'field';

        /**
         * {jslet.data.Dataset} Dataset object, required
         */
        Z.dataset; 
        /**
         * {String} Field name, required and there must be lookup field.
         */
        Z.field; 
		/**
		 * {Integer} Fire auto searching after user press 'minChars' character. 
		 */
        Z.minChars = 0;
        /**
         * {Integer} Delay 'minDelay' ms to fire auto search when user press.
         */
        Z.minDelay = 0;
        
        Z.displayTemplate; 
        
        /**
         * {Function} Before pop up event handler, you can use this to customize the display result.
         * Pattern: 
         *   function(dataset, inputValue){}
         *   //dataset: jslet.data.Dataset; 
         *   //inputValue: String
         */
        Z.beforePopup;
        
        /**
         * {Function} Get filter field event handler, you can use this to customize the display result.
         * Pattern: 
         *   function(dataset, inputValue){}
         *   //dataset: jslet.data.Dataset; 
         *   //inputValue: String
         *   //return: String Field name
         */
        Z.onGetFilterField;
        
        /**
         * {String} Optional values: start, end, any
         */
        Z.matchMode = 'start';
        
        Z._timeoutHandler; 
        $super(el, params)
    },

	/**
	 * @override
	 */
    isValidTemplateTag: function (el) {
        return el.tagName.toLowerCase() == 'input'
				&& el.type.toLowerCase() == 'text'
    },

    doBlur: function (event) {
        var Z = this.jslet;
        if(Z.contentPanel && Z.contentPanel.isShowing())
        	Z.contentPanel.closePopup();
        
    	var f = Z.dataset.getField(Z.field);
        if(f.readOnly() || !f.enabled())
        	return;
   		Z.updateToDataset()
        Z.refreshControl(jslet.data.UpdateEvent.updateAllEvent)
    },

    doChange: null,

    doKeydown: function (event) {
		event = jQuery.event.fix( event || window.event );
   	
        var keyCode = event.which, Z = this.jslet;
        if ((keyCode == 38 || keyCode == 40) && Z.contentPanel && Z.contentPanel.isPop) {
            var f = Z.dataset.getField(Z.field),
            lkf = f.lookupField(),
            lkds = lkf.lookupDataset();
            if (keyCode == 38) //up arrow
                lkds.prior();

            if (keyCode == 40) //down arrow
                lkds.next()
        }

        if (keyCode == 8 || keyCode == 46 || keyCode == 229)//delete/backspace/ime
            this.jslet.invokePopup()
    },

    invokePopup: function () {
        var Z = this;
        if (Z._timeoutHandler)
            clearTimeout(Z._timeoutHandler);
        var delayTime = 100;
        if (Z.minDelay)
            delayTime = parseInt(Z.minDelay);
        
        Z._timeoutHandler = setTimeout(function () { Z.populate(Z.el.value); }, delayTime)
    },

    doKeypress: function (event) {
        var keyCode = event.keyCode ? event.keyCode : event.which
							? event.which
							: event.charCode;

        if (keyCode != 13)
            this.jslet.invokePopup();
        else {
            if (this.jslet.contentPanel)
                this.jslet.contentPanel.confirmSelect()
        }
    },

    populate: function (inputValue) {
        var Z = this;
        if (Z.minChars > 0 && inputValue && inputValue.length < Z.minChars)
            return;

        var f = Z.dataset.getField(Z.field),
        lkf = f.lookupField();
        if (!lkf) {
            jslet.showException(Z.field + ' is NOT a lookup field!');
            return
        }

        var lkds = lkf.lookupDataset();
        if (Z.beforePopup)
            Z.beforePopup(lkds, inputValue);
        else {
            if (inputValue) {
                var fldName;
                if (Z.onGetFilterField)
                    fldName = Z.onGetFilterField(lkds, inputValue);

                if (!fldName)
                    fldName = lkf.codeField();

                var s = inputValue;
                if (Z.matchMode == 'start')
                    s = s + '%';
                else {
                    if (Z.matchMode == 'end')
                        s = '%' + s;
                    else
                        s = '%' + s + '%'
                }
                lkds.filter('like([' + fldName + '],"' + s + '")');
                lkds.filtered(true)
            } else
                lkds.filtered(false)
        }
        if (Z.contentPanel == null)
            Z.contentPanel = new jslet.ui.DBAutoCompletePanel(Z);

        jslet.ui.PopupPanel.excludedElement = Z.el;
        var jqEl = jQuery(Z.el),
			r = jqEl.position(),
			h = jqEl.outerHeight(),
			x = r.left,
			y = r.top + h;
		if(jslet.locale.isRtl){
			x = x + jqEl.outerWidth() - Z.contentPanel.dlgWidth;
		}
        Z.contentPanel.showPopup(x, y, 0, h)
    }
});

/**
 * @private
 * @class DBAutoCompletePanel
 * 
 */
jslet.ui.DBAutoCompletePanel = function (autoCompleteObj) {
    var Z = this;
    Z.dlgWidth = 300;
    Z.dlgHeight = 200;

    var otable,lkf, lkds;
    Z.comboCfg = autoCompleteObj;
    Z.dataset = autoCompleteObj.dataset;
    Z.field = autoCompleteObj.field;
    Z.panel;
    Z.lkDataset;
    Z.popup = new jslet.ui.PopupPanel();
    Z.isPop = false;

    Z.create = function () {
        if (!Z.panel)
            Z.panel = document.createElement('div');

        //process variable
        var fld = Z.dataset.getField(Z.field),
        lkfld = fld.lookupField(),
        lkds = lkfld.lookupDataset();
        Z.lkDataset = lkds;

        Z.panel.innerHTML = '';

        var cntw = Z.dlgWidth - 4,cnth = Z.dlgHeight - 4;
        var tableparam = { type: 'DBTable', dataset: lkds, readOnly: true, hasSelectCol: false, hasSeqCol: false, hideHead: true };
        if (!Z.isMulti)
            tableparam.onRowDblClick = Z.confirmSelect;

        Z.otable = jslet.ui.createControl(tableparam, Z.panel, cntw, cnth);
        Z.otable.el.focus();
        return Z.panel
    }

    Z.confirmSelect = function () {
        var fldValue = Z.lkDataset.keyValue();
        if (fldValue)
            Z.dataset.fieldValue(Z.field, fldValue);

        if (Z.comboCfg.afterSelect)
            Z.comboCfg.afterSelect(Z.dataset, Z.lkDataset);

        Z.closePopup()
    }

    Z.showPopup = function (left, top, ajustX, ajustY) {
        if (!Z.panel)
            Z.panel = Z.create();
        Z.isPop = true;
        var p = Z.popup.getPopupPanel();
        p.style.padding = '0px';
        Z.popup.setContent(Z.panel);
        Z.popup.onHidePopup = Z.doClosePopup;
        Z.popup.show(left, top, Z.dlgWidth, Z.dlgHeight, ajustX, ajustY)
    }

    Z.doClosePopup = function () {
        Z.isPop = false;
        Z.lkDataset.filtered(false)
    }

    Z.closePopup = function () {
        Z.popup.hide()
    }
    
    Z.isShowing = function(){
    	if(Z.popup)
    		return Z.popup.isShowing;
    	else
    		return false;
    }
}

jslet.ui.register('DBAutoComplete', jslet.ui.DBAutoComplete);
jslet.ui.DBAutoComplete.htmlTemplate = '<input type="text"></input>';
