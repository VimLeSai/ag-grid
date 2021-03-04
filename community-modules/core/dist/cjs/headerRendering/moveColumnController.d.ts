// Type definitions for @ag-grid-community/core v25.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
import { DraggingEvent } from "../dragAndDrop/dragAndDropService";
import { DropListener } from "./bodyDropTarget";
import { GridPanel } from "../gridPanel/gridPanel";
import { ColumnEventType } from "../events";
export declare class MoveColumnController implements DropListener {
    private loggerFactory;
    private columnController;
    private dragAndDropService;
    private gridOptionsWrapper;
    private gridPanel;
    private needToMoveLeft;
    private needToMoveRight;
    private movingIntervalId;
    private intervalCount;
    private logger;
    private pinned;
    private centerContainer;
    private lastDraggingEvent;
    private failedMoveAttempts;
    private eContainer;
    constructor(pinned: string | null, eContainer: HTMLElement);
    registerGridComp(gridPanel: GridPanel): void;
    init(): void;
    getIconName(): string;
    onDragEnter(draggingEvent: DraggingEvent): void;
    onDragLeave(draggingEvent: DraggingEvent): void;
    setColumnsVisible(columns: Column[] | null | undefined, visible: boolean, source?: ColumnEventType): void;
    setColumnsPinned(columns: Column[] | null | undefined, pinned: string | null, source?: ColumnEventType): void;
    onDragStop(): void;
    private normaliseX;
    private checkCenterForScrolling;
    onDragging(draggingEvent: DraggingEvent, fromEnter?: boolean): void;
    private normaliseDirection;
    private calculateOldIndex;
    private attemptMoveColumns;
    private calculateValidMoves;
    private isColumnHidden;
    private ensureIntervalStarted;
    private ensureIntervalCleared;
    private moveInterval;
}