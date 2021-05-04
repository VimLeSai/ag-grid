// Type definitions for @ag-grid-community/core v25.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
export declare class CenterWidthFeature extends BeanStub {
    private columnController;
    private callback;
    constructor(callback: (width: number) => void);
    private postConstruct;
    private setWidth;
}