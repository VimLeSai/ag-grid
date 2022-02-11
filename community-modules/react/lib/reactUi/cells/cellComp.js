// @ag-grid-community/react v27.0.1
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const react_1 = __importStar(require("react"));
const utils_1 = require("../utils");
const popupEditorComp_1 = __importDefault(require("./popupEditorComp"));
const showJsRenderer_1 = __importDefault(require("./showJsRenderer"));
const beansContext_1 = require("../beansContext");
const jsComp_1 = require("../jsComp");
var CellCompState;
(function (CellCompState) {
    CellCompState[CellCompState["ShowValue"] = 0] = "ShowValue";
    CellCompState[CellCompState["EditValue"] = 1] = "EditValue";
})(CellCompState = exports.CellCompState || (exports.CellCompState = {}));
const checkCellEditorDeprecations = (popup, cellEditor, cellCtrl) => {
    const col = cellCtrl.getColumn();
    // cellEditor is written to be a popup editor, however colDef.cellEditorPopup is not set
    if (!popup && cellEditor.isPopup && cellEditor.isPopup()) {
        const msg = `AG Grid: Found an issue in column ${col.getColId()}. If using React, specify an editor is a popup using colDef.cellEditorPopup=true. AG Grid React cannot depend on the editor component specifying if it's in a popup (via the isPopup() method on the editor), as React needs to know this information BEFORE the component is created.`;
        core_1._.doOnce(() => console.warn(msg), 'jsEditorComp-isPopup-' + cellCtrl.getColumn().getColId());
    }
    // cellEditor is a popup and is trying to position itself the deprecated way
    if (popup && cellEditor.getPopupPosition && cellEditor.getPopupPosition() != null) {
        const msg = `AG Grid: Found an issue in column ${col.getColId()}. If using React, specify an editor popup position using colDef.cellEditorPopupPosition=true. AG Grid React cannot depend on the editor component specifying it's position (via the getPopupPosition() method on the editor), as React needs to know this information BEFORE the component is created.`;
        core_1._.doOnce(() => console.warn(msg), 'jsEditorComp-getPopupPosition-' + cellCtrl.getColumn().getColId());
    }
};
const jsxEditValue = (editDetails, setInlineCellEditorRef, setPopupCellEditorRef, eGui, cellCtrl, jsEditorComp) => {
    const compDetails = editDetails.compDetails;
    const CellEditorClass = compDetails.componentClass;
    const reactInlineEditor = compDetails.componentFromFramework && !editDetails.popup;
    const reactPopupEditor = compDetails.componentFromFramework && editDetails.popup;
    const jsPopupEditor = !compDetails.componentFromFramework && editDetails.popup;
    return (react_1.default.createElement(react_1.default.Fragment, null,
        reactInlineEditor
            && react_1.default.createElement(CellEditorClass, Object.assign({}, editDetails.compDetails.params, { ref: setInlineCellEditorRef })),
        reactPopupEditor
            && react_1.default.createElement(popupEditorComp_1.default, { editDetails: editDetails, cellCtrl: cellCtrl, eParentCell: eGui, wrappedContent: react_1.default.createElement(CellEditorClass, Object.assign({}, editDetails.compDetails.params, { ref: setPopupCellEditorRef })) }),
        jsPopupEditor && jsEditorComp && react_1.default.createElement(popupEditorComp_1.default, { editDetails: editDetails, cellCtrl: cellCtrl, eParentCell: eGui, jsChildComp: jsEditorComp })));
};
const jsxShowValue = (showDetails, parentId, cellRendererRef, showTools, reactCellRendererStateless, setECellValue) => {
    const { compDetails, value } = showDetails;
    const noCellRenderer = !compDetails;
    const reactCellRenderer = compDetails && compDetails.componentFromFramework;
    const CellRendererClass = compDetails && compDetails.componentClass;
    // if we didn't do this, objects would cause React error. we depend on objects for things
    // like the aggregation functions avg and count, which return objects and depend on toString()
    // getting called.
    const valueForNoCellRenderer = (value && value.toString) ? value.toString() : value;
    const bodyJsxFunc = () => (react_1.default.createElement(react_1.default.Fragment, null,
        noCellRenderer && react_1.default.createElement(react_1.default.Fragment, null, valueForNoCellRenderer),
        reactCellRenderer && !reactCellRendererStateless && react_1.default.createElement(CellRendererClass, Object.assign({}, compDetails.params, { ref: cellRendererRef })),
        reactCellRenderer && reactCellRendererStateless && react_1.default.createElement(CellRendererClass, Object.assign({}, compDetails.params))));
    return (react_1.default.createElement(react_1.default.Fragment, null, showTools ?
        react_1.default.createElement("span", { role: "presentation", id: `cell-${parentId}`, className: "ag-cell-value", ref: setECellValue }, bodyJsxFunc())
        :
            bodyJsxFunc()));
};
const CellComp = (props) => {
    const { context } = react_1.useContext(beansContext_1.BeansContext);
    const { cellCtrl, printLayout, editingRow } = props;
    const [renderDetails, setRenderDetails] = react_1.useState();
    const [editDetails, setEditDetails] = react_1.useState();
    const [cssClasses, setCssClasses] = react_1.useState(new utils_1.CssClasses());
    const [userStyles, setUserStyles] = react_1.useState();
    const [tabIndex, setTabIndex] = react_1.useState();
    const [ariaSelected, setAriaSelected] = react_1.useState();
    const [ariaExpanded, setAriaExpanded] = react_1.useState();
    const [ariaColIndex, setAriaColIndex] = react_1.useState();
    const [ariaDescribedBy, setAriaDescribedBy] = react_1.useState();
    const [role, setRole] = react_1.useState();
    const [colId, setColId] = react_1.useState();
    const [title, setTitle] = react_1.useState();
    const [includeSelection, setIncludeSelection] = react_1.useState(false);
    const [includeRowDrag, setIncludeRowDrag] = react_1.useState(false);
    const [includeDndSource, setIncludeDndSource] = react_1.useState(false);
    const [jsEditorComp, setJsEditorComp] = react_1.useState();
    const forceWrapper = react_1.useMemo(() => cellCtrl.isForceWrapper(), []);
    const eGui = react_1.useRef(null);
    const cellRendererRef = react_1.useRef(null);
    const jsCellRendererRef = react_1.useRef();
    const cellEditorRef = react_1.useRef();
    // when setting the ref, we also update the state item to force a re-render
    const eCellWrapper = react_1.useRef();
    const [cellWrapperVersion, setCellWrapperVersion] = react_1.useState(0);
    const setCellWrapperRef = react_1.useCallback(ref => {
        eCellWrapper.current = ref;
        setCellWrapperVersion(v => v + 1);
    }, []);
    // when setting the ref, we also update the state item to force a re-render
    const eCellValue = react_1.useRef();
    const [cellValueVersion, setCellValueVersion] = react_1.useState(0);
    const setCellValueRef = react_1.useCallback(ref => {
        eCellValue.current = ref;
        setCellValueVersion(v => v + 1);
    }, []);
    const showTools = renderDetails != null && (includeSelection || includeDndSource || includeRowDrag);
    const showCellWrapper = forceWrapper || showTools;
    const setCellEditorRef = react_1.useCallback((popup, cellEditor) => {
        cellEditorRef.current = cellEditor;
        if (cellEditor) {
            checkCellEditorDeprecations(popup, cellEditor, cellCtrl);
            const editingCancelledByUserComp = cellEditor.isCancelBeforeStart && cellEditor.isCancelBeforeStart();
            if (editingCancelledByUserComp) {
                // we cannot set state inside render, so hack is to do it in next VM turn
                setTimeout(() => cellCtrl.stopEditing(), 0);
            }
        }
    }, []);
    const setPopupCellEditorRef = react_1.useCallback((cellRenderer) => setCellEditorRef(true, cellRenderer), []);
    const setInlineCellEditorRef = react_1.useCallback((cellRenderer) => setCellEditorRef(false, cellRenderer), []);
    showJsRenderer_1.default(renderDetails, showTools, eCellValue.current, cellValueVersion, jsCellRendererRef, eGui);
    // if RenderDetails changed, need to call refresh. This is not our preferred way (the preferred
    // way for React is just allow the new props to propagate down to the React Cell Renderer)
    // however we do this for backwards compatibility, as having refresh used to be supported.
    const lastRenderDetails = react_1.useRef();
    react_1.useEffect(() => {
        const oldDetails = lastRenderDetails.current;
        const newDetails = renderDetails;
        lastRenderDetails.current = renderDetails;
        // if not updating renderDetails, do nothing
        if (oldDetails == null || oldDetails.compDetails == null
            || newDetails == null || newDetails.compDetails == null) {
            return;
        }
        const oldCompDetails = oldDetails.compDetails;
        const newCompDetails = newDetails.compDetails;
        // if different Cell Renderer, then do nothing, as renderer will be recreated
        if (oldCompDetails.componentClass != newCompDetails.componentClass) {
            return;
        }
        // if no refresh method, do nothing
        if (cellRendererRef.current == null || cellRendererRef.current.refresh == null) {
            return;
        }
        cellRendererRef.current.refresh(newCompDetails.params);
    }, [renderDetails]);
    react_1.useEffect(() => {
        const doingJsEditor = editDetails && !editDetails.compDetails.componentFromFramework;
        if (!doingJsEditor) {
            return;
        }
        const compDetails = editDetails.compDetails;
        const isPopup = editDetails.popup === true;
        const cellEditor = jsComp_1.createSyncJsComp(compDetails);
        if (!cellEditor) {
            return;
        }
        const compGui = cellEditor.getGui();
        setCellEditorRef(isPopup, cellEditor);
        if (!isPopup) {
            eGui.current.appendChild(compGui);
            cellEditor.afterGuiAttached && cellEditor.afterGuiAttached();
        }
        setJsEditorComp(cellEditor);
        return () => {
            context.destroyBean(cellEditor);
            setCellEditorRef(isPopup, undefined);
            setJsEditorComp(undefined);
            if (compGui && compGui.parentElement) {
                compGui.parentElement.removeChild(compGui);
            }
        };
    }, [editDetails]);
    // tool widgets effect
    react_1.useEffect(() => {
        if (!cellCtrl || !context) {
            return;
        }
        setAriaDescribedBy(!!eCellWrapper.current ? `cell-${cellCtrl.getInstanceId()}` : undefined);
        if (!eCellWrapper.current || !showTools) {
            return;
        }
        const destroyFuncs = [];
        const addComp = (comp) => {
            if (comp) {
                const eGui = comp.getGui();
                eCellWrapper.current.insertAdjacentElement('afterbegin', eGui);
                destroyFuncs.push(() => {
                    context.destroyBean(comp);
                    core_1._.removeFromParent(eGui);
                });
            }
            return comp;
        };
        if (includeSelection) {
            addComp(cellCtrl.createSelectionCheckbox());
        }
        if (includeDndSource) {
            addComp(cellCtrl.createDndSource());
        }
        if (includeRowDrag) {
            addComp(cellCtrl.createRowDragComp());
        }
        return () => {
            destroyFuncs.forEach(f => {
                f();
            });
        };
    }, [showTools, includeDndSource, includeRowDrag, includeSelection, cellWrapperVersion]);
    react_1.useEffect(() => {
        if (!cellCtrl) {
            return;
        }
        const compProxy = {
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            setUserStyles: styles => setUserStyles(styles),
            setAriaSelected: value => setAriaSelected(value),
            setAriaExpanded: value => setAriaExpanded(value),
            getFocusableElement: () => eGui.current,
            setAriaColIndex: index => setAriaColIndex(index),
            setTabIndex: tabIndex => setTabIndex(tabIndex),
            setRole: role => setRole(role),
            setColId: colId => setColId(colId),
            setTitle: title => setTitle(title),
            setIncludeSelection: include => setIncludeSelection(include),
            setIncludeRowDrag: include => setIncludeRowDrag(include),
            setIncludeDndSource: include => setIncludeDndSource(include),
            getCellEditor: () => cellEditorRef.current || null,
            getCellRenderer: () => cellRendererRef.current ? cellRendererRef.current : jsCellRendererRef.current,
            getParentOfValue: () => eCellValue.current ? eCellValue.current : eCellWrapper.current ? eCellWrapper.current : eGui.current,
            setRenderDetails: (compDetails, value, force) => {
                setRenderDetails({
                    value,
                    compDetails,
                    force
                });
            },
            setEditDetails: (compDetails, popup, popupPosition) => {
                if (compDetails) {
                    // start editing
                    setEditDetails({
                        compDetails: compDetails,
                        popup,
                        popupPosition
                    });
                    if (!popup) {
                        setRenderDetails(undefined);
                    }
                }
                else {
                    // stop editing
                    setEditDetails(undefined);
                }
            }
        };
        const cellWrapperOrUndefined = eCellWrapper.current || undefined;
        cellCtrl.setComp(compProxy, null, eGui.current, cellWrapperOrUndefined, printLayout, editingRow);
    }, []);
    const reactCellRendererStateless = react_1.useMemo(() => {
        const res = renderDetails && renderDetails.compDetails
            && renderDetails.compDetails.componentFromFramework
            && utils_1.isComponentStateless(renderDetails.compDetails.componentClass);
        return !!res;
    }, [renderDetails]);
    const className = react_1.useMemo(() => {
        let res = cssClasses.toString();
        if (!showCellWrapper) {
            res += ' ag-cell-value';
        }
        return res;
    }, [cssClasses, showTools]);
    const cellInstanceId = react_1.useMemo(() => cellCtrl.getInstanceId(), []);
    const showContents = () => react_1.default.createElement(react_1.default.Fragment, null,
        renderDetails != null && jsxShowValue(renderDetails, cellInstanceId, cellRendererRef, showTools, reactCellRendererStateless, setCellValueRef),
        editDetails != null && jsxEditValue(editDetails, setInlineCellEditorRef, setPopupCellEditorRef, eGui.current, cellCtrl, jsEditorComp));
    return (react_1.default.createElement("div", { ref: eGui, className: className, style: userStyles, tabIndex: tabIndex, "aria-selected": ariaSelected, "aria-colindex": ariaColIndex, role: role, "aria-expanded": ariaExpanded, "col-id": colId, title: title, "aria-describedby": ariaDescribedBy }, showCellWrapper ?
        react_1.default.createElement("div", { className: "ag-cell-wrapper", role: "presentation", ref: setCellWrapperRef }, showContents())
        :
            showContents()));
};
exports.default = react_1.memo(CellComp);

//# sourceMappingURL=cellComp.js.map