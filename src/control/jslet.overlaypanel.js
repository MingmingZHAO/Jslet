/*
This file is part of Jslet framework

Copyright (c) 2013 Jslet Team

GNU General Public License(GPL 3.0) Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please visit: http://www.jslet.com/license.
*/

/**
* @class Overlay panel. Example:
* <pre><code>
*  var overlay = new jslet.ui.OverlayPanel(Z.el.parentNode);
*  overlay.setZIndex(999);
*  overlay.show();
* </code></pre>
* 
* @param {Html Element} container Html Element that OverlayPanel will cover.
* @param {String} color Color String.
*/
jslet.ui.OverlayPanel = function (container, color) {
    var odiv = document.createElement('div');
    jQuery(odiv).addClass('jl-overlay');
    if (color)
        odiv.style.backgroundColor = color;
    var left, top, width, height;
    if (!container) {
        var jqBody = jQuery(document.body);
        left = 0;
        top = 0;
        width = jqBody.width();
        height = jqBody.height();
    } else {
        width = jQuery(container).width();
        height = jQuery(container).height()
    }
    odiv.style.left = '0px';
    odiv.style.top = '0px';
    odiv.style.width =  width + 'px';
    odiv.style.height =  height + 'px';
    if (!container)
        document.body.appendChild(odiv);
    else
        container.appendChild(odiv);

    odiv.style.display = 'none';

    var oldResizeHanlder = null;
    if (!container) {
        oldResizeHanlder = window.onresize;

        window.onresize = function () {
            odiv.style.width = document.body.scrollWidth + 'px';
            odiv.style.height = document.body.scrollHeight + 'px';
        }
    } else {
        oldResizeHanlder = container.onresize;
        container.onresize = function () {
            var width = jQuery(container).width() - 12;
            var height = jQuery(container).height() - 12;
            odiv.style.width = width + 'px';
            odiv.style.height = height + 'px';
        }
    }

    this.overlayPanel = odiv;

    /**
     * Show overlay panel
     */
    this.show = function () {
        odiv.style.display = 'block';
        return odiv
    }

    /**
     * Hide overlay panel
     */
    this.hide = function () {
        odiv.style.display = 'none';
        return odiv
    }
    
    /**
     * Set Z-index 
     * 
     * @param {Integer} zIndex Z-Index
     */
    this.setZIndex = function(zIndex){
    	this.overlayPanel.style.zIndex = zIndex
    }

    this.destroy = function () {
        this.hide();
        if (!container) {
            window.onresize = oldResizeHanlder;
            document.body.removeChild(odiv)
        }
        else {
            container.onresize = oldResizeHanlder;
            container.removeChild(odiv)
        }
    }
}
