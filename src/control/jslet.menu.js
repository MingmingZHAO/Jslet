/*
This file is part of Jslet framework

Copyright (c) 2013 Jslet Team

GNU General Public License(GPL 3.0) Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please visit: http://www.jslet.com/license.
*/

/**
* Menu Manager
*/
jslet.ui.menuManager = {};
/**
 * Global menu id collection, array of string
 */
jslet.ui.menuManager._menus = [];

/**
 * Register menu id
 * 
 * @param {String} menuid Menu control id
 */
jslet.ui.menuManager.register = function (menuid) {
    jslet.ui.menuManager._menus.push(menuid)
}

/**
 * Unregister menu id
 * 
 * @param {String} menuid Menu control id
 */
jslet.ui.menuManager.unregister = function (menuid) {
    for (var i = 0, len = this._menus.length; i < len; i++)
        jslet.ui.menuManager._menus.splice(i, 1)
}

/**
 * Hide all menu item.
 */
jslet.ui.menuManager.hideAll = function (event) {
    var id, menu, menus = jslet.ui.menuManager._menus;
    for (var i = 0, len = menus.length; i < len; i++) {
        id = menus[i];
        menu = jQuery('#'+id)[0];
        if (menu)
            menu.jslet.hide()
    }
    jslet.ui.menuManager.menuBarShown = false;
    jslet.ui.menuManager._contextObject = null;
}

jQuery(document).on('mousedown', jslet.ui.menuManager.hideAll);

/**
 * @class Calendar. Example:
 * <pre><code>
 *  var jsletParam = { type: 'MenuBar', onItemClick: globalMenuItemClick, items: [
 *		{ name: 'File', items: [
 *		   { id: 'new', name: 'New Tab', iconCls: 'icon1' }]
 *		}]};
 *
 *  //1. Declaring:
 *     &lt;div data-jslet='jsletParam' />
 *      
 *  //2. Binding
 *  	&lt;div id='ctrlId' />
 *  	//js snippet:
 * 		var el = document.getElementById('ctrlId');
 * 		jslet.ui.bindControl(el, jsletParam);
 *  		
 *  //3. Create dynamically
 *  	jslet.ui.createControl(jsletParam, document.body);
 *  	
 * </code></pre>
 */
jslet.ui.MenuBar = jslet.Class.create(jslet.ui.Control, {
	/**
	 * @override
	 */
    initialize: function ($super, el, params) {
        var Z = this;
        Z.el = el;
        Z.allProperties = 'onItemClick,items';
        /**
         * {Event} MenuItem click event handler
         * Pattern: function(menuId){}
         *   //menuId: String
         */
        Z.onItemClick;
        
        /**
         * {Array}Menu items configuration
         * menu item's properties: 
         * id, //{String} Menu id
         * name, //{String} Menu name 
         * onclick, //{Event} Item click event, 
         *   Pattern: function(event){}
         *   
         * disabled, //{Boolean} Menu item is disabled or not
         * iconcls,  //{String} Icon style class 
         * disabledIconcls, //{String} Icon disabled style class
         * itemType, //{String} Menu item type, optional value: null, radio, check
         * checked, //{Boolean} Menu item is checked or not,  only work when itemType equals 'radio' or 'check'
         * group, //{String} Group name, only work when itemType equals 'radio'
         * items, //{Array} Sub menu items
         */
        Z.items;
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
        var Z = this;
        var jqEl = jQuery(Z.el);
        if (!jqEl.hasClass('jl-menubar'))
        	jqEl.addClass('jl-menubar jl-unselectable');

        Z._createMenuBar();
        jqEl.on('mouseout',function (event) {
            if (Z._preHoverItem && !jslet.ui.menuManager.menuBarShown)
                jQuery(Z._preHoverItem).removeClass('jl-menubar-item-hover')
        });
    },

    _createMenuBar: function () {
        var Z = this;
        if (Z.isPopup)
            return;

        for (var i = 0, cnt = Z.items.length, item; i < cnt; i++) {
            item = Z.items[i];
            Z._createBarItem(Z.el, item, Z._menubarclick)
        }
    },

    _showSubMenu: function (omi) {
        var Z = omi.parentNode.jslet;

        var itemCfg = omi.jsletvar;
        if (!itemCfg.items)
            return;
        if (!itemCfg.subMenu) {
            var el = document.createElement('div');
            document.body.appendChild(el);
            itemCfg.subMenu = new jslet.ui.Menu(el, { onItemClick: Z.onItemClick, items: itemCfg.items })
        }
		var jqBody = jQuery(document.body),
			bodyMTop = parseInt(jqBody.css('margin-top')),
			bodyMleft = parseInt(jqBody.css('margin-left'));

        var jqMi = jQuery(omi), pos = jqMi.offset(), posX = pos.left;
        if(jslet.locale.isRtl)
        	posX +=  jqMi.width() + 10;
        
        itemCfg.subMenu.show(posX, pos.top + jqMi.height());
        jslet.ui.menuManager.menuBarShown = true;
        Z._activeMenuItem = omi
        // this.parentNode.parentNode.jslet.ui._createMenuPopup(cfg);
    },

    _createBarItem: function (obar, itemCfg) {
        if (itemCfg.visible != undefined && !itemCfg.visible)
            return;
        var omi = document.createElement('div');
        jQuery(omi).addClass('jl-menubar-item');
        omi.jsletvar = itemCfg;
        var Z = this;
        if (!itemCfg.items)
            omi.onclick = function (event) {

                var cfg = this.jsletvar;
                if (cfg.onclick)
                    cfg.onclick(cfg.id || cfg.name);
                else {
                    if (Z.onItemClick)
                        Z.onItemClick(cfg.id || cfg.name);
                }
                jslet.ui.menuManager.hideAll()
            }
        else {
            omi.onclick = function (event) {
                jslet.ui.menuManager.hideAll();
                //                if (Z._activeMenuItem != this || jslet.ui.menuManager.menuBarShown)
                Z._showSubMenu(this)
            }
        }

        omi.onmouseover = function () {
            if (Z._preHoverItem)
                jQuery(Z._preHoverItem).removeClass('jl-menubar-item-hover');
            Z._preHoverItem = this;
            jQuery(this).addClass('jl-menubar-item-hover');
            if (jslet.ui.menuManager.menuBarShown) {
                jslet.ui.menuManager.hideAll();
                Z._showSubMenu(this);
                jslet.ui.menuManager._inPopupMenu = true
            }
        }
        
        var template = []
/*        template.push('<span>');
        template.push(itemCfg.name);
        template.push('</span>');
		*/
		
        template.push('<a class="jl-focusable-item" href="#">');
        template.push(itemCfg.name);
        template.push('</a>');
		
        omi.innerHTML = template.join('');
        obar.appendChild(omi)
    },
    
	/**
	 * @override
	 */
    destroy: function($super){
    	var Z = this;
    	Z._activeMenuItem = null;
    	Z._preHoverItem = null;
    	Z._menubarclick = null;
    	Z.onItemClick = null;
        var jqEl = jQuery(Z.el);
        jqEl.off();
        jqEl.find('.jl-menubar-item').each(function(){
        	var omi = this;
        	omi.onmouseover = null;
        	omi.onclick = null;
        	if(omi.jsletvar){
        		omi.jsletvar.subMenu = null;
        		omi.jsletvar = null;
        	}
        });
    	$super();
    }
});
jslet.ui.register('MenuBar', jslet.ui.MenuBar);
jslet.ui.MenuBar.htmlTemplate = '<div></div>';

/**
 * @class Calendar. Example:
 * <pre><code>
 *  var jsletParam = { type: 'Menu', onItemClick: globalMenuItemClick, items: [
 *       { id: 'back', name: 'Backward', iconCls: 'icon1' },
 *       { id: 'go', name: 'Forward', disabled: true },
 *       { name: '-' }]};
 *
 *  //1. Declaring:
 *     &lt;div data-jslet='jsletParam' />
 *      
 *  //2. Binding
 *  	&lt;div id='menu1' />
 *  	//js snippet:
 * 		var el = document.getElementById('menu1');
 * 		jslet.ui.bindControl(el, jsletParam);
 *  		
 *  //3. Create dynamically
 *  	jslet.ui.createControl(jsletParam, document.body);
 *  	
 * </code></pre>
 */
/***
* Popup Menu
*/
jslet.ui.Menu = jslet.Class.create(jslet.ui.Control, {
	/**
	 * @override
	 */
    initialize: function ($super, el, params) {
        var Z = this;
        Z.el = el;
        Z.allProperties = 'onItemClick,items,invoker'; //'invoker' is used for inner
        //items is an array, menu item's properties: id, name, onclick,disabled,iconcls,disabledIconcls,itemType,checked,group,items
        $super(el, params);
        Z._activeSubMenu = null
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
        var Z = this;
        var jqEl = jQuery(Z.el);
        var ele = Z.el;
        if (!jqEl.hasClass('jl-menu'))
        	jqEl.addClass('jl-menu');
        ele.style.display = 'none';

        if (!ele.id)
            ele.id = jslet.nextId();

        jslet.ui.menuManager.register(ele.id);
        Z._createMenuPopup();
        jqEl.on('mousedown',function (event) {
    		event = jQuery.event.fix( event || window.event );
            event.stopPropagation();
            return false
        });

        jqEl.on('mouseover', function () {
            jslet.ui.menuManager._inPopupMenu = true;
            if (jslet.ui.menuManager.timerId)
                window.clearTimeout(jslet.ui.menuManager.timerId)
        });

        jqEl.on('mouseout', function () {
            jslet.ui.menuManager._inPopupMenu = false;
            jslet.ui.menuManager.timerId = window.setTimeout(function () {
                if (!jslet.ui.menuManager._inPopupMenu)
                    jslet.ui.menuManager.hideAll();

                jslet.ui.menuManager.timerId = null
            }, 800)
        });
    },

    /**
     * Show menu item.
     * 
     * @param {Integer} left Postion left
     * @param {Integer} top Postion top
     */
    show: function (left, top) {
    	var Z = this, jqEl = jQuery(Z.el);
        left = left || Z.left || 10;
        top = top || Z.top || 10;
        if(jslet.locale.isRtl)
        	left -= jqEl.width();
       	Z.el.style.left = left + 'px';
        Z.el.style.top = parseInt(top) + 'px';
        Z.el.style.display = 'block';
        if (!Z.shadow) {
            Z.shadow = document.createElement('div');
            jQuery(Z.shadow).addClass('jl-menu-shadow');
            Z.shadow.style.width = jqEl.width() + 'px';
            Z.shadow.style.height = jqEl.height() + 'px';
            document.body.appendChild(Z.shadow)
        }
    	Z.shadow.style.left = left + 1 + 'px';
        Z.shadow.style.top = top + 1 + 'px';
        Z.shadow.style.display = 'block'
    },

    /**
     * Hide menu item and all its sub menu item.
     */
    hide: function () {
        this.ctxElement = null;
        this.el.style.display = 'none';
        if (this.shadow)
            this.shadow.style.display = 'none'
    },

    /**
     * Show menu on context menu. Example:
     * <pre><code>
     *  <div id="popmenu" oncontextmenu="popMenu(event);">
 	 *
	 *	function popMenu(event) {
     *     jslet("#popmenu").showContextMenu(event);
     *  }
     * </code></pre>
     */
    showContextMenu: function (event, contextObj) {
        jslet.ui.menuManager.hideAll();

		event = jQuery.event.fix( event || window.event );
        jslet.ui.menuManager._contextObject = contextObj;
        this.show(event.pageX, event.pageY);
        event.preventDefault();
    },

    _createMenuPopup: function () {
        var panel = this.el;
        var items = this.items, itemCfg, name;
        for (var i = 0, cnt = items.length; i < cnt; i++) {
            itemCfg = items[i];
            if (!itemCfg.name)
                continue;
            name = itemCfg.name.trim();
            if (name != '-')
                this._createMenuItem(panel, itemCfg);
            else
                this._createLine(panel, itemCfg)
        }

        var p1 = jQuery(panel);
        var w = p1.width() - 2 + 'px';
        var arrMi = panel.childNodes;
        for (var i = 0, cnt = arrMi.length, node; i < cnt; i++) {
            node = arrMi[i];
            if (node.nodeType == 1)
                node.style.width = w
        }
        document.body.appendChild(panel)
    },

    _ItemClick: function (sender, cfg) {
        //has sub menu items
        if (cfg.items) {
            this._showSubMenu(sender, cfg);
            return
        }
        if (cfg.disabled)
            return;

        if (cfg.onclick)
            cfg.onclick(cfg.id || cfg.name, cfg.checked, jslet.ui.menuManager._contextObject);
        else {
            if (this.onItemClick)
                this.onItemClick(cfg.id || cfg.name, cfg.checked, jslet.ui.menuManager._contextObject)
        }
        if (cfg.itemType == 'check' || cfg.itemType == 'radio')
            jslet.ui.Menu.setChecked(sender, !cfg.checked);

        jslet.ui.menuManager.hideAll()
    },

    _hideSubMenu: function () {
        var Z = this;
        if (Z._activeSubMenu) {
            Z._activeSubMenu._hideSubMenu();
            Z._activeSubMenu.hide();
            Z._activeSubMenu.el.style.zIndex = parseInt(jQuery(Z.el).css('zIndex'))
        }
    },

    _showSubMenu: function (sender, cfg, delayTime) {
        var Z = this;
        var func = function () {
            Z._hideSubMenu();
            if (!cfg.subMenu)
                return;

            var jqPmi = jQuery(sender),
            	pos = jqPmi.offset(), x = pos.left;
            if(!jslet.locale.isRtl)
            	x += jqPmi.width();
            //else
            //	x -= jqPmi.width();
            
            cfg.subMenu.show(x - 2, pos.top);
            cfg.subMenu.el.style.zIndex = parseInt(jQuery(Z.el).css('zIndex')) + 1;
            Z._activeSubMenu = cfg.subMenu
        }
        if (delayTime)
            window.setTimeout(func, delayTime);
        else
            func()
    },

    _ItemOver: function (sender, cfg) {
        if (this._activeSubMenu)
            this._showSubMenu(sender, cfg, 200)
    },

    _createMenuItem: function (container, itemCfg, defaultClickHandler) {
        //id, name, onclick,disabled,iconcls,disabledIconcls,itemType,checked,group,items,subMenuId
        var isCheckBox = false, isRadioBox = false;
        var itemType = itemCfg.itemType;
        if (itemType) {
            isCheckBox = (itemType == 'check');
            isRadioBox = (itemType == 'radio')
        }
        if (isCheckBox) {
            itemCfg.iconCls = 'jl-menu-check';
            itemCfg.disabledIconCls = 'jl-menu-check-disabled'
        }
        if (isRadioBox) {
            itemCfg.iconCls = 'jl-menu-radio';
            itemCfg.disabledIconCls = 'jl-menu-radio-disabled'
        }
        if (itemCfg.items)
            itemCfg.disabled = false;
        var mi = document.createElement('div');
        jQuery(mi).addClass('jl-menu-item ' + (itemCfg.disabled ? 'jl-menu-disabled' : 'jl-menu-enabled'));

        if (!itemCfg.id)
            itemCfg.id = jslet.nextId();
        mi.id = itemCfg.id;
        mi.jsletvar = itemCfg;
        var Z = this;
        mi.onclick = function () {
            Z._ItemClick(this, this.jsletvar)
        }

        mi.onmouseover = function () {
            Z._ItemOver(this, this.jsletvar);
            if (Z._preHoverItem)
                jQuery(Z._preHoverItem).removeClass('jl-menu-item-hover');
            Z._preHoverItem = this;
            if (!this.jsletvar.disabled)
                jQuery(this).addClass('jl-menu-item-hover')
        }

        mi.onmouseout = function () {
            if (!this.jsletvar.subMenu)
                jQuery(this).removeClass('jl-menu-item-hover')
        }

        var template = [];
        //template.push('<a href="javascript:;" onclick="javascript:this.blur();" class="');
        //template.push(itemCfg.disabled ? 'jl-menu-disabled' : 'jl-menu-enabled');
        //template.push('">');
        template.push('<div class="jl-menu-icon-placeholder ');
        if ((isCheckBox || isRadioBox) && !itemCfg.checked)
            ;
        else
            if (itemCfg.iconCls)
                template.push((!itemCfg.disabled || !itemCfg.disabledIconCls) ? itemCfg.iconCls : itemCfg.disabledIconCls);
        template.push('"></div>');

        if (itemCfg.items)
            template.push('<div class="jl-menu-arrow"></div>');

        template.push('<a  href="#" class="jl-focusable-item jl-menu-content ');
        template.push(' jl-menu-content-left jl-menu-content-right');
        template.push('">');
        template.push(itemCfg.name);
        template.push('</a>');
        mi.innerHTML = template.join('');
        container.appendChild(mi);
        if (itemCfg.items) {
            var el = document.createElement('div');
            document.body.appendChild(el);
            itemCfg.subMenu = new jslet.ui.Menu(el, { onItemClick: Z.onItemClick, items: itemCfg.items, invoker: mi })
        }
    },

    _createLine: function (container, itemCfg) {
        var odiv = document.createElement('div');
        jQuery(odiv).addClass('jl-menu-line');
        container.appendChild(odiv)
    },
    
	/**
	 * @override
	 */
    destroy: function($super){
    	var Z = this, jqEl = jQuery(Z.el);
    	Z._activeSubMenu = null;
    	jqEl.off();
    	jqEl.find('.jl-menu-item').each(function(){
    		this.onmouseover = null;
    		this.onclick = null;
    		this.onmouseout = null;
    	});
    	
    	$super();
    }
});

jslet.ui.register('Menu', jslet.ui.Menu);
jslet.ui.Menu.htmlTemplate = '<div></div>';

jslet.ui.Menu.setDisabled = function (menuId, disabled) {
    var jqMi;
    if (Object.isString(menuId))
    	jqMi = jQuery('#'+menuId);
    else
    	jqMi = jQuery(menuId);
    var cfg = jqMi.context.jsletvar;
    if (cfg.items)
        return;
    if (disabled) {
    	jqMi.removeClass('jl-menu-enabled');
    	jqMi.addClass('jl-menu-disabled')
    } else {
    	jqMi.removeClass('jl-menu-disabled');
    	jqMi.addClass('jl-menu-enabled')
    }
    cfg.disabled = disabled
}

jslet.ui.Menu.setChecked = function (menuId, checked) {
    var jqMi;
    if (typeof(menuId)==='string')
    	jqMi = jQuery('#' + menuId);
    else
    	jqMi = jQuery(menuId);
    var mi = jqMi.context;
    var cfg = mi.jsletvar;
    var itemType = cfg.itemType;
    if (itemType != 'check' && itemType != 'radio')
        return;

    if (itemType == 'radio') {
        if (cfg.checked && checked || !checked)
            return;
        var group = mi.group;
        //uncheck all radio button in the same group
        var allMi = mi.parentNode.childNodes;

        for (var i = 0, node, cfg1, icon, cnt = allMi.length; i < cnt; i++) {
            node = allMi[i];
            if (node == mi)
                continue;
            cfg1 = node.jsletvar;
            if (cfg1 && cfg1.itemType == 'radio' && cfg1.group == group) {
                icon = node.childNodes[0];
                if (cfg1.disabled)
                    jQuery(icon).removeClass(cfg1.disabledIconCls)
                else
                    jQuery(icon).removeClass(cfg1.iconCls);
                cfg1.checked = false
            }
        }
    }

    var jqIcon = jQuery(mi.childNodes[0]);

    if (cfg.checked && !checked) {
        if (cfg.disabled)
        	jqIcon.removeClass(cfg.disabledIconCls)
        else
        	jqIcon.removeClass(cfg.iconCls)
    }
    if (!cfg.checked && checked) {
        if (cfg.disabled)
        	jqIcon.addClass(cfg.disabledIconCls)
        else
        	jqIcon.addClass(cfg.iconCls)
    }
    cfg.checked = checked
}
