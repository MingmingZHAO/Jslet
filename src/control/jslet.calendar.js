/*
This file is part of Jslet framework

Copyright (c) 2013 Jslet Team

GNU General Public License(GPL 3.0) Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please visit: http://www.jslet.com/license.
*/

/**
 * @class Calendar. Example:
 * <pre><code>
 *  var jsletParam = {type:"Calendar"};
 *  //1. Declaring:
 *     &lt;div data-jslet='type:"Calendar"' />
 *      
 *  //2. Binding
 *  	&lt;div id='ctrlId' />
 * 		//js snippet 
 *  	var el = document.getElementById('ctrlId');
 *  	jslet.ui.bindControl(el, jsletParam);
 *  		
 *  //3. Create dynamically
 *  	jslet.ui.createControl(jsletParam, document.body);
 *  	
 * </code></pre>
 */
jslet.ui.Calendar = jslet.Class.create(jslet.ui.Control, {
	/**
	 * @override
	 */
    initialize: function ($super, el, params) {
		var Z = this;
        Z.el = el;
        Z.allProperties = 'value,onDateSelected,minDate,maxDate';
        /**
         * {Date} Calendar value
         */
        Z.value;
        
        /**
         * {Event Handler}  Fired when user select a date.
         * Pattern: 
         *    function(value){}
         *    //value: Date
         */
        Z.onDateSelected = null;
        
        /**
         * {Date} minDate Minimized date of calendar range 
         */
        Z.minDate = null;

        /**
         * {Date} maxDate Maximized date of calendar range 
         */
        Z.maxDate = null;
        
        Z._currYear = 0;
        Z._currMonth = 0;
        $super(el, params)
    },

	/**
	 * @override
	 */
    bind: function () {
        this.renderAll();
    },

	/**
	 * @override
	 */
    renderAll: function () {
        var Z = this;
        jqEl = jQuery(Z.el);
        if (!jqEl.hasClass('jl-calendar'))
        	jqEl.addClass('jl-calendar');
        if (!jqEl.width())
            Z.el.style.width = '250px';
        if (!jqEl.height())
            Z.el.style.height = '226px';

        var template = ['<div class="jl-cal-header">',
            '<span class="jl-cal-btn jl-cal-yprev" title="', jslet.locale.Calendar.yearPrev,
            '">&lt;&lt;</span><span class="jl-cal-btn jl-cal-mprev" title="', jslet.locale.Calendar.monthPrev, '">&lt;',
            '</span><span class="jl-cal-title"></span><span class="jl-cal-btn jl-cal-mnext" title="', jslet.locale.Calendar.monthNext, '">&gt;',
            '</span><span class="jl-cal-btn jl-cal-ynext" title="', jslet.locale.Calendar.yearNext, '">&gt;&gt;</span>',
        '</div>',
        '<div class="jl-cal-body">',
            '<table cellpadding="0" cellspacing="0" style="width: 100%;">',
                '<thead><tr><th class="jl-cal-weekend">',
                jslet.locale.Calendar.Sun,
                    '</th><th>',
                    jslet.locale.Calendar.Mon,
                        '</th><th>',
                    jslet.locale.Calendar.Tue,
                        '</th><th>',
                    jslet.locale.Calendar.Wed,
                        '</th><th>',
                    jslet.locale.Calendar.Thu,
                        '</th><th>',
                    jslet.locale.Calendar.Fri,
                        '</th><th class="jl-cal-weekend">',
                    jslet.locale.Calendar.Sat,
                        '</th></tr></thead><tbody>',
                        '<tr><td><a href="javascript:;" class="jl-cal-weekend"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td class="jl-cal-weekend"><a href="javascript:;"></a></td></tr>',
                        '<tr><td><a href="javascript:;" class="jl-cal-weekend"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td class="jl-cal-weekend"><a href="javascript:;"></a></td></tr>',
                        '<tr><td class="jl-cal-weekend"><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td class="jl-cal-weekend"><a href="javascript:;"></a></td></tr>',
                        '<tr><td class="jl-cal-weekend"><a href="javascript:;"></a></td><td><a href="javascript:;" class="jl-cal-disable"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td class="jl-cal-weekend"><a href="javascript:;"></a></td></tr>',
                        '<tr><td class="jl-cal-weekend"><a href="javascript:;"></a></td><td><a href="javascript:;" class="jl-cal-disable"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td class="jl-cal-weekend"><a href="javascript:;"></a></td></tr>',
                        '<tr><td class="jl-cal-weekend"><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td><a href="javascript:;"></a></td><td class="jl-cal-weekend"><a href="javascript:;"></a></td></tr>',
                        '</tbody></table></div><div class="jl-cal-footer"><span class="jl-cal-today">', jslet.locale.Calendar.today, '</span></div>'];

        jqEl.html(template.join(''));
        var jqTable = jqEl.find('.jl-cal-body table');
        jqTable.on('mousedown', Z._doTableClick);
        
        var dvalue = Z.value && Z.value.constructor == Date ? Z.value : new Date();
        var m = dvalue.getMonth(), y = dvalue.getFullYear();
        Z._refreshDateCell(y, m);
        jqEl.find('.jl-cal-today').click(function (event) {
            var d = new Date();
            Z.setValue(new Date(d.getFullYear(), d.getMonth(), d.getDate()))
        });
        
        jqEl.find('.jl-cal-yprev').click(function (event) {
            var y = Z._currYear - 1;
            var m = Z._currMonth;
            if (Z.minDate) {
                var minM = Z.minDate.getMonth();
                var minY = Z.minDate.getFullYear();
                if (y == minY && m < minM)
                    m = minM
            }
            Z._refreshDateCell(y, m)
        });
        
        jqEl.find('.jl-cal-mprev').click(function (event) {
            var y = Z._currYear;
            var m = Z._currMonth - 1;
            if (m < 0) {
                y -= 1;
                m = 11
            }
            Z._refreshDateCell(y, m)
        });
        
        jqEl.find('.jl-cal-ynext').click(function (event) {
            var y = Z._currYear + 1;
            var m = Z._currMonth;
            if (Z.maxDate) {
                var maxM = Z.maxDate.getMonth();
                var maxY = Z.maxDate.getFullYear();
                if (y == maxY && m > maxM)
                    m = maxM
            }
            Z._refreshDateCell(y, m)
        });
        
        jqEl.find('.jl-cal-mnext').click(function (event) {
            var y = Z._currYear;
            var m = Z._currMonth + 1;
            if (m > 11) {
                y += 1;
                m = 0
            }
            Z._refreshDateCell(y, m)
        });
    },

    /**
     * Set date value of calendar.
     * 
     * @param {Date} value Calendar date
     */
    setValue: function (value) {
        if (!value)
            return;

        var Z = this;
        if (Z.minValue && value < Z.minValue)
            return;
        if (Z.maxValue && value > Z.maxValue)
            return;
        Z.value = value;
        var y = value.getFullYear(), m = value.getMonth();
        if (Z._currYear == y && Z._currMonth == m)
            Z._setCurrDateCls();
        else
            Z._refreshDateCell(y, m);

        if (Z.onDateSelected)
            Z.onDateSelected(Z.value)
    },

    _checkNaviState: function () {
        var Z = this;
        var jqEl = jQuery(Z.el);
        if (Z.minDate) {
            var minY = Z.minDate.getFullYear();
            var minM = Z.minDate.getMonth();
            var flag = (Z._currYear <= minY);
            var btnYearPrev = jqEl.find('.jl-cal-yprev')[0];
            btnYearPrev.style.visibility = flag ? 'hidden' : 'visible';

            var flag = (Z._currYear == minY && Z._currMonth <= minM);
            var btnMonthPrev = jqEl.find('.jl-cal-mprev')[0];
            btnMonthPrev.style.visibility = flag ? 'hidden' : 'visible';

            flag = (Z.minDate > new Date());
            var btnToday = jqEl.find('.jl-cal-today')[0];
            btnToday.style.visibility = flag ? 'hidden' : 'visible'
        }

        if (Z.maxDate) {
            var maxY = Z.maxDate.getFullYear();
            var maxM = Z.maxDate.getMonth();
            var flag = (Z._currYear >= maxY);
            var btnYearNext = jqEl.find('.jl-cal-ynext')[0];
            btnYearNext.jslet_disabled = flag;
            btnYearNext.style.visibility = flag ? 'hidden' : 'visible';

            var flag = (Z._currYear == maxY && Z._currMonth >= maxM);
            var btnMonthNext = jqEl.find('.jl-cal-mnext')[0];
            btnMonthNext.jslet_disabled = flag;
            btnMonthNext.style.visibility = flag ? 'hidden' : 'visible';

            flag = (Z.maxDate < new Date());
            var btnToday = jqEl.find('.jl-cal-today')[0];
            btnToday.style.visibility = flag ? 'hidden' : 'visible'
        }
    },

    _refreshDateCell: function (year, month) {
        var Z = this;
        var jqEl = jQuery(Z.el);
         
        var monthnames = jslet.locale.Calendar.monthNames;
        var mname = monthnames[month];
        var otitle = jqEl.find('.jl-cal-title')[0];
        otitle.innerHTML = mname + ',' + year;
        var otable = jqEl.find('.jl-cal-body table')[0];
        var rows = otable.tBodies[0].rows;
        var firstDay = new Date(year, month, 1);
        var w1 = firstDay.getDay();
        var oneDayMs = 24 * 60 * 60 * 1000;
        var date = new Date(firstDay.getTime() - (w1 + 1) * oneDayMs);
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        var rowCnt = rows.length, otr, otd, m, date, oa;
        for (var i = 1; i <= rowCnt; i++) {
            otr = rows[i - 1];
            var tdCnt = otr.cells.length;
            for (var j = 1; j <= tdCnt; j++) {
                otd = otr.cells[j - 1];
                date = new Date(date.getTime() + oneDayMs);
                oa = otd.firstChild;

                if (Z.minDate && date < Z.minDate || Z.maxDate && date > Z.maxDate) {
                    oa.innerHTML = '';
                    otd.jslet_date_value = null;
                    continue
                } else {
                    oa.innerHTML = date.getDate();
                    otd.jslet_date_value = date
                }
                m = date.getMonth();
                if (m != month)
                    oa.style.color = '#BBBBBB';
                else
                    oa.style.color = ''
            } //end for j
        } //end for i
        Z._currYear = year;
        Z._currMonth = month;
        Z._setCurrDateCls();
        Z._checkNaviState()
    },

    _doTableClick: function (event) {
		event = jQuery.event.fix( event || window.event );
        var node = event.target;
        var otd = node.parentNode;

        if (otd && otd.tagName && otd.tagName.toLowerCase() == 'td') {
            if (!otd.jslet_date_value)
                return;

            var el = jslet.ui.findFirstParent(otd, function (node) { return node.jslet; });
            var ojslet = el.jslet;
            ojslet.value = otd.jslet_date_value;
            if (ojslet.onDateSelected)
                ojslet.onDateSelected(ojslet.value);
            ojslet._setCurrDateCls()
        }
    },

    _setCurrDateCls: function () {
        var Z = this;
        if (!Z.value || Z.value.constructor != Date)
            return;
        var currM = Z.value.getMonth();
        var currY = Z.value.getFullYear();
        var currD = Z.value.getDate();

        var otable = jqEl.find('.jl-cal-body table')[0];
        var rows = otable.tBodies[0].rows;
        var rowCnt = rows.length, otr, otd, m, d, y, date, oa;
        for (var i = 0; i < rowCnt; i++) {
            otr = rows[i];
            var tdCnt = otr.cells.length;
            for (var j = 0; j < tdCnt; j++) {
                otd = otr.cells[j];
                date = otd.jslet_date_value;
                if (!date)
                    continue;

                m = date.getMonth();
                y = date.getFullYear();
                d = date.getDate();
                oa = jQuery(otd.firstChild);
                if (y == currY && m == currM && d == currD) {
                    if (!oa.hasClass('jl-cal-current'))
                        oa.addClass('jl-cal-current')
                } else
                    oa.removeClass('jl-cal-current')
            }
        }
    },
    
	/**
	 * @override
	 */
    destroy: function($super){
    	var jqEl = jQuery(this.el);
    	jqEl.find('.jl-cal-body table').off();
    	jqEl.find('.jl-cal-today').off();
    	jqEl.find('.jl-cal-yprev').off();
    	jqEl.find('.jl-cal-mprev').off();
    	jqEl.find('.jl-cal-mnext').off();
    	jqEl.find('.jl-cal-ynext').off();
    	$super()
    }
});
jslet.ui.register('Calendar', jslet.ui.Calendar);
jslet.ui.Calendar.htmlTemplate = '<div></div>';
