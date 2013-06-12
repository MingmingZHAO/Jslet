// define Dataset Object
var lkf,dataList;

var dsFieldDatatype = jslet.data.createEnumDataset('fieldDatatype', 'S-String;N-Number;D-Date;B-Boolean;A-Dataset'); 
var dsFieldAlignment = jslet.data.createEnumDataset('fieldAlignment', 'left-Left;center-Center;right-Right'); 
var dsFieldUrlTarget = jslet.data.createEnumDataset('fieldUrlTarget', '_blank-Blank;_parent-Parent;_self-Self;_top-Top');
var dsFieldEditor = jslet.data.createEnumDataset('fieldEditor', 
'DBText-Text Control;DBDataLabel-Data Label Control;DBPassword-Password Control;DBTextArea-TextArea Control;DBSpinEdit-Spin Edit Control;DBCheckBox-Checkbox Control;'+
'DBCheckBoxGroup-Checkbox Group Control;DBRadioGroup-Radio Group Control;DBSelect-Select Control;DBRangeSelect-Range Select Control;DBComboSelect-Popup Dropdown Control;DBDatePicker-DatePicker Control;DBImage-Image Control;DBRating-Rating Control'
);  

var fldCfg = [
	{ name: 'index', type: 'N', length: 3, label: 'Num#', displayWidth: 6, defaultExpr:'0', diaplayFormat: '##0', editControl:'dbspinedit' },
	{ name: 'name', type: 'S', length: 30, label: 'Field Name', displayWidth: 20, required: true },
	{ name: 'label', type: 'S', length: 30, label: 'Field Label', displayWidth: 20 },
	{ name: 'type', type: 'S', length: 1, label: 'Data Type', lookupField: '{lookupDataset:"fieldDatatype"}', displayWidth: 10, defaultExpr:'"S"' },
    { name: 'subDataset', type: 'S', length: 30, label: 'Sub-Dataset Name', displayWidth: 10 },
	{ name: 'length', type: 'N', length: 3, label: 'Data Length', displayWidth: 10, diaplayFormat: '##0', editControl: 'dbspinedit' },
	{ name: 'scale', type: 'N', length: 3, label: 'Data Scale', displayWidth: 6, diaplayFormat: '##0', editControl:'dbspinedit'},
	{ name: 'defaultExpr', type: 'S', length: 100, label: 'Default Value', displayWidth: 10 },

	{ name: 'displayWidth', type: 'N', length: 3, label: 'Display Width', displayWidth: 10, diaplayFormat: '##0',editControl:'dbspinedit'},
	{ name: 'alignment', type: 'S', length: 3, label: 'Alignment', displayWidth: 10, lookupField: '{lookupDataset:"fieldAlignment"}' },
	{ name: 'displayFormat', type: 'S', length: 30, label: 'Display Format', displayWidth: 10 },
	{ name: 'editControl', type: 'S', length: 100, label: 'Editor', displayWidth: 10, lookupField: '{lookupDataset:"fieldEditor"}',required:false,nullText:'(auto)' },

	{ name: 'formula', type: 'S', length: 100, label: 'Formula', displayWidth: 10 },
	{ name: 'readOnly', type: 'B', label: 'ReadOnly', displayWidth: 10 },
	{ name: 'visible', type: 'B', label: 'Visible', displayWidth: 10 },
	{ name: 'unitConverted', type: 'B', label: 'Scaleable', displayWidth: 10 },

	{ name: 'required', type: 'B', label: 'required', displayWidth: 10 },
	{ name: 'range', type: 'S', length: 50, label: 'Data Range', displayWidth: 10 },
	{ name: 'regularExpr', type: 'S', length: 50, label: 'Regular Expression', displayWidth: 10 },

	{ name: 'lookupField', type: 'S', length: 100, label: 'Lookup Field', displayWidth: 10 },
	{ name: 'urlExpr', type: 'S', length: 100, label: 'HyperLink Expression', displayWidth: 10 },
	{ name:'urlTarget',type:'S',length:10,label:'HyperLink Target',lookupField:'{lookupDataset:"fieldUrlTarget"}'},

	{ name: 'betweenStyle', type: 'B', label: 'Between Style', displayWidth: 10 },
	{ name: 'maxValueField', type: 'S', length: 30, label: 'Maximum Field Name', displayWidth: 10 },

	{ name: 'clientTranslate', type: 'B', label: 'Client Translate', displayWidth: 10, defaultExpr: 'true' },
	{ name: 'inputValueField', type: 'S', length: 30, label: 'Input Value Field', displayWidth: 10 },
	{ name: 'displayValueField', type: 'S', length: 30, label: 'Display Value Field', displayWidth: 10 }
];

var dsFieldCfg = jslet.data.createDataset('fieldCfg', fldCfg, 'name', 'name', 'label');

fldCfg = [
	{ name: 'name', type: 'S', length: 30, label: 'Dataset Name', displayWidth: 20, required: true },
	{ name: 'description', type: 'S', length: 100, label: 'description', displayWidth: 20 },
	{ name: 'keyField', type: 'S', length: 30, label: 'Key Field', displayWidth: 10,required: false },
	{ name: 'inputValueField', type: 'S', length: 30, label: 'Input Value Field', displayWidth: 10 },
	{ name: 'displayValueField', type: 'S', length: 30, label: 'Display Value Field', displayWidth: 10 },
	{ name: 'parentField', type: 'S', length: 30, label: 'Parent Field', displayWidth: 10 },
	{ name: 'fields', type: 'V', label: 'fields',subDataset:'fieldCfg',visible:false }
    ];

var dsDatasetCfg = jslet.data.createDataset('datasetCfg', fldCfg);
delete fldCfg;

var data = [
     {name: 'DBLabel', description: 'DBLabel Control', fields:
        [{ index: 0, name: 'dataset', label: '数据集', type: 'S', length: 20, displayWidth: 20, alignment: 'left', required: true },
        { index: 1, name: 'field', label: '字段名', type: 'S', length: 20, alignment: 'left', required: true}]
     },
        
     { name: 'DBDataLabel', description: 'DBDataLabel', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'field', label: '字段名', type: 'S', length: 20, required: true}]
     },
     { name: 'DBText', description: 'DBText', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'field', label: '字段名', type: 'S', length: 20, required: true}]
     },
     { name: 'DBPassword', description: 'DBPassword', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'field', label: '字段名', type: 'S', length: 20, required: true}]
     },
     { name: 'DBTextArea', description: 'DBTextArea', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'field', label: '字段名', type: 'S', length: 20, required: true}]
     },
     { name: 'DBSelect', description: 'DBSelect', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'field', label: '字段名', type: 'S', length: 20, required: true },
         { index: 2, name: 'groupField', label: '分组字段名', type: 'S', length: 20}]
     },
     { name: 'DBRangSelect', description: 'DBRangSelect', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'field', label: '字段名', type: 'S', length: 20, required: true},
         { index: 2, name: 'beginItem', label: '最低值', type: 'N', length: 10 },
         { index: 3, name: 'endItem', label: '最高值', type: 'N', length: 10 },
         { index: 4, name: 'step', label: '步进值', type: 'N', length: 10,defaultExpr:'1'}]
     },
     { name: 'DBCheckBox', description: 'DBCheckBox', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'field', label: '字段名', type: 'S', length: 20, required: true}]
     },
     { name: 'DBSpinEdit', description: 'DBSpinEdit', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'field', label: '字段名', type: 'S', length: 20, required: true},
         { index: 2, name: 'minValue', label: '最低值', type: 'N', length: 10 },
         { index: 3, name: 'maxValue', label: '最高值', type: 'N', length: 10 },
         { index: 4, name: 'step', label: '步进值', type: 'N', length: 10,defaultExpr:'1'}]
     },
     { name: 'DBRadioGroup', description: 'DBRadioGroup', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'field', label: '字段名', type: 'S', length: 20, required: true },
         { index: 2, name: 'cols', label: '每行的列数', type: 'N', length: 10 }]
     },
     { name: 'DBCheckBoxGroup', description: 'DBCheckBoxGroup', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'field', label: '字段名', type: 'S', length: 20, required: true },
         { index: 2, name: 'cols', label: '每行的列数', type: 'N', length: 10 },
         { index: 3, name: 'allowedCount', label: '最多选择个数', type: 'N', length: 10}]
     },
     { name: 'DBImage', description: 'DBImage', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'field', label: '字段名', type: 'S', length: 20, required: true },
         { index: 2, name: 'srcType', label: '图片来源(file/db)', type: 'S', length: 20 },
         { index: 3, name: 'baseUrl', label: '基url地址', type: 'S', length: 20 },
         { index: 4, name: 'locked', label: '锁定图片更新', type: 'B' },
         ]
     },
     { name: 'DBBetweenEdit', description: 'DBBetweenEdit', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'minValueField', label: '下限值字段名', type: 'S', length: 20},
         { index: 2, name: 'maxValueField', label: '上限值字段名', type: 'S', length: 20}]
     },
     { name: 'DBRating', description: 'DBRating', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'field', label: '字段名', type: 'S', length: 20, required: true },
         { index: 2, name: 'itemCount', label: '评级项个数', type: 'N', length: 10 },
         { index: 3, name: 'splitCount', label: '每项分割数', type: 'N', length: 10 },
         { index: 4, name: 'itemWidth', label: '每项宽度', type: 'N', length: 10 },
         { index: 5, name: 'readOnly', label: '是否只读', type: 'B' },
         { index: 6, name: 'required', label: '是否可为零', type: 'B'}]
     },
     { name: 'DBComboSelect', description: 'DBDBComboSelect', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'field', label: '字段名', type: 'S', length: 20, required: true },
         { index: 2, name: 'dialogWidth', label: '弹出框宽度', type: 'N', length: 10 },
         { index: 3, name: 'dialogHeight', label: '弹出框高度', type: 'N', length: 10 },
         { index: 4, name: 'treeIconWidth', label: '树型图标宽度', type: 'N', length: 10 },
         { index: 5, name: 'textReadOnly', label: 'Text是否只读', type: 'B' },
         { index: 6, name: 'showStyle', label: '显示样式', type: 'S', length: 10, defaultExpr:'"auto"'}]
     },
     { name: 'DBDatePicker', description: 'DBDatePicker', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'field', label: '字段名', type: 'S', length: 20, required: true },
         { index: 2, name: 'popupWidth', label: '弹出框宽度', type: 'N', length: 10 },
         { index: 3, name: 'popupHeight', label: '弹出框高度', type: 'N', length: 10 },
         { index: 4, name: 'textReadOnly', label: 'Text是否只读', type: 'B' },
         { index: 5, name: 'minDate', label: '可选日期下限', type: 'D' },
         { index: 6, name: 'maxDate', label: '可选日期上限', type: 'D'}]
     },
     { name: 'DBAutoCompleteBox', description: 'DBAutoCompleteBox', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'field', label: '字段名', type: 'S', length: 20, required: true },
         { index: 2, name: 'minChars', label: '至少字符数', type: 'N', length: 10 },
         { index: 3, name: 'minDelay', label: '延迟时间(毫秒)', type: 'N', length: 10 },
         { index: 4, name: 'beforePopulate', label: '弹出选择面板前事件', type: 'S', length: 20 },
         { index: 5, name: 'onGetFilterField', label: '取筛选字段事件', type: 'S', length: 20 },
         { index: 6, name: 'filterMode', label: '匹配模式', type: 'S', length: 10, defaultExpr: '"start"'}]
     },
     { name: 'DBChart', description: 'DBChart', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'chartUrl', label: '图表flash url', type: 'S', length: 20, required: true },
         { index: 2, name: 'chartType', label: '图表类别', type: 'S', length: 10 },
         { index: 3, name: 'chartTitle', label: '图表标题', type: 'S', length: 10 },
         { index: 4, name: 'categoryField', label: '分类字段名', type: 'S', length: 20, required: true },
         { index: 5, name: 'valueField', label: 'Y轴字段名', type: 'S', length: 20, required: true },
         { index: 6, name: 'onlySelected', label: '只显示选择的数据', type: 'B' },
         { index: 7, name: 'legendPos', label: '图例位置', type: 'S', length: 10}]
     },
     { name: 'DBTreeView', description: 'DBTreeView', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'keyField', label: '关键字段名', type: 'S', length: 20, required: true },
         { index: 2, name: 'parentField', label: '父级字段名', type: 'S', length: 10 },
         { index: 3, name: 'displayFields', label: '显示字段表达式', type: 'S', length: 10 },
         { index: 4, name: 'iconClassField', label: '存节点图片css类字段名', type: 'S', length: 20 },
         { index: 5, name: 'hasCheckbox', label: '有复选框', type: 'B'},
         { index: 6, name: 'recurseCheck', label: '父级联动选择', type: 'B' },
         { index: 7, name: 'checkboxReadOnly', label: '复选框只读', type: 'B' },
         { index: 8, name: 'onItemDblClick', label: '树节点双击事件', type: 'S', length: 20 },
         { index: 9, name: 'onGetIconClass', label: '取节点图片css类事件', type: 'S', length: 20}]
     },
     { name: 'DBPageBar', description: 'DBPageBar', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'showPageSize', label: '显示每页大小项', type: 'B' },
         { index: 2, name: 'showGotoButton', label: '显示跳转按钮', type: 'B' },
         { index: 3, name: 'pageSizeList', label: '页面大小列表', type: 'S', length: 20 }]
     },
     { name: 'DBInspector', description: 'DBInspector', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'showPageSize', label: '显示每页大小项', type: 'B' },
         { index: 2, name: 'showGotoButton', label: '显示跳转按钮', type: 'B' },
         { index: 3, name: 'pageSizeList', label: '页面大小列表', type: 'S', length: 20}]
     },
     { name: 'DBEditPanel', description: 'DBEditPanel', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'columnCount', label: '列数', type: 'N', length: 10 },
         { index: 2, name: 'labelGap', label: '标题间隙', type: 'N', length: 10 },
         { index: 3, name: 'columnGap', label: '列间隙', type: 'N', length: 10 },
         { index: 4, name: 'columnWidth', label: '列宽', type: 'N', length: 10 },
         { index: 5, name: 'rowHeight', label: '行高', type: 'N', length: 10 },
         { index: 6, name: 'onlySpecifiedFields', label: '只显示指定列', type: 'B' },
         { index: 7, name: 'fields', label: '编辑的字段(,分隔)', type: 'S', length: 20}]
     },
     { name: 'DBTable', description: 'DBTable', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'fixedRows', label: '固定行数', type: 'N', length: 10 },
         { index: 2, name: 'fixedCols', label: '固定列数', type: 'N', length: 10 },
         { index: 3, name: 'rowHeight', label: '行高', type: 'N', length: 10 },
         { index: 4, name: 'hasSeqCol', label: '有序号列', type: 'B' },
         { index: 5, name: 'hasSelectCol', label: '有选择列', type: 'B' },
         { index: 6, name: 'readOnly', label: '只读', type: 'B' },
         { index: 7, name: 'hideHead', label: '隐藏表头', type: 'B' },
         { index: 8, name: 'disableHeadSort', label: '禁止点击列头排序', type: 'B' },
         { index: 9, name: 'onlySpecifiedCol', label: '仅显示指定列', type: 'B' },
         { index: 10, name: 'selectBy', label: '分组选择字段名', type: 'S', length: 20 },
         { index: 11, name: 'onRowClick', label: '行点击事件', type: 'S', length: 20 },
         { index: 12, name: 'onRowDblClick', label: '行双击事件', type: 'S', length: 20 },
         { index: 13, name: 'onSelect', label: '选择事件', type: 'S', length: 20 },
         { index: 14, name: 'onSelectAll', label: '选择全部事件', type: 'S', length: 20 },
         { index: 15, name: 'onCustomSort', label: '自定义排序事件', type: 'S', length: 20 },
         { index: 16, name: 'columns', label: '列配置信息', type: 'V', length: 10}]
     },
     { name: 'TabControl', description: 'TabControl', fields:
        [{ index: 0, name: 'dataset', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'selectedIndex', label: '当前选择页面', type: 'N', length: 10 },
         { index: 2, name: 'newable', label: '可增加新的页面', type: 'B' },
         { index: 3, name: 'closable', label: '可关闭页面', type: 'B' },
         { index: 4, name: 'onAddTabItem', label: '新增页面事件', type: 'S', length: 20 },
         { index: 5, name: 'onSelectedChanged', label: '页面切换事件', type: 'S', length: 20 },
         { index: 6, name: 'onRemoveTabItem', label: '页面关闭事件', type: 'S', length: 20 },
         { index: 7, name: 'items', label: '页面配置信息', type: 'V', length: 10}]
     },
     { name: 'Calendar', description: 'Calendar', fields:
        [{ index: 0, name: 'value', type: 'D', label: '所选日期', length: 10, required: true },
         { index: 0, name: 'minDate', type: 'D', label: '下限日期', length: 10 },
         { index: 0, name: 'maxDate', type: 'D', label: '上限日期', length: 20 },
         { index: 6, name: 'onDateSelected', label: '选择日期事件', type: 'S', length: 20}]
     },
     { name: 'Window', description: 'Window', fields:
        [{ index: 0, name: 'caption', type: 'S', label: '数据集名', length: 20, required: true },
         { index: 1, name: 'iconcls', label: '分组选择字段名', type: 'S', length: 20 },
         { index: 2, name: 'width', label: '固定行数', type: 'N', length: 10 },
         { index: 3, name: 'height', label: '固定列数', type: 'N', length: 10 },
         { index: 4, name: 'minWidth', label: '行高', type: 'N', length: 10 },
         { index: 5, name: 'maxWidth', label: '有序号列', type: 'N', length: 10 },
         { index: 6, name: 'minHeight', label: '行高', type: 'N', length: 10 },
         { index: 7, name: 'maxHeight', label: '有序号列', type: 'N', length: 10 },
         { index: 8, name: 'resizable', label: '有选择列', type: 'B' },
         { index: 9, name: 'minimizable', label: '只读', type: 'B' },
         { index: 10, name: 'maximizable', label: '隐藏表头', type: 'B' },
         { index: 11, name: 'closable', label: '禁止点击列头排序', type: 'B' },
         { index: 12, name: 'isCenter', label: '仅显示指定列', type: 'B' },
         { index: 13, name: 'onSizeChanged', label: '行点击事件', type: 'S', length: 20 },
         { index: 14, name: 'onClosed', label: '行双击事件', type: 'S', length: 20 },
         { index: 15, name: 'onPositionChanged', label: '选择事件', type: 'S', length: 20 },
         { index: 16, name: 'onActive', label: '选择全部事件', type: 'S', length: 20 }]
     }
     ]; 
dsDatasetCfg.dataList(data);
delete data;
