/*
This file is part of Jslet framework

Copyright (c) 2013 Jslet Team

GNU General Public License(GPL 3.0) Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please visit: http://www.jslet.com/license.
*/

/**
 * Jslet Loader
 */
if (window.jslet === undefined || jslet === undefined)
    jslet=window.jslet = function(id){
    	var ele = jQuery(id)[0];
    	return (ele && ele.jslet)?ele.jslet:null;
    };

/////////////////////////////////////////////////////////////
//jslet module configuration 
/////////////////////////////////////////////////////////////

//jslet._initialModules = [
////css
//     {name: 'jslet-style', src: 'resources/{theme}/jslet-all.css', calcBaseUri: true },
////message for i18n
//    { name: 'locale', src: 'locale/{lang}/locale.js', calcBaseUri: true },
////lib
//	{name: 'jquery', src: 'lib/jquery-1.7.min.js', calcBaseUri: true },
//	{name: 'jsonlib', src: 'lib/jquery.json-2.3.js', calcBaseUri: true },
////jslet
//  {name: 'jslet', src: 'jslet-min.js', deps: 'locale,jquery,jsonlib,jslet-style', calcBaseUri: true },
// ];

jslet._initialModules = [
//css
     { name: 'jslet-style', src: 'resources/{theme}/jslet-style.css', calcBaseUri: true },
     { name: 'jslet-container', src: 'resources/{theme}/jslet-container.css', calcBaseUri: true },
     { name: 'jslet-calendar', src: 'resources/{theme}/jslet-calendar.css', calcBaseUri: true },
     { name: 'jslet-window', src: 'resources/{theme}/jslet-window.css', calcBaseUri: true },
     { name: 'jslet-menu', src: 'resources/{theme}/jslet-menu.css', calcBaseUri: true },
     { name: 'jslet-treeview', src: 'resources/{theme}/jslet-treeview.css', calcBaseUri: true },
     { name: 'jslet-table', src: 'resources/{theme}/jslet-table.css', calcBaseUri: true },
   //js-lib
     {name: 'jquery', src: 'lib/jquery-1.8.3.min.js', calcBaseUri: true },
     {name: 'jsonlib', src: 'lib/jquery.json-2.3.js', calcBaseUri: true },

   //Core
     { name: 'base', src: 'core/jslet.base.js', deps: 'jquery', calcBaseUri: true },
     { name: 'class', src: 'core/jslet.class.js', deps: 'base', calcBaseUri: true },
     { name: 'cookie', src: 'core/jslet.cookie.js', deps: 'jquery', calcBaseUri: true },
     { name: 'control', src: 'core/jslet.control.js', deps: 'class', calcBaseUri: true },
     { name: 'dnd', src: 'core/jslet.dnd.js', deps: 'base', calcBaseUri: true },
     { name: 'editmask', src: 'core/jslet.editmask.js', deps: 'base', calcBaseUri: true },
     { name: 'uibase', src: 'core/jslet.uibase.js', deps: 'control,jslet-style', calcBaseUri: true },
     
     { name: 'core', deps: 'base,class,cookie,control,dnd,editmask,uibase,locale', calcBaseUri: true },
     
//message for i18n
    { name: 'locale', src: 'locale/{lang}/locale.js', deps: 'base', calcBaseUri: true },

//data
    { name: 'provider', src: 'data/jslet.provider.js', deps: 'core,jsonlib', calcBaseUri: true },
    { name: 'dataset', src: 'data/jslet.dataset.js', deps: 'core', calcBaseUri: true },
    { name: 'field', src: 'data/jslet.field.js', deps: 'core', calcBaseUri: true },
    { name: 'contextrule', src: 'data/jslet.contextrule.js', deps: 'core', calcBaseUri: true },
    
    { name: 'data', deps: 'provider,dataset,field,contextrule', calcBaseUri: true },
//control
    { name: 'overlaypanel', src: 'control/jslet.overlaypanel.js', deps: 'core', calcBaseUri: true },
    { name: 'waitingbox', src: 'control/jslet.waitingbox.js', deps: 'core,jslet-container,jslet-calendar', calcBaseUri: true },
    { name: 'calendar', src: 'control/jslet.calendar.js', deps: 'core,jslet-calendar', calcBaseUri: true },
    { name: 'fieldset', src: 'control/jslet.fieldset.js', deps: 'core', calcBaseUri: true },
    { name: 'tippanel', src: 'control/jslet.tippanel.js', deps: 'core', calcBaseUri: true },
    { name: 'window', src: 'control/jslet.window.js', deps: 'core,jslet-window', calcBaseUri: true },
    { name: 'accordion', src: 'control/jslet.accordion.js', deps: 'core,jslet-container', calcBaseUri: true },
    { name: 'tabcontrol', src: 'control/jslet.tabcontrol.js', deps: 'core,jslet-container', calcBaseUri: true },
    { name: 'splitpanel', src: 'control/jslet.splitpanel.js', deps: 'core,jslet-container', calcBaseUri: true },
    { name: 'menu', src: 'control/jslet.menu.js', deps: 'core,jslet-menu', calcBaseUri: true },
    
    { name: 'uicontrols', deps: 'overlaypanel,waitingbox,calendar,fieldset,tippanel,window,accordion,tabcontrol,splitpanel,menu', calcBaseUri: true },
//dbcontrol    
    { name: 'dbautocomplete', src: 'dbcontrol/form/jslet.dbautocomplete.js', deps: 'dbtable', calcBaseUri: true },
    { name: 'dbbetweenedit', src: 'dbcontrol/form/jslet.dbbetweenedit.js', deps: 'data', calcBaseUri: true },
    { name: 'dbcheckbox', src: 'dbcontrol/form/jslet.dbcheckbox.js', deps: 'data', calcBaseUri: true },
    { name: 'dbcustomcombobox', src: 'dbcontrol/form/jslet.dbcustomcombobox.js', deps: 'data', calcBaseUri: true },
    { name: 'dbcomboselect', src: 'dbcontrol/form/jslet.dbcomboselect.js', deps: 'dbcustomcombobox,dbtable,dbtreeview', calcBaseUri: true },
    { name: 'dbdatepicker', src: 'dbcontrol/form/jslet.dbdatepicker.js', deps: 'dbcustomcombobox,calendar', calcBaseUri: true },
    { name: 'dbdatalabel', src: 'dbcontrol/form/jslet.dbdatalabel.js', deps: 'data', calcBaseUri: true },
    { name: 'dbhtml', src: 'dbcontrol/form/jslet.dbhtml.js', deps: 'data', calcBaseUri: true },
    { name: 'dbimage', src: 'dbcontrol/form/jslet.dbimage.js', deps: 'data', calcBaseUri: true },
    { name: 'dblabel', src: 'dbcontrol/form/jslet.dblabel.js', deps: 'data', calcBaseUri: true },
    { name: 'dblookuplabel', src: 'dbcontrol/form/jslet.dblookuplabel.js', deps: 'data', calcBaseUri: true },
    { name: 'dbcheckboxgroup', src: 'dbcontrol/form/jslet.dbcheckboxgroup.js', deps: 'data', calcBaseUri: true },
    { name: 'dbradiogroup', src: 'dbcontrol/form/jslet.dbradiogroup.js', deps: 'data', calcBaseUri: true },
    { name: 'dbrangeselect', src: 'dbcontrol/form/jslet.dbrangeselect.js', deps: 'data', calcBaseUri: true },
    { name: 'dbrating', src: 'dbcontrol/form/jslet.dbrating.js', deps: 'data', calcBaseUri: true },
    { name: 'dbselect', src: 'dbcontrol/form/jslet.dbselect.js', deps: 'data', calcBaseUri: true },
    { name: 'dbspinedit', src: 'dbcontrol/form/jslet.dbspinedit.js', deps: 'dbtext', calcBaseUri: true },
    { name: 'dbtext', src: 'dbcontrol/form/jslet.dbtext.js', deps: 'data', calcBaseUri: true },
    
    { name: 'formcontrols', deps: 'dbautocomplete,dbbetweenedit,dbcheckbox,dbcheckboxgroup,dbcomboselect,dbdatepicker,dbdatalabel,dbhtml,dbimage,dblabel,dblookuplabel,dbradiogroup,dbrangeselect,dbrating,dbselect,dbspinedit,dbtext', calcBaseUri: true },
    
    { name: 'listviewmodel', src: 'dbcontrol/jslet.listviewmodel.js', deps: 'data', calcBaseUri: true },
    { name: 'dbtable', src: 'dbcontrol/jslet.dbtable.js', deps: 'jslet-table,listviewmodel', calcBaseUri: true },
    { name: 'dbinspector', src: 'dbcontrol/jslet.dbinspector.js', deps: 'data', calcBaseUri: true },
    { name: 'dbtreeview', src: 'dbcontrol/jslet.dbtreeview.js', deps: 'jslet-treeview,listviewmodel', calcBaseUri: true },
    { name: 'dbeditpanel', src: 'dbcontrol/jslet.dbeditpanel.js', deps: 'data', calcBaseUri: true },
    { name: 'dbpagebar', src: 'dbcontrol/jslet.dbpagebar.js', deps: 'data', calcBaseUri: true },
    { name: 'swfobject', src: 'lib/swfobject.js', calcBaseUri: true },
    { name: 'dbchart', src: 'dbcontrol/jslet.dbchart.js', deps: 'data,swfobject', calcBaseUri: true },

    { name: 'dbcontrols', deps: 'formcontrols,dbtable,dbtreeview,dbeditpanel,dbinspector,dbpagebar,dbchart', calcBaseUri: true },
    
    { name: 'jslet', deps: 'core,uicontrols,data,dbcontrols', calcBaseUri: true }
];
/////////////////////////////////////////////////////////////////
//End jslet module configuration 
/////////////////////////////////////////////////////////////////

//default theme and lang,used for css and message text
jslet._theme = 'default';
jslet._lang = 'zh-cn';


if (!jslet.rootUri) {
    var ohead = document.getElementsByTagName('head')[0], uri = ohead.lastChild.src;
    uri = uri.substring(0, uri
					.lastIndexOf('/')
					+ 1);
    jslet.rootUri = uri;
}

if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+/, '').replace(/\s+$/, '');
    }
}

jslet.ModuleManager = function () {
    var _modules = [];

    var _sortfunc = function (mod1, mod2) {
        return mod1.level - mod2.level;
    }

    var _checkModule = function (omod) {
        var src = omod.src;
        if (src) {
            omod.isCss = src.slice(-4).toLowerCase() == '.css';
            omod.isTheme = (src.indexOf('{theme}') >= 0);
            omod.isI18n = (src.indexOf('{lang}') >= 0);
        }
    };


    this.define = function (name, src, deps, calcBaseUri) {
        var omod;
        if (name && Object.prototype.toString.apply(name) === '[object Array]') {
            var initialModules = name, len = initialModules.length;
            for (var i = 0; i < len; i++) {
                omod = initialModules[i];
                _checkModule(omod);
                _modules[_modules.length] = omod;
            }
        }
        else {
            omod = { 'name': name.toLowerCase().trim(), 'deps': deps, 'src': src.trim(), 'calcBaseUri': calcBaseUri ? true : false };
            _checkModule(omod);
            _modules[_modules.length] = omod;
        }
    }

    this.require = function (moduleNames, callbackFn) {
        if (typeof (moduleNames) == 'string')
            moduleNames = moduleNames.split(',');
        jslet.ModuleManager._runingCount = 0;
        var uniqueModules = [];
        this._getModuleWithChild(moduleNames, uniqueModules, 0);
        uniqueModules.sort(_sortfunc);

        this._loadCss(uniqueModules);

        this._loadScripts(uniqueModules, -99, callbackFn, jslet._lang);
    }

    var self = this;

    this._loadScripts = function (uniqueModules, level, complete, currLang) {
        var len = uniqueModules.length - 1, module, loadingModules = [];
        for (var i = len; i >= 0; i--) {
            module = uniqueModules[i];
            if (module.isCss)
                continue;
            if (level == -99)
                level = module.level;

            if (level < module.level)
                continue;

            if (level > module.level)
                break;
            var src = module.src;
            if (src) {
                if (module.isI18n)
                    src = src.replace(/{lang}/g, currLang);
                loadingModules.push(module.calcBaseUri ? jslet.rootUri + src : src);
            }
        }

        if (loadingModules.length == 0) {
            level--;
            if (level >= 0)
                self._loadScripts(uniqueModules, level, complete);
            else {
                if (complete) {
                    complete();
                }
                jslet.ui.install();
            }
        } else {
            //            window.ensure({ 'js': loadingModules }, function () {
            //                level--;
            //                if (level >= 0)
            //                    _loadScripts(uniqueModules, level, complete);
            //                else
            //                    if (complete)
            //                        complete();
            //            });

            this._innerloadjs(loadingModules, function () {
                level--;
                if (level >= 0)
                    self._loadScripts(uniqueModules, level, complete, currLang);
                else {
                    if (complete) {
                        complete();
                    }
                    jslet.ui.install();
                }
            })
        }
    }
    this.getHead = function () {
        return document.getElementsByTagName('head')[0] || document.documentElement;
    }

    function DownCounter(size, callback) {
        var counter = size;
        var fcallback = callback;

        this.down = function () {
            counter--;
            if (counter == 0) {
                window.setTimeout(callback, 5);

            }
        }
    }

    this._innerloadjs = function (jsfiles, callback) {
        var counter = new DownCounter(jsfiles.length, callback), url, scriptTag;
        var ohead = this.getHead();
        for (var i = 0, len = jsfiles.length; i < len; i++) {
            url = jsfiles[i];
            scriptTag = document.createElement('script');
            scriptTag.setAttribute('type', 'text/javascript');
            scriptTag.setAttribute('src', url);
            scriptTag.onload = scriptTag.onreadystatechange = function () {
                if ((!this.readyState ||
					    this.readyState == 'loaded' || this.readyState == 'complete')) {
                    counter.down();
                }
            };
            scriptTag.onerror = function () {
                //                error(data.url + ' failed to load');
                counter.down();
            };
            ohead.appendChild(scriptTag);
        }
    }

    this._loadCss = function (uniqueModules) {
        var ohead = this.getHead(), len = uniqueModules.length - 1, ocss;
        for (var i = len; i >= 0; i--) {
            module = uniqueModules[i];
            if (module.isCss) {
                ocss = document.createElement('link');
                ocss.type = 'text/css';
                ocss.rel = 'stylesheet';
                var src = module.src;
                if (module.isTheme)
                    src = src.replace(/{theme}/g, jslet._theme);

                ocss.href = module.calcBaseUri ? jslet.rootUri + src : src;
                ohead.appendChild(ocss);
            }
        }
    }

    this._getModuleWithChild = function (moduleNames, uniqueModules, level) {
        if (typeof (moduleNames) == 'string')
            moduleNames = moduleNames.split(',');
        jslet.ModuleManager._runingCount++;
        if (jslet.ModuleManager._runingCount > 20000)
            throw new Error('Cycle reference in module configuration!');
        var len = moduleNames.length, m, name, um, omod, cnt;
        for (var i = 0; i < len; i++) {
            name = moduleNames[i].trim();
            omod = this._findModule(name);
            if (!omod)
                continue;
            um = null;
            cnt = uniqueModules.length;
            for (var j = 0; j < cnt; j++) {
                if (uniqueModules[j].name == name) {
                    um = uniqueModules[j];
                    break;
                }
            }
            if (um == null) {
                omod.level = omod.isCss ? 0 : level;
                uniqueModules.push(omod);
            } else {
                if (um.level < level && !omod.isCss)
                    um.level = level;
            }
            if (omod.deps && omod.deps.length > 0) {
                this._getModuleWithChild(omod.deps, uniqueModules, level + 1);
            }
        }
    }

    this._findModule = function (name) {
        var len = _modules.length;
        for (var i = 0; i < len; i++) {
            m = _modules[i];
            if (m.name == name.toLowerCase())
                return m;
        }
        return null;
    }
}

jslet.getCookie = function( name ) {
      var start = document.cookie.indexOf( name + '=' );
      var len = start + name.length + 1;
      if ( ( !start ) && ( name != document.cookie.substring( 0, name.length ) ) ) {
        return null;
      }
      if ( start == -1 ) return null;
      var end = document.cookie.indexOf( ';', len );
      if ( end == -1 ) end = document.cookie.length;
      return unescape( document.cookie.substring( len, end ) );
}

jslet.setCookie = function(name, value, expires, path, domain, secure) {
    var today = new Date();
    today.setTime(today.getTime());
    if (expires) {
        expires = expires * 1000 * 60 * 60 * 24;
    }
    var expires_date = new Date(today.getTime() + (expires));
    document.cookie = name + '=' + escape(value) +
    ((expires) ? ';expires=' + expires_date.toGMTString() : '') + //expires.toGMTString()
    ((path) ? ';path=' + path : '') +
    ((domain) ? ';domain=' + domain : '') +
    ((secure) ? ';secure' : '');
}

jslet.module = new jslet.ModuleManager();

jslet.define = function (name, src, deps, calcBaseUri) {
	if(deps === undefined)
		deps = "jslet";
	
    jslet.module.define(name, src, deps, calcBaseUri);
}

jslet.require = function (moduleNames, callbackFn) {
    jslet.module.require(moduleNames, callbackFn);
};

jslet.setTheme = function (theme, saveToCookie) {
    if (theme){
        jslet._theme = theme.trim();
        if(saveToCookie)
        	jslet.setCookie('jslet.theme', jslet._theme)
    }
}

jslet.setLang = function (lang, saveToCookie) {
    if (lang){
        jslet._lang = lang.trim();
        if(saveToCookie)
        	jslet.setCookie('jslet.lang', jslet._lang)
    }
};

(function () {
    jslet.module.define(jslet._initialModules);
    jslet._initialModules = null;
    delete jslet._initialModules;

    var lang = jslet.getCookie('jslet.lang');
    if (lang)
        jslet._lang = lang;
    var theme = jslet.getCookie('jslet.theme');
    if (theme)
        jslet._theme = theme;
})();
