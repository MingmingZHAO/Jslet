/*
This file is part of Jslet framework

Copyright (c) 2013 Jslet Team

GNU General Public License(GPL 3.0) Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please visit: http://www.jslet.com/license.
*/

/**
* Drag & Drop. A common framework to implement drag & drop. Example:
* <pre><code>
*   //Define a delegate class
*   dndDelegate = {}
*   dndDelegate._doDragStart = function(){}
* 	dndDelegate._doDragging = function (oldX, oldY, x, y, deltaX, deltaY) {}
* 	dndDelegate._doDragEnd = function (oldX, oldY, x, y, deltaX, deltaY) {}
* 	dndDelegate._doDragCancel = function () {}
* 
*   //Initialize jslet.ui.DnD
*   //var dnd = new jslet.ui.DnD();
*   //Or use global jslet.ui.DnD instance to bind 'dndDelegate'
*   jslet.ui.dnd.bindControl(dndDelegate);
*      
* 	//After end dragging, you need unbind it
*   jslet.ui.dnd.unbindControl();
* 
* </code></pre>
* 
*/
jslet.ui.DnD = function () {
    var oldX, oldY, x, y, deltaX, deltaY,
    dragDelta = 2, dragged = false, bindedControl, mouseDowned = true,
    self = this;

    this._docMouseDown = function (event) {
		event = jQuery.event.fix( event || window.event );
        mouseDowned = true;
        deltaX = 0;
        deltaY = 0;
        oldX = event.pageX;
        oldY = event.pageY;
        dragged = false;

        if (bindedControl && bindedControl._doMouseDown)
            bindedControl._doMouseDown(oldX, oldY, x, y, deltaX, deltaY)
    }

    this._docMouseMove = function (event) {
        if (!mouseDowned)
            return;
		event = jQuery.event.fix( event || window.event );
        
        x = event.pageX;
        y = event.pageY;
        if (!dragged) {
            if (Math.abs(deltaX) > dragDelta || Math.abs(deltaY) > dragDelta) {
                dragged = true;
                oldX = x;
                oldY = y;
                if (bindedControl && bindedControl._doDragStart)
                    bindedControl._doDragStart(oldX, oldY);
                return
            }
        }
        deltaX = x - oldX;
        deltaY = y - oldY;
        if (dragged) {
            if (bindedControl && bindedControl._doDragging)
                bindedControl._doDragging(oldX, oldY, x, y, deltaX, deltaY)
        } else {
            if (bindedControl && bindedControl._doMouseMove)
                bindedControl._doMouseMove(oldX, oldY, x, y, deltaX, deltaY);
            oldX = x;
            oldY = y;
        }
    }

    this._docMouseUp = function (event) {
        mouseDowned = false;
        if (dragged) {
            dragged = false;
            if (bindedControl && bindedControl._doDragEnd)
                bindedControl._doDragEnd(oldX, oldY, x, y, deltaX, deltaY);
        } else {
            if (bindedControl && bindedControl._doMouseUp)
                bindedControl._doMouseUp(oldX, oldY, x, y, deltaX, deltaY);
        }
        self.unbindControl()
    }

    this._docKeydown = function (event) {
		event = jQuery.event.fix( event || window.event );
        if (event.which == 27) {//Esc key
            if (dragged) {
                dragged = false;
                if (bindedControl && bindedControl._doDragCancel) {
                    bindedControl._doDragCancel();
                    self.unbindControl()
                }
            }
        }
    }

    this._docSelectStart = function (event) {
		event = jQuery.event.fix( event || window.event );
        event.preventDefault();

        return false
    }

    /**
     * Bind control 
     * 
     * @param {Object} ctrl The control need drag & drop, there are four method in it: 
     *  ctrl._doDragStart = function(){}
     * 	ctrl._doDragging = function (oldX, oldY, x, y, deltaX, deltaY) {}
     * 	ctrl._doDragEnd = function (oldX, oldY, x, y, deltaX, deltaY) {}
     * 	ctrl._doDragCancel = function () {}
     *  ctrl_doDragStart = function{}
     *  
     */
    this.bindControl = function (ctrl) {
        bindedControl = ctrl;
        var doc = jQuery(document);
        doc.on('mousedown', this._docMouseDown);
        doc.on('mouseup', this._docMouseUp);
        doc.on('mousemove', this._docMouseMove);
        doc.on('selectstart', this._docSelectStart);
        doc.on('keydown', this._docKeydown)
    }

    /**
     * Unbind the current control
     */
    this.unbindControl = function () {
        var doc = jQuery(document);
        doc.off('mousedown', this._docMouseDown);
        doc.off('mouseup', this._docMouseUp);
        doc.off('mousemove', this._docMouseMove);
        doc.off('selectstart', this._docSelectStart);
        doc.off('keydown', this._docKeydown);
//        bindedControl._doDragStart = null;
//        bindedControl._doDragging = null;
//        bindedControl._doDragEnd = null;
//        bindedControl._doDragCancel = null;
        
        bindedControl = null
    }
}

jslet.ui.dnd = new jslet.ui.DnD();

