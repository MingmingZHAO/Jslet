/*
This file is part of Jslet framework

Copyright (c) 2013 Jslet Team

GNU General Public License(GPL 3.0) Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please visit: http://www.jslet.com/license.
*/

/**
* @class TipPanel. Example:
* <pre><code>
*   var tipPnl = new jslet.ui.TipPanel();
*   tipPnl.show('Hello world', 10, 10);
* </code></pre>
*/
jslet.ui.TipPanel = function () {
    this._hideTimerId = null;
    this._showTimerId = null;
    this._oldElement = null;
    var p = document.createElement('div');
    jQuery(p).addClass('jl-tip-panel');
    document.body.appendChild(p);
    this._tipPanel = p;

    /**
     * Show tips at specified position. Example:
     * <pre><code>
     *  tipPnl.show('foo...', event);
     *  tipPnl.show('foo...', 100, 200);
     * </code></pre>
     * 
     * @param {String} tips Tips text
     * @param {Integer or Event} left Postion left, if left is mouse event, then top argument can't be specified
     * @param {Integer} top Postion top
     */
    this.show = function (tips, leftOrEvent, top) {
        var Z = this;
        var len = arguments.length;
        var isSameCtrl = false, left = leftOrEvent;
        if (len == 2) { //this.show(tips)
            var evt = left;
            evt = jQuery.event.fix( evt );

            top = evt.pageY + 16; left = evt.pageX + 2;
            var ele = event.target;
            isSameCtrl == (ele === Z._oldElement);
            Z._oldElement = ele;
        } else {
            left = parseInt(left);
            top = parseInt(top);
        }

        if (Z._hideTimerId) {
            window.clearTimeout(Z._hideTimerId);
            if(isSameCtrl)
                return
        }

        this._showTimerId = window.setTimeout(function () {
            var p = Z._tipPanel;
            p.innerHTML = tips;
            p.style.left = left + 'px';
            p.style.top = top + 'px';
            Z._tipPanel.style.display = 'block';
            Z._showTimerId = null;
        }, 300);
    }

    /**
     * Hide tip panel
     */
    this.hide = function () {
        var Z = this;
        if (Z._showTimerId) {
            window.clearTimeout(Z._showTimerId);
            return;
        }
        Z._hideTimerId = window.setTimeout(function () {
            Z._tipPanel.style.display = 'none';
            Z._hideTimerId = null;
            Z._oldElement = null;
        }, 300);
    }
}

/**
 * Global tip panel
 */
jslet.ui.globalTip = new jslet.ui.TipPanel();
