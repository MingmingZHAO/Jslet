/*
This file is part of Jslet framework

Copyright (c) 2013 Jslet Team

GNU General Public License(GPL 3.0) Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please visit: http://www.jslet.com/license.
*/

/**
 * @class DBPageBar. 
 * Functions:
 * 1. First page, Prior Page, Next Page, Last Page;
 * 2. Can go to specified page;
 * 3. Can specify page size on runtime;
 * 4. Need not write any code;
 * 
 * Example:
 * <pre><code>
 * 		var jsletParam = {type:"DBPageBar",dataset:"bom",pageSizeList:[20,50,100,200]};
 * 
 * //1. Declaring:
 *      &lt;div data-jslet='type:"DBPageBar",dataset:"bom",pageSizeList:[20,50,100,200]' />
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
jslet.ui.DBPageBar = jslet.Class.create(jslet.ui.DBControl, {
	/**
	 * @override
	 */
    initialize: function ($super, el, params) {
        var Z = this;
        if (!Z.allProperties)
            Z.allProperties = 'dataset,showPageSize,showGotoButton,pageSizeList';

        Z.dataset = null;
        /**
         * {Boolean} Identify if the "Page Size" part shows or not
         */
        Z.showPageSize = true;
        /**
         * {Boolean} Identify if the "GoTo" part shows or not
         */
        Z.showGotoButton = true;
        
        /**
         * {Integer[]) Array of integer, like: [50,100,200]
         */
        Z.pageSizeList = null;

        $super(el, params)
    },

	/**
	 * @override
	 */
    isValidTemplateTag: function (el) {
        var tagName = el.tagName.toLowerCase();
        return tagName == 'div'
    },

	/**
	 * @override
	 */
    bind: function () {
        var Z = this;
        //	    Z.el.style.whiteSpace = 'nowrap';
        var jqEl = jQuery(Z.el);
        if (!jqEl.hasClass('jl-pagebar'))
        	jqEl.addClass('jl-pagebar');

        var template = ['<select class="jl-pb-item"></select><label class="jl-pb-item">', jslet.locale.DBPageBar.pageSizeLabel,
		                '</label><div class="jl-pb-item jl-pb-button jl-pb-first"></div><div class="jl-pb-item jl-pb-button jl-pb-prior"></div><label class="jl-pb-item">|</label><label class="jl-pb-item">',
		                jslet.locale.DBPageBar.pageNumLabel,
		                '</label><div class="jl-pb-item jl-pb-pagenum"><input style="height:90%" value="1" size="2" ></input></div><div class="jl-pb-item jl-pb-button jl-pb-goto"></div><label class="jl-pb-item">',
		                jslet.formatString(jslet.locale.DBPageBar.pageCountLabel, [0]),
		                '</label><label class="jl-pb-item">|</label><div class="jl-pb-item jl-pb-button jl-pb-next"></div><div class="jl-pb-item jl-pb-button jl-pb-last"></div><div style="height:0px;width:0px;clear:both"></div>'
		                ];
        jqEl.html(template.join(''));

        var oPageSize = Z.el.childNodes[0];
        if (Z.showPageSize) {
            var rows = Z.pageSizeList;
            if (!rows)
                rows = [100, 200, 500];
            var cnt = rows.length, s = '';
            for (var i = 0; i < cnt; i++)
                s += '<option value=' + rows[i] + '>' + rows[i] + '</option>';

            oPageSize.innerHTML = s;
            Z.dataset.pageSize(parseInt(oPageSize.value))
        }

        jQuery(oPageSize).on('change', function (event) {
            var ds = this.parentElement.jslet.dataset;
            ds.pageNum(1);
            ds.pageSize(parseInt(this.value));
            ds.applyRefresh()
        });

        Z.firstBtn = Z.el.childNodes[2];
        Z.priorBtn = Z.el.childNodes[3];

        Z.pageNumTxt = Z.el.childNodes[6].firstChild;
        Z.gotoBtn = Z.el.childNodes[7];

        Z.pageCountLbl = Z.el.childNodes[8];

        Z.nextBtn = Z.el.childNodes[10];
        Z.lastBtn = Z.el.childNodes[11];

        jQuery(Z.firstBtn).on('click', function (event) {
            var ds = this.parentElement.jslet.dataset;
            ds.pageNum(1);
            ds.applyRefresh()
        });

        jQuery(Z.priorBtn).on('click', function (event) {
            var ds = this.parentElement.jslet.dataset;
            var num = ds.pageNum();
            if (num == 1)
                return;

            ds.pageNum(num - 1);
            ds.applyRefresh()
        });

        jQuery(Z.gotoBtn).on('click', function (event) {
            var oJslet = this.parentElement.jslet;
            var ds = oJslet.dataset;
            var num = parseInt(oJslet.pageNumTxt.value);
            if (num < 1)
                num = 1;
            if (num > ds.pageCount())
                num = ds.pageCount();
            ds.pageNum(num);
            ds.applyRefresh()
        });

        jQuery(Z.nextBtn).on('click', function (event) {
            var oJslet = this.parentElement.jslet;
            var ds = oJslet.dataset;
            var num = ds.pageNum();
            if (num >= ds.pageCount())
                return;
            ds.pageNum(++num);
            ds.applyRefresh()
        });

        jQuery(Z.lastBtn).on('click', function (event) {
            var oJslet = this.parentElement.jslet;
            var ds = oJslet.dataset;

            if (ds.pageCount() < 1)
                return;

            ds.pageNum(ds.pageCount());
            ds.applyRefresh()
        });

        jQuery(Z.pageNumTxt).on('keypress', function (event) {
    		event = jQuery.event.fix( event || window.event );
            var keyCode = event.which;

            var validChars = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');
            if (validChars.indexOf(String.fromCharCode(keyCode)) < 0)
                event.preventDefault()
        });

        Z.renderAll()
    },

	/**
	 * @override
	 */
    refreshControl: function (evt) {
        if (evt.eventType != jslet.data.UpdateEvent.PAGECHANGE)
            return;

        var Z = this;
        var num = Z.dataset.pageNum(), count = Z.dataset.pageCount();
        Z.pageNumTxt.value = num;
        Z.pageCountLbl.innerHTML = jslet.formatString(jslet.locale.DBPageBar.pageCountLabel, [count])
    }, // end refreshControl

	/**
	 * @override
	 */
    renderAll: function () {
        var displayStyle = this.showPageSize ? 'inline' : 'none';
        var oel = this.el;
        oel.childNodes[0].style.display = displayStyle;
        oel.childNodes[1].style.display = displayStyle;

        this.refreshControl(new jslet.data.UpdateEvent(jslet.data.UpdateEvent.PAGECHANGE,null))
    },
    
	/**
	 * @override
	 */
    destroy: function($super){
        var Z = this;
    	
        jQuery(Z.firstBtn).off();
        jQuery(Z.priorBtn).off();
        jQuery(Z.pageNumTxt).off();
        jQuery(Z.gotoBtn).off();
        jQuery(Z.pageCountLbl).off();
        jQuery(Z.nextBtn).off();
        jQuery(Z.lastBtn).off();
        
        Z.firstBtn = null;
        Z.priorBtn = null;
        Z.pageNumTxt = null;
        Z.gotoBtn = null;
        Z.pageCountLbl = null;
        Z.nextBtn = null;
        Z.lastBtn = null;
        
    	$super()
    }

});

jslet.ui.register('DBPageBar', jslet.ui.DBPageBar);
jslet.ui.DBPageBar.htmlTemplate = '<div></div>';
