/*
This file is part of Jslet framework

Copyright (c) 2013 Jslet Team

GNU General Public License(GPL 3.0) Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please visit: http://www.jslet.com/license.
*/

/**
 * @class Split Panel. Example:
 * <pre><code>
 * var jsletParam = {type:"SplitPanel",direction:"hori",floatIndex: 1};
 * //1. Declaring:
 *     &lt;div data-jslet='jsletParam' style="width: 300px; height: 400px;">
 *       &lt;div>content1&lt;/div>
 *       &lt;div>content2&lt;/div>
 *      &lt;/div>
 *      
 *  //2. Binding
 *  	&lt;div id='ctrlId'>
 *  		&lt;div>content1&lt;/div>
 *          &lt;div>content2&lt;/div>
 *  	&lt;/div>
 *  	//Js snippet
 * 		var el = document.getElementById('ctrlId');
 *  	jslet.ui.bindControl(el, jsletParam);
 *  		
 *  //3. Create dynamically
 *  	jslet.ui.createControl(jsletParam, document.body);
 *  	
 * </code></pre>
 */
jslet.ui.SplitPanel = jslet.Class.create(jslet.ui.Control, {
	/**
	 * @override
	 */
    initialize: function ($super, el, params) {
        var Z = this;
        Z.el = el;
        Z.allProperties = 'direction,floatIndex,onExpanded,onSize';//{size:100, align:-1/0/1,minSize:10}
        /**
         * {String} Split direction, optional value: hori, vert
         * Default value is 'hori'
         */
        Z.direction = 'hori';
        /**
         * {Integer} Float panel index, only one panel can be a floating panel
         */
        Z.floatIndex = 1;
        
        /**
         * {Event} Fired when user expand/collapse one panel.
         *  Pattern: 
         *    function(panelIndex){} 
         *    //panelIndex: Integer
         */
        Z.onExpanded = null;
        
        /**
         * {Event} Fired after user change size of one panel.
         *  Pattern: 
         *    function(panelIndex, newSize){} 
         *    //panelIndex: Integer
         *    //newSize: Integer
         */
        Z.onSize = null;
        
		Z.panels = null; //Array, panel configuration
        Z.splitter = null;
        $super(el, params)
    },

	/**
	 * @override
	 */
    bind: function () {
        this.renderAll()
    },

	/**
	 * @override
	 */
    renderAll: function () {
        var Z = this, jqEl = jQuery(Z.el);
        if (!jqEl.hasClass('jl-splitpanel'))
        	jqEl.addClass('jl-splitpanel jl-border-box');

        Z.isHori = (Z.direction == 'hori');
        
        if (!Z.width)
            Z.width = parseInt(Z.el.style.width); 
        if (!Z.height)
            Z.height = parseInt(Z.el.style.height);
        if (!Z.width)
            Z.width = 300;
        if (!Z.height)
            Z.height = 300;
        jqEl.width(Z.width);
        jqEl.height(Z.height);

        var panelDivs = jqEl.find('div'),
        	lastIndex = panelDivs.length - 1;
        if(!Z.floatIndex || Z.floatIndex > lastIndex)
        	Z.floatIndex = lastIndex;
		if(Z.floatIndex > lastIndex)
			Z.floatIndex = lastIndex;
			
		if(!Z.panels)
			Z.panels = [];
		var containerSize = Z.isHori ? Z.width : Z.height, sumSize = 0;

		panelDivs.each(function(k){
			var jqPanel = jQuery(panelDivs[k]),
				oPanel = Z.panels[k];
			if(!oPanel){
				oPanel = {}
				Z.panels[k] = oPanel;
			}

			var minSize = parseInt(jqPanel.css(Z.isHori ?'min-width': 'min-height'));
			oPanel.minSize = minSize ? minSize : 5;
			
			var maxSize = parseInt(jqPanel.css(Z.isHori ?'max-width': 'max-height'));
			oPanel.maxSize = maxSize ? maxSize : Infinity;
			oPanel.collapsed = jqPanel.css('display') == 'none';
			
			var size = oPanel.size;
			if(size == null || size == undefined)
				size = Z.isHori ? jqPanel.outerWidth(): jqPanel.outerHeight();
			else{
				if(Z.isHori)
					jqPanel.width(size);
				else
					jqPanel.height(size);
			}
				
			if(k != Z.floatIndex){
				sumSize += size;
				oPanel.size = size;
			}
		});
		Z.panels[Z.floatIndex].size = containerSize - sumSize;
		
        Z.splitterTracker = document.createElement('div');
        var jqTracker = jQuery(Z.splitterTracker);
        jqTracker.addClass('jl-sp-splitter-tracker');
        var fixedSize = 0,
			clsName = Z.isHori ? 'jl-sp-panel-hori': 'jl-sp-panel-vert';
    	Z.splitterClsName = Z.isHori ? 'jl-sp-splitter-hori': 'jl-sp-splitter-vert';
    	Z.el.appendChild(Z.splitterTracker);
    	if(Z.isHori)
    		Z.splitterTracker.style.height = '100%';
    	else
    		Z.splitterTracker.style.width = '100%';

        var splitterSize = parseInt(jslet.ui.getCssValue(Z.splitterClsName, Z.isHori? 'width' : 'height'));
        panelDivs.after(function(k){
        	var panel = panelDivs[k],
            jqPanel = jQuery(panel),
			collapsed = Z.panels[k].collapsed;
			
        	jqPanel.addClass(clsName);

        	if(k == Z.floatIndex)
        		Z.floatPanel = panel;
        	else{
				if(!collapsed)
	        		fixedSize += splitterSize + Z.panels[k].size;
				else{
					jqPanel.css('display', 'none');
					fixedSize += splitterSize;
				}
			}
            if(k == lastIndex){
            	if(Z.isHori)
            		return '<div style="clear:both;width:0px"></div>';
        		return '';
            }
       		var id = jslet.nextId(),  
				minBtnCls = Z.isHori ? 'jl-sp-button-left' : 'jl-sp-button-top';
				
			if(Z.floatIndex <= k || collapsed)
				minBtnCls += Z.isHori ? ' jl-sp-button-right' : ' jl-sp-button-bottom';
       		 
        	return '<div class="'+ Z.splitterClsName + ' jl-unselectable" id = "' + id + '" jsletindex="'+ (k >= Z.floatIndex ? k+1: k)+ '"><div class="jl-sp-button ' + minBtnCls +'"'
				+ (collapsed ? ' jsletcollapsed="1"':'') +'></div></div>'
        });
        if(Z.isHori)
        	jQuery(Z.floatPanel).width(jqEl.innerWidth() - fixedSize);
        else
        	jQuery(Z.floatPanel).height(jqEl.innerHeight() - fixedSize);
        
        var splitters = jqEl.find('.'+Z.splitterClsName);
        splitters.on('mousedown', Z._splitterMouseDown);
        var splitBtns = splitters.children();
        splitBtns.on('mousedown', function(event){
			var jqBtn = jQuery(event.target),
		    	jqSplitter = jqBtn.parent(),
		    	index = parseInt(jqSplitter.attr('jsletindex'));
			Z.expand(index);
			event.stopPropagation();
		});
		
        var oSplitter;
        for(var i = 0, cnt = splitters.length; i < cnt; i++){
        	oSplitter = splitters[i];
        	oSplitter._doDragStart = Z.splitterDragStart;
        	oSplitter._doDragging = Z.splitterDragging;
        	oSplitter._doDragEnd = Z.splitterDragEnd;
        	oSplitter._doDragCancel = Z.splitterDragCancel
        }
    },
    
    /**
     * Get float panel
     * 
     * @return {Html Element} 
     */
    floatPanel: function(){
    	return Z.panels[Z.floatIndex];	
    },
    
	changeSize: function(k, size){
		
	},
	
	/**
	 * Expand or collapse the specified panel
	 * 
	 * @param {Integer} index Panel index
	 * @param {Boolean} collapsed True for collapsed, false otherwise.
	 */
    expand: function(index, collapsed){
        var Z = this, jqPanel, jqEl = jQuery(Z.el),
        	splitters = jqEl.find('.'+Z.splitterClsName);
        if(index < 0 || index > splitters.length)
        	return;
        
        var	jqSplitter = jQuery(splitters[(index >= Z.floatIndex ? index - 1: index)]),
        	jqBtn = jqSplitter.find(':first-child');
        	
        if(collapsed === undefined)
        	collapsed  = !(jqBtn.attr('jsletcollapsed')=='1');
        
		if(index < Z.floatIndex)
			jqPanel = jqSplitter.prev();
		else
			jqPanel = jqSplitter.next();

		if(Z.isHori){
			if(jqBtn.hasClass('jl-sp-button-right'))
				jqBtn.removeClass('jl-sp-button-right');
			else
				jqBtn.addClass('jl-sp-button-right');
    	}else{
			if(jqBtn.hasClass('jl-sp-button-bottom'))
				jqBtn.removeClass('jl-sp-button-bottom');
			else
				jqBtn.addClass('jl-sp-button-bottom');
		}

		if(collapsed){
			jqPanel.css('display','none');
			jqBtn.attr('jsletcollapsed', '1');
		}else{
			jqPanel.css('display', 'block');
			jqBtn.attr('jsletcollapsed', '0');
		}
		var jqFp = jQuery(Z.floatPanel);
        if(Z.isHori)
        	jqFp.width(jqFp.width()+jqPanel.width()*(collapsed ? 1:-1));
        else
        	jqFp.height(jqFp.height()+jqPanel.height()*(collapsed ? 1:-1));
		Z.panels[index].collapsed = collapsed;
		if(Z.onExpanded){
			Z.onExpanded(panelIndex);
		}
    },
    
    /**
     * @private
     */
    _splitterMouseDown: function(event){
        var pos = jQuery(this).position(),
        	Z = this.parentNode.jslet;
        Z.splitterTracker.style.top = pos.top + 'px';
        Z.splitterTracker.style.left = pos.left + 'px';
        Z.draggingId = this.id;
        
        jslet.ui.dnd.bindControl(this)
    },
    	
    /**
     * @private
     */
    splitterDragStart: function (oldX, oldY, x, y, deltaX, deltaY){
    	var Z = this.parentNode.jslet,
    		jqTracker = jQuery(Z.splitterTracker),
			jqSplitter = jQuery('#'+Z.draggingId),
			index = parseInt(jqSplitter.attr('jsletindex')),
			cfg = Z.panels[index],
    		jqFp = jQuery(Z.floatPanel);
		
		Z.dragRangeMin = cfg.size - cfg.minSize;
		Z.dragRangeMax = cfg.maxSize - cfg.size;
		var fpMax = (Z.isHori ? jqFp.width() : jqFp.height()) - Z.panels[Z.floatIndex].minSize;
		if(Z.dragRangeMax > fpMax)
			Z.dragRangeMax = fpMax;
			
    	jqTracker.show()
    },
    
    /**
     * @private
     */
    splitterDragging: function (oldX, oldY, x, y, deltaX, deltaY){
    	var Z = this.parentNode.jslet,
			jqTracker = jQuery(Z.splitterTracker),
    		jqSplitter = jQuery('#'+Z.draggingId),
			index = parseInt(jqSplitter.attr('jsletindex')),
			delta = Math.abs(Z.isHori ? deltaX : deltaY),
			expanded;
			
		if(Z.isHori)
			expanded = index < Z.floatIndex && deltaX >= 0 || index > Z.floatIndex && deltaX < 0;
		else
			expanded = index < Z.floatIndex && deltaY >= 0 || index > Z.floatIndex && deltaY < 0;
		
		if(expanded && delta > Z.dragRangeMax){
			Z.endDelta = Z.dragRangeMax;
			return;
		}
		
		if(!expanded && delta > Z.dragRangeMin){
			Z.endDelta = Z.dragRangeMin;
			return;
		}
		
		Z.endDelta = Math.abs(Z.isHori ? deltaX : deltaY);
    	var pos = jqTracker.offset();
    	if(Z.isHori)
    		pos.left = x;
    	else
            pos.top = y;
    	jqTracker.offset(pos);
    },
    
    /**
     * @private
     */
    splitterDragEnd: function (oldX, oldY, x, y, deltaX, deltaY){
    	var Z = this.parentNode.jslet,
    		jqTracker = jQuery(Z.splitterTracker),
    		jqSplitter = jQuery('#'+Z.draggingId),
			index = parseInt(jqSplitter.attr('jsletindex')),
			jqPanel = index < Z.floatIndex ? jqSplitter.prev(): jqSplitter.next(),
			expanded,
	   		jqFp = jQuery(Z.floatPanel);

		if(Z.isHori)
			expanded = index < Z.floatIndex && deltaX >= 0 || index > Z.floatIndex && deltaX < 0;
		else
			expanded = index < Z.floatIndex && deltaY >= 0 || index > Z.floatIndex && deltaY < 0;

		var delta = Z.endDelta * (expanded ? 1: -1);
		var newSize = Z.panels[index].size + delta;
		Z.panels[index].size = newSize;
		
		if(Z.isHori){
			jqPanel.width(newSize);
			jqFp.width(jqFp.width() - delta);
		}else{
			jqPanel.height(newSize);
			jqFp.height(jqFp.height() - delta);
		}
		if(Z.onSize)
			Z.onSize(index, newSize);
    	jqTracker.hide()
    },
    
    /**
     * @private
     */
    splitterDragCancel: function (oldX, oldY, x, y, deltaX, deltaY){
    	var Z = this.parentNode.jslet,
    		jqTracker = jQuery(Z.splitterTracker);
    	jqTracker.hide();
    },
    
	/**
	 * @override
	 */
    destroy: function($super){
    	var Z = this;
    	Z.splitterTracker = null;
		Z.floatPanel = null;
        var splitters = jqEl.find('.'+Z.splitterClsName);
        splitters.off('mousedown', Z._splitterMouseDown);
        var item;
        for(var i = 0, cnt = splitters.length; i < cnt; i++){
        	item = splitters[i];
        	jslet.ui.dnd.unbindControl(item);
        	item._doDragStart = null;
        	item._doDragging = null;
        	item._doDragEnd = null;
        	item._doDragCancel = null
        }
    	$super();
    }
});

jslet.ui.register('SplitPanel', jslet.ui.SplitPanel);
jslet.ui.SplitPanel.htmlTemplate = '<div></div>';
