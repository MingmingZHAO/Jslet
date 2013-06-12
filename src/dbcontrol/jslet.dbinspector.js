/*
This file is part of Jslet framework

Copyright (c) 2013 Jslet Team

GNU General Public License(GPL 3.0) Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please visit: http://www.jslet.com/license.
*/

/**
 * @class DBInspector. 
 * Display&Edit fields in two columns: Label column and Value column. If in edit mode, this control takes the field editor configuration from dataset field object.
 * Example:
 * <pre><code>
 * 		var jsletParam = {type:"DBInspector",dataset:"employee",columnCount:1,columnWidth:100};
 * 
 * //1. Declaring:
 *      &lt;div id='ctrlId' data-jslet='type:"DBInspector",dataset:"employee",columnCount:1,columnWidth:100' />
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
jslet.ui.DBInspector = jslet.Class.create(jslet.ui.DBControl, {
	/**
	 * @override
	 */
    initialize: function ($super, el, params) {
        var Z = this;
        Z.allProperties = 'dataset,columnCount,rowHeight,readOnly';
        Z.requiredProperties = null;

        Z.dataset = null;
        /**
         * {Integer} Column count
         */
        Z.columnCount = 1;
        /**
         * {Integer} Row height
         */
        Z.rowHeight = 30;
        /**
         * {Boolean} Read only
         */
        Z.readOnly = false;
        
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
        var colCnt = Z.columnCount;
        if (colCnt)
            colCnt = parseInt(colCnt);
        if (colCnt && colCnt > 0)
            Z.columnCount = colCnt;
        else
            Z.columnCount = 1;

        if (!Z.el.jslet)
            Z.el.jslet = Z;

        Z.preCell = null;
        Z.renderAll();

        jQuery(Z.el).on('keydown', function (event) {
            var keyCode = event.which;
            var r = this.preCell ? this.preCell.parentNode.rowIndex : 0;
            var c = this.preCell ? this.preCell.cellIndex : 0;

			var tbl = this.firstChild;
            if (keyCode == 38) {//KEY_UP
                if (r > 0) {
                	jQuery(tbl.rows[r - 1].cells[c]).click();
                    event.preventDefault()
                }
            } else if (keyCode == 40) {//KEY_DOWN
                var cnt = tbl.rows.length - 1;
                if (r < cnt) {
                	jQuery(tbl.rows[r + 1].cells[c]).click();
                    event.preventDefault()
                }
            }
        })
    }, // end bind

	/**
	 * @override
	 */
    renderAll: function () {
        var Z = this;
        var jqEl = jQuery(Z.el);
        if (!jqEl.hasClass('jl-inspector'))
        	jqEl.addClass('jl-inspector');
        var totalWidth = jqEl.width(),
        allFlds = Z.dataset.getFields();
        jqEl.html('<table cellpadding=0 cellspacing=0 style="margin:0px;padding:0px;table-layout:fixed;width:100%;height:100%"><tbody></tbody></table>');
        var oCol, f, oBody = Z.el.firstChild.firstChild,
        fcnt = allFlds.length,
        flds = new Array();
        for (var i = 0; i < fcnt; i++) {
            f = allFlds[i];
            if (f.visible())
                flds.push(f);
        }
        fcnt = flds.length;
        if (fcnt == 0)
            return;
        var w, c, columnCnt = Math.min(fcnt, Z.columnCount), arrLabelWidth = [];
        for (var i = 0; i < columnCnt; i++)
            arrLabelWidth[i] = 0;

        var startWidth = jslet.ui.textMeasurer.getWidth('*');
        jslet.ui.textMeasurer.setElement(Z.el);
        for (var i = 0; i < fcnt; i++) {
            f = flds[i];
            c = i % columnCnt;
            w = Math.round(jslet.ui.textMeasurer.getWidth(f.label()) + startWidth) + 5;
            if (arrLabelWidth[c] < w)
                arrLabelWidth[c] = w
        }
        jslet.ui.textMeasurer.setElement();

        var totalLabelWidth = 0;
        for (var i = 0; i < columnCnt; i++)
            totalLabelWidth += arrLabelWidth[i];

        var editorWidth = Math.round((totalWidth - totalLabelWidth) / columnCnt);

        var otable = Z.el.firstChild,
        tHead = otable.createTHead(), otd, otr = tHead.insertRow(-1);
        otr.style.height = '0px';
        for (var i = 0; i < columnCnt; i++) {
            otd = otr.insertCell(-1);
            otd.style.width = arrLabelWidth[i] + 'px';
            otd.style.height = '0px';
            otd = otr.insertCell(-1);
            otd.style.width = editorWidth + 'px';
            otd.style.height = '0px'
        }

        var oldR = -1, oldC = -1, r, odiv, oContent, oLabel, fldName, editor, fldCtrl, param, editable = false;
        Z.preRowIndex = -1;
        for (var i = 0; i < fcnt; i++) {
            f = flds[i];
            fldName = f.name();
            r = Math.floor(i / columnCnt);
            c = i % columnCnt;
            if (oldR != r) {
                otr = otable.insertRow(-1);
                if (Z.rowHeight)
                    otr.style.height = Z.rowHeight + 'px';

                oldR = r
            }

            otd = otr.insertCell(-1);
            otd.noWrap = true;
            otd.className = jslet.ui.htmlclass.DBINSPECTOR.labelColCls;

            oLabel = document.createElement('label');
            otd.appendChild(oLabel);
            new jslet.ui.DBLabel(oLabel, {
                type: 'DBLabel',
                dataset: Z.dataset,
                field: fldName
            });

            otd = otr.insertCell(-1);
            otd.className = jslet.ui.htmlclass.DBINSPECTOR.editorColCls;
            otd.noWrap = true;
            otd.dataField = fldName;
            otd.editor = null;
            otd.align = 'left';
            odiv = document.createElement('div');
            odiv.noWrap = true;
            odiv.style.padding = 0;
            odiv.style.overflow = 'hidden';
            odiv.style.textOverflow = 'ellipsis';
            odiv.style.whiteSpace = 'nowrap';
            odiv.style.width = '100%';
            odiv.style.height = '100%';
            odiv.style.vAlign = 'middle';
            otd.appendChild(odiv);
            editable = !Z.readOnly && (!f.readOnly() || f.enabled());
            if (editable) {
                fldCtrl = f.editControl();
                fldCtrl.dataset = Z.dataset;
                fldCtrl.field = fldName;

                editor = jslet.ui.createControl(fldCtrl, odiv);
                var ctrl = editor.el;
                ctrl.style.display = 'none';

                otd.editor = ctrl;
                ctrl.style.width = editorWidth - 10 + 'px'
            }

            if (f.getType() != jslet.data.DataType.BOOLEAN) {
                oContent = document.createElement('label');
                new jslet.ui.DBDataLabel(oContent, {
                    type: 'dbdatalabel',
                    dataset: Z.dataset,
                    field: fldName
                });
                otd.displayLabel = oContent;
                odiv.appendChild(oContent)
            } else {
                otd.displayLabel = otd.editor;
                if (otd.editor) {
                    otd.editor.style.width = '';
                    otd.editor.style.height = ''
                }
                if (!editable) {
                    oContent = document.createElement('input');
                    jQuery(oContent).attr('type', 'checkbox');
                    new jslet.ui.DBCheckBox(oContent, {
                        type: 'DBCheckbox',
                        dataset: Z.dataset,
                        field: fldName
                    });

                    otd.displayLabel = oContent;
                    odiv.appendChild(oContent);
                    otd.displayLabel.disabled = true
                }
                $(otd.displayLabel).show()
            }
            if (otd.editor && otd.displayLabel.style.font)
                otd.editor.style.font = Z.style.font;

            jQuery(otd).on('click', function () {
                if (this.editor && this.editor.style.display == 'none') {
                    var otable = this.parentNode.parentNode.parentNode;
                    var preCell = otable.preCell;

                    if (preCell && preCell.editor) {
                        if (!(preCell.editor.jslet instanceof jslet.ui.DBCheckBox)) {
                            preCell.editor.style.display = 'none';
                            preCell.displayLabel.style.display = ''
                        } else {
                            // preCell.displayLabel.disabled = false;
                        }
                    }
                    if (!(this.editor.jslet instanceof jslet.ui.DBCheckBox)) {
                        this.displayLabel.style.display = 'none';
                        this.editor.style.display = 'block'
                    } else {
                        // this.editor.disabled = false;
                    }
                    this.editor.focus();

                    otable.preCell = this
                }
            })
        } // end for
    },
    
	/**
	 * @override
	 */
    refreshControl: function (evt) {
        if (!evt)
            evt = jslet.data.UpdateEvent.METACHANGE;
        if (evt.eventType == jslet.data.UpdateEvent.METACHANGE)
            this.renderAll()
    },
    
	/**
	 * @override
	 */
    destroy: function($super){
        var jqEl = jQuery(this.el);

    	jQuery(jqEl).off();
    	jqEl.find('table')[0].preCell = null;
    	jqEl.find('table td').each(function(index) {
    	    this.editor = null;
    	})
    	$super();
    }
});

jslet.ui.htmlclass.DBINSPECTOR = {
	    labelColCls: 'jl-inspector-label',
	    editorColCls: 'jl-inspector-editor',
	    currentRowClassName: 'jl-inspector-currentrow'
	};

jslet.ui.register('DBInspector', jslet.ui.DBInspector);
jslet.ui.DBInspector.htmlTemplate = '<div></div>';
