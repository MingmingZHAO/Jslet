/*
This file is part of Jslet framework

Copyright (c) 2013 Jslet Team

GNU General Public License(GPL 3.0) Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please visit: http://www.jslet.com/license.
*/

jslet.ui.htmlclass = {};
jslet.ui.GlobalZIndex = 100;

/**
* Popup Panel. Example: 
* <pre><code>
* var popPnl = new jslet.ui.PopupPanel();
* popPnl.setContent(document.getElementById('id'));
* popPnl.show(10, 10, 100, 100);
* 
* popPnl.hide(); //or
* popPnl.destroy();
* </code></pre>
*  
*/
jslet.ui.PopupPanel = function () {
	/**
	 * Event handler when hide popup panel: function(){}
	 */
    this.onHidePopup = null;

    this.isShowing = false;
    /**
     * Private document click handler
     */
    this.documentClickHandler = function (event) {
   		event = jQuery.event.fix( event || window.event );
        var srcEle = event.target;
        if (jslet.ui.PopupPanel.excludedElement == srcEle || jslet.ui.inPopupPanel(srcEle))
            return;

//        if (jslet.ui._popupPanel) {
//            jslet.ui._popupPanel.style.display = 'none';
//            jslet.ui._popupShadow.style.display = 'none'
//        }
        if(jslet.ui._activePopup)
        	jslet.ui._activePopup.hide();
    }

    /**
     * Private, create popup panel
     */
    this._createPanel = function () {
        if (!jslet.ui._popupPanel) {
            var p = document.createElement('div');
            p.style.display = 'none';
            p.className = 'jl-popuppanel jl-opaque jl-border-box';
            p.style.position = 'absolute';
            p.style.zIndex = 99999;
            document.body.appendChild(p);

            var shadow = document.createElement('div');
            shadow.style.display = 'none';
            shadow.className = 'jl-shadow';
            shadow.style.zIndex = 99998;
            document.body.appendChild(shadow);
            jslet.ui._popupShadow = shadow;

            jQuery(document).on('click', this.documentClickHandler);
            jslet.ui._popupPanel = p
        }
    }

    /**
     * Show popup panel in specified position with specified size.
     * 
     * @param {Integer} left Left position
     * @param {Integer} top Top position
     * @param {Integer} width Popup panel width
     * @param {Integer} height Popup panel height
     * 
     */
    this.show = function (left, top, width, height, ajustX, ajustY) {
        this._createPanel();
        left = parseInt(left);
        top = parseInt(top);

        if (height)
            jslet.ui._popupPanel.style.height = parseInt(height) + 'px';
        if (width)
            jslet.ui._popupPanel.style.width = parseInt(width) + 'px';

        var panel = jQuery(jslet.ui._popupPanel);
        var w = panel.width(),
        h = panel.height(),
        obody = document.body;
        if (left - obody.scrollLeft + w > obody.clientWidth)
            left -= w;
        if (top - obody.scrollTop + h > obody.clientHeight)
            top -= (h + ajustY);

        if (top)
            jslet.ui._popupPanel.style.top = top + 'px';
        if (left)
            jslet.ui._popupPanel.style.left = left + 'px';

        jslet.ui._popupShadow.style.width = w + 'px';
        jslet.ui._popupShadow.style.height = h + 'px';
        jslet.ui._popupShadow.style.top = top + 2 + 'px';
        jslet.ui._popupShadow.style.left = left + 2 + 'px';

        jslet.ui._popupPanel.style.display = 'block';
        jslet.ui._popupShadow.style.display = 'block';
        
        jslet.ui._activePopup = this;
        this.isShowing = true;
    }

    /**
     * Set popup panel content.
     * 
     * @param {Html Element} content popup panel content
     */
    this.setContent = function (content) {
        this._createPanel();
        var oldContent = jslet.ui._popupPanel.childNodes[0];
        if (oldContent)
            jslet.ui._popupPanel.removeChild(oldContent);
        jslet.ui._popupPanel.appendChild(content)
    }

    /**
     * Get popup Panel. You can use this method to customize popup panel.
     * 
     * @return {Html Element}
     * 
     */
    this.getPopupPanel = function () {
        this._createPanel();
        return jslet.ui._popupPanel
    }

    /**
     * Destroy popup panel completely.
     */
    this.destroy = function () {
        if (!jslet.ui._popupPanel)
            return;
        this.isShowing = false;
        document.body.removeChild(jslet.ui._popupPanel);
        document.body.removeChild(jslet.ui._popupShadow);
        jQuery(this._popupPanel).off();
        jslet.ui._popupPanel = null;
        jslet.ui._popupShadow = null;
        this.onHidePopup = null;
        jQuery(document).off('click', this.documentClickHandler)
    }

    /**
     * Hide popup panel, and you can show it again.
     * 
     */
    this.hide = function () {
        if (jslet.ui._popupPanel) {
            jslet.ui._popupPanel.style.display = 'none';
            jslet.ui._popupShadow.style.display = 'none'
        }
        if (this.onHidePopup)
            this.onHidePopup();
       
        this.isShowing = false;
        delete jslet.ui._activePopup;
    }
}

/**
* Check if a html element is in an active popup or not
* 
* @param {Html Element} htmlElement Checking html element
* 
* @return {Boolean} True - In popup panel, False - Otherwise
*/
jslet.ui.inPopupPanel = function (htmlElement) {
    if (!htmlElement || htmlElement == document)
        return false;
    if (jQuery(htmlElement).hasClass('jl-popuppanel'))
        return true;
    else
        return jslet.ui.inPopupPanel(htmlElement.parentNode);
}

/**
* Get the specified level parent element. Example:
* <pre><code>
*  //html snippet is: body -> div1 -> div2 ->table
*  jslet.ui.getParentElement(div2); // return div1
*  jslet.ui.getParentElement(div2, 2); //return body 
* </code></pre>
* 
* @param {Html Element} htmlElement html element as start point
* @param {Integer} level level
* 
* @return {Html Element} Parent element, if not found, return null.
*/
jslet.ui.getParentElement = function (htmlElement, level) {
    if (!level)
        level = 1;
    var flag = htmlElement.parentElement ? true : false,
    result = htmlElement;
    for (var i = 0; i < level; i++) {
        if (flag)
            result = result.parentElement;
        else
            result = result.parentNode;
        if (!result)
            return null
    }
    return result
}

/**
* Find first parent with specified condition. Example:
* <pre><code>
*   //Html snippet: body ->div1 ->div2 -> div3
* 	var odiv = jslet.ui.findFirstParent(
* 		odiv3, 
* 		function (node) {return node.class == 'head';},
* 		function (node) {return node.tagName != 'BODY'}
*   );
* </code></pre>
* 
* @param {Html Element} element The start checking html element
* @param {Function} conditionFn Callback function: function(node}{...}, node is html element;
* 			if conditionFn return true, break finding and return 'node'
* @param {Function} stopConditionFn Callback function: function(node}{...}, node is html element;
* 			if stopConditionFn return true, break finding and return null
* 
* @return {Html Element} Parent element or null
*/
jslet.ui.findFirstParent = function (htmlElement, conditionFn, stopConditionFn) {
    var p = htmlElement;
    if (!p)
        return null;

    if (!conditionFn)
        return p.parentNode;

    if (conditionFn(p))
        return p;
    else {
        if (stopConditionFn && stopConditionFn(p.parentNode))
            return null;

        return jslet.ui.findFirstParent(p.parentNode, conditionFn, stopConditionFn)
    }
}

/**
 * Find parent element that has 'jslet' property
 * 
 * @param {Html Element} element The start checking html element
 * @return {Html Element} Parent element or null
 */
jslet.ui.findJsletParent = function(element){
	return jslet.ui.findFirstParent(element, function(ele){
		return ele.jslet ? true:false; 
	})	
}

/**
* Globel function
*
jslet.ui.findParentInRange = function (startNode, endNode, condition) {
    var p = startNode;
    if (!p)
        return null;

    if (!condition)
        return p.parentNode;

    if (condition(p))
        return p;
    else {
        if (startNode && p == endNode)
            return null;

        return jslet.ui.findFirstParent(p.parentNode, endNode, condition)
    }
}
*/

/**
* Text Measurer, measure the display width or height of the given text. Example:
* <pre><code>
*   jslet.ui.textMeasurer.setElement(document.body);
*   try{
        var width = jslet.ui.textMeasurer.getWidth('HellowWorld');
		var height = jslet.ui.textMeasurer.getHeight('HellowWorld');
	}finally{
		jslet.ui.textMeasurer.setElement();
	}
* </code></pre>
* 
*/
jslet.ui.TextMeasurer = function () {
    var rule,felement = document.body,felementWidth;

    var lastText = null;
    
    var createRule = function () {
        if (!rule) {
            rule = document.createElement('div');
            document.body.appendChild(rule);
            rule.style.position = 'absolute';
            rule.style.left = '-9999px';
            rule.style.top = '-9999px';
            rule.style.display = 'none';
            rule.style.margin = '0px';
            rule.style.padding = '0px';
            rule.style.overflow = 'hidden'
        }
        if (!felement)
            felement = document.body
    }

    /**
     * Set html element which to be used as rule. 
     * 
     * @param {Html Element} element 
     */
    this.setElement = function (element) {
        felement = element;
        if (!felement)
            return;
        createRule();
        rule.style.fontSize = felement.style.fontSize;
        rule.style.fontStyle = felement.style.fontStyle;
        rule.style.fontWeight = felement.style.fontWeight;
        rule.style.fontFamily = felement.style.fontFamily;
        rule.style.lineHeight = felement.style.lineHeight;
        rule.style.textTransform = felement.style.textTransform;
        rule.style.letterSpacing = felement.style.letterSpacing
    }

    this.setElementWidth = function (width) {
        felementWidth = width;
        if (!felement)
            return;

        if (width)
            felement.style.width = width;
        else
            felement.style.width = ''
    }

    function updateText(text){
    	if(lastText != text)
    		rule.innerHTML = text;
    }
    
    /**
     * Get the display size of specified text
     * 
     * @param {String} text The text to be measured
     * 
     * @return {Integer} Display size, unit: px
     */
    this.getSize = function (text) {
        createRule();
        updateText(text);
        var ruleObj = jQuery(rule);
        return {width:ruleObj.width(),height:ruleObj.height()};
    }

    /**
     * Get the display width of specified text
     * 
     * @param {String} text The text to be measured
     * 
     * @return {Integer} Display width, unit: px
     */
    this.getWidth = function (text) {
        return this.getSize(text).width
    }

    /**
     * Get the display height of specified text
     * 
     * @param {String} text The text to be measured
     * 
     * @return {Integer} Display height, unit: px
     */
    this.getHeight = function (text) {
        return this.getSize(text).height
    }
}

jslet.ui.textMeasurer = new jslet.ui.TextMeasurer();

/**
* Show error message.
*  
* @param e - error object or error message
*/
jslet.showException = function (e) {
    var msg;
    if (typeof (e) == 'string')
        msg = e;
    else
        msg = e.message;

    if (jslet.ui.MessageBox)
        jslet.ui.MessageBox.error(msg);
    else
        alert(msg)
}

/**
* Show Info message.
* 
* @param e - error object or error message
*/
jslet.showInfo = function (e) {
    var msg;
    if (typeof (e) == 'string')
        msg = e;
    else
        msg = e.message;

    if (jslet.ui.MessageBox)
        jslet.ui.MessageBox.alert(msg);
    else
        alert(msg)
}

/**
* Global function:used in jslet.ui.DBTable
jslet.ui.hideAllChildren = function (parent, exceptChild) {
    if (!parent || parent.childNodes.length == 0)
        return;
    var node, nodes = parent.childNodes,
    len = parent.childNodes.length;
    for (var i = 0; i < len; i++) {
        node = nodes[i];
        if (!node.style)
            continue;
        if (node == exceptChild)
            exceptChild.style.display = 'block';
        else {
            node.style.display = 'none';
            node.style.left = '-10000px';
        }
    }//end for
}
*/

/**
 * Get css property value. Example:
 * <pre><code>
 * var width = jslet.ui.getCssValue('fooClass', 'width'); //Return value like '100px' or '200em'
 * </code></pre>
 * 
 * @param {String} className Css class name.
 * @param {String} styleName style name
 * 
 * @return {String} Css property value.
 */
jslet.ui.getCssValue = function(className, styleName){
	var odiv = document.createElement('div');
	odiv.className = className;
	odiv.style.display = 'none';
	document.body.appendChild(odiv);
	var result = jQuery(odiv).css(styleName);
	
	document.body.removeChild(odiv);
	return result
}

/**
 * Get system scroll bar width
 * 
 * @return {Integer} scroll bar width
 */
jslet.scrollbarSize = function() {
	  var parent, child, width, height;

	  if(width===undefined) {
	    parent = jQuery('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body');
	    child=parent.children();
	    width=child.innerWidth()-child.height(99).innerWidth();
	    parent.remove();
	  }

	 return width;
	};
	