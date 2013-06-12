/*
This file is part of Jslet framework

Copyright (c) 2013 Jslet Team

GNU General Public License(GPL 3.0) Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please visit: http://www.jslet.com/license.
*/

/**
 * @class DBCombodlg. 
 * Show data on a popup panel, it can display tree style or table style. 
 * Example:
 * <pre><code>
 * 		var jsletParam = {type:"DBCombodlg",dataset:"employee",field:"department", textReadOnly:true};
 * 
 * //1. Declaring:
 *      &lt;div data-jslet='type:"DBCombodlg",dataset:"employee",field:"department", textReadOnly:true' />
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
jslet.ui.DBComboSelect = jslet.Class.create(jslet.ui.DBCustomComboBox, {
	/**
	 * @override
	 */
    initialize: function ($super, el, params) {
        var Z = this;
        if (!Z.allProperties)
            Z.allProperties = 'dataset,field,popupHeight,popupWidth,treeIconWidth,showStyle,textReadOnly';
        if (!Z.requiredProperties)
            Z.requiredProperties = 'field';

        Z.dataset;
        /**
         * {String} Field name, required and there must be lookup field.
         */
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
        
        Z.contentPanel;
        Z.comboButtonCls = 'jl-combodlg-btn';
        Z.comboButtonDisabledCls = 'jl-combodlg-btn-disabled';        
        $super(el, params)
    },

	/**
	 * @override
	 */
    isValidTemplateTag: function (el) {
        return true
    },

	/**
	 * @override
	 */
    afterBind: function () {
        var Z = this;
        if (Z.textReadOnly)
            Z.el.childNodes[0].readOnly = true;

        if (Z.popupWidth)
            Z.popupWidth = parseInt(Z.popupWidth);

        if (Z.popupHeight)
            Z.popupHeight = parseInt(Z.popupHeight);

        if (Z.treeIconWidth)
            Z.treeIconWidth = parseInt(Z.treeIconWidth);

        Z.showStyle = Z.showStyle ? Z.showStyle : 'auto';
        Z.showStyle = Z.showStyle.toLowerCase();
        if (Z.showStyle != 'table' && Z.showStyle != 'tree'
				&& Z.showStyle != 'auto')
            Z.showStyle = 'auto';
        if (Z.contentPanel)
            Z.contentPanel = null
    },

    buttonClick: function (event) {
		event = jQuery.event.fix( event || window.event );
    	
        var el = this.parentNode, Z = el.jslet, f = Z.dataset.getField(Z.field), lkf = f.lookupField(),
        jqEl = jQuery(el);
        if (lkf == null && lkf == undefined) {
            jslet.showException(Z.field + ' is NOT a lookup field!');
            return
        }
        var style = Z.showStyle;
        if (Z.showStyle == 'auto')
            style = lkf.parentField() ? 'tree' : 'table';

        if (!Z.contentPanel) {
            Z.contentPanel = new jslet.ui.DBComboSelectPanel(Z);
            Z.contentPanel.iconWidth = Z.treeIconWidth;
            Z.contentPanel.showStyle = style;
            Z.contentPanel.customButtonLabel = Z.customButtonLabel;
            Z.contentPanel.onCustomButtonClick = Z.onCustomButtonClick;
            if (Z.popupWidth)
                Z.contentPanel.popupWidth = Z.popupWidth;
            if (Z.popupHeight)
                Z.contentPanel.popupHeight = Z.popupHeight
        }
        jslet.ui.PopupPanel.excludedElement = this;//event.target();
        var r = jqEl.offset(), h = jqEl.outerHeight(), x = r.left, y = r.top + h;
		if(jslet.locale.isRtl){
			x = x + jqEl.outerWidth() - Z.contentPanel.popupWidth;
		}
        Z.contentPanel.showPopup(x, y, 0, h)
    },
    
    closePopup: function(){
    	this.contentPanel = null
    },
    
	/**
	 * @override
	 */
    destroy: function($super){
    	var Z = this;
    	if(Z.contentPanel){
	    	Z.contentPanel.destroy();
	    	Z.contentPanel = null;
    	}
    	jslet.ui.PopupPanel.excludedElement = null;
    	$super()
    }
});

jslet.ui.DBComboSelectPanel = function (jsletCombo) {
    var Z = this;

    Z.showStyle = 'auto';
    Z.iconWidth;
    Z.customButtonLabel;
    Z.onCustomButtonClick;
    Z.template = ''
    Z.popupWidth = 300;
    Z.popupHeight = 300;

    var otree, otable, showType, valueSeperator = ',', lkf, lkds, self = this;
    Z.isMulti = false;
    Z.comboCfg = jsletCombo;

    Z.dataset = jsletCombo.dataset;
    Z.field = jsletCombo.field;
    Z.panel;
    Z.selFields;
    Z.txtValue;
    Z.lkDataset;
    Z.popup = new jslet.ui.PopupPanel();

    Z.create = function () {
        if (!Z.panel)
            Z.panel = document.createElement('div');

        Z.panel.style.padding = '5px';

        //process variable
        var fld = Z.dataset.getField(Z.field),
        lkfld = fld.lookupField(),
        pfld = lkfld.parentField(),
        showType = Z.showStyle.toLowerCase(),
        valueSeparator = lkfld.multiValueSeparator(),
        lkds = lkfld.lookupDataset();
        Z.lkDataset = lkds;

        Z.isMulti = lkfld.multiSelect();

        var template = ['<div class="jl-combopnl-head" style="height:25px"><label>',
                        jslet.locale.DBComboSelect.find,
         ':</label><select style="width:100px"></select><label> = </label><input type="text" size="20" style="width:100px"></input></div>',
         '<div class="jl-combopnl-content" style="width:100%;padding-top:10px;margin:0px"></div>',
          '<div class="jl-combopnl-footer" style="height:25px;display:none;position:relative;padding-top:10px"><input type="button" value="',
          jslet.locale.MessageBox.cancel,
         '" class="jl-combopnl-footer-cancel" ></input><input type="button" value="',
         jslet.locale.MessageBox.ok,
         '" class="jl-combopnl-footer-ok" ></input></div>'];

        Z.panel.innerHTML = template.join('');
        var jqPanel = jQuery(Z.panel);
        var jqPh = jqPanel.find('.jl-combopnl-head');
        Z.selFields = jqPh.find('select')[0];
        var arrFlds = lkds.getFields(), opt, f;
        for (var i = 0, cnt = arrFlds.length; i < cnt; i++) {
            f = arrFlds[i];
            if (f.visible()) {
                opt = document.createElement('option');
                opt.value = f.name();
                opt.innerHTML = f.label();
                Z.selFields.appendChild(opt)
            }
        }
        Z.txtValue = jqPh.find('input')[0];
        jQuery(Z.selFields).on('change', Z.doFieldChange);
        jQuery(Z.txtValue).on('keydown', Z.findData);
        Z.txtValue._jslet_lkds_name = Z.lkDataset.name();

        var cnth = parseInt(Z.popupHeight) - 60 - 25; //header height + padding
        if (Z.isMulti) {
            cnth -= 30 - 10; //footer height
            var pnlFoot = jqPanel.find('.jl-combopnl-footer')[0];
            pnlFoot.style.display = 'block';
            var jqFoot = jQuery(pnlFoot);
            jqFoot.find('.jl-combopnl-footer-cancel').click(function (event) { self.closePopup() });
            jqFoot.find('.jl-combopnl-footer-ok').click(Z.confirmSelect)
        }
        jqPanel.find('.jl-combopnl-content')[0].height = cnth + 'px';

        var contentPanel = jqPanel.find('.jl-combopnl-content')[0],
        cntw = Z.popupWidth - 30; //padding

        //create popup content
        if (showType == 'tree') {
            var treeparam = { type: 'DBTreeView', dataset: lkds, readOnly: true, displayFields: lkfld.displayFields(), hasCheckbox: Z.isMulti,
                keyField: lkfld.keyField(), parentField: lkfld.parentField()//, iconWidth: params.iconWidth
            };

            if (!Z.isMulti)
                treeparam.onItemDblClick = Z.confirmSelect;
            Z.otree = jslet.ui.createControl(treeparam, contentPanel, cntw, cnth);

            if (lkfld.onlyLeafLevel()) {
                Z.otree.beforeCheckBoxClick = function (oNode) {
                    if (Z.otree.el.hasChildren(oNode)) {
                        jslet.showInfo(jslet.locale.DBComboSelect.onlyLeafNode);
                        return false
                    }
                    return true
                }
            }
        } else {
            var tableparam = { type: 'DBTable', dataset: lkds, readOnly: true, hasSelectCol: Z.isMulti, hasSeqCol: true };
            if (!Z.isMulti)
                tableparam.onRowDblClick = Z.confirmSelect;

            Z.otable = jslet.ui.createControl(tableparam, contentPanel, cntw, cnth)
        }
        return Z.panel
    }

    Z.initSelected = function () {
        var fldValue = Z.dataset.fieldValue(Z.field), lkds = Z.lkDataset;

        if (!Z.isMulti) {
            if (fldValue)
                lkds.findByKey(fldValue);
            return
        }
        if (Z.showStyle == 'tree')
            Z.otree.setCheckedKeyValues(fldValue, valueSeparator);
        else {
            lkds.selectAll(false, null, true);
            if (fldValue) {
                var arrKeyValues = fldValue.split(valueSeparator),
                cnt = arrKeyValues.length;
                for (var i = 0; i < cnt; i++){
                    lkds.selectByKeyValue(true, arrKeyValues[i]);
                }
            }
        }
    }

    Z.doFieldChange = function () {
        var txt = jQuery(this.parentNode).find('input')[0];
        txt.value = '';
        txt.focus()
    }

    Z.findData = function (event) {
		event = jQuery.event.fix( event || window.event );
        if (event.which != 13)//enter
            return;
        var sel = jQuery(this.parentNode).find('select')[0], findFldName = sel.value, findValue = this.value;
        if (!findValue)
            return;
        var lkds = jslet.data.getDataset(this._jslet_lkds_name), f = lkds.getField(findFldName);
        if (f.getType() == jslet.data.DataType.STRING)
        	lkds.find('like([' + findFldName + '],"' + findValue + '%")');
        else
        	lkds.findByField(findFldName, findValue)
    }

    Z.confirmSelect = function () {
        var ojslet = self, fldValue = self.dataset.fieldValue(self.field),
        fld = self.dataset.getField(self.field),
        lkfld = fld.lookupField(),
        isMulti = lkfld.multiSelect();

        if (self.showStyle == 'tree') {
            if (!self.isMulti && lkfld.onlyLeafLevel() && self.otree.listvm.hasChildren()) {
                jslet.showInfo(jslet.locale.DBComboSelect.onlyLeafNode);
                return
            }

            if (self.isMulti || !fldValue || fldValue.length == 0)
                fldValue = self.otree.getCheckedKeyValues(true);
            else
                fldValue = self.lkDataset.fieldValue(lkfld.keyField())
        }
        else {
            if (self.isMulti) {
                var selectedValues = self.lkDataset.getSelectedKeyValues();
                if (selectedValues)
                    fldValue = selectedValues.join(valueSeparator);
                else
                    fldValue = null
            }
            else
                fldValue = self.lkDataset.keyValue()
        }
        if (fldValue)
            self.dataset.fieldValue(self.field, fldValue);

        if (!self.isMulti && self.comboCfg.afterSelect)
            self.comboCfg.afterSelect(self.dataset, self.lkDataset);

        self.closePopup()
    }

    Z.showPopup = function (left, top, ajustX, ajustY) {
        if (!Z.panel)
            Z.panel = Z.create();
        else {
            var ojslet = Z.otree ? Z.otree : Z.otable;
            ojslet.dataset.addLinkedControl(ojslet);
            ojslet.renderAll()
        }
        Z.popup.setContent(Z.panel);
        Z.initSelected();
        Z.popup.show(left, top, Z.popupWidth, Z.popupHeight, ajustX, ajustY)
    }

    Z.closePopup = function () {
        self.popup.hide();
        var ojslet = Z.otree ? Z.otree : Z.otable;
        ojslet.dataset.removeLinkedControl(ojslet)
    }
    
    Z.destroy = function(){
    	if(Z.otree){
    		Z.otree.destroy();
    		Z.otree = null;
    	}
    	if(Z.otable){
    		Z.otable.destroy();
    		Z.otable = null;
    	}
    	var jqPanel = jQuery(Z.panel);
    	var jqFoot = jqPanel.find('.jl-combopnl-footer');
        jqFoot.find('.jl-combopnl-footer-cancel').off();
        jqFoot.find('.jl-combopnl-footer-ok').off();
        jQuery(Z.selFields).off();
        jQuery(Z.txtValue).off();
    	
    	Z.txtValue = null;
    	Z.popup = null;
    	Z.selFields = null;
    	Z.panel = null;
    	Z.popup = null;
    }
}

jslet.ui.register('DBComboSelect', jslet.ui.DBComboSelect);
jslet.ui.DBComboSelect.htmlTemplate = '<div></div>';
