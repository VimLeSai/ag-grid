import { Color } from "../../util/color";
import { Observable } from "../../util/observable";
import { TooltipRendererResult, TooltipRendererParams } from "@ag-grid-community/core";

export interface TooltipMeta {
    pageX: number;
    pageY: number;
}

export function toTooltipHtml(input: string | TooltipRendererResult, defaults?: TooltipRendererResult) : string {
    if (typeof input === 'string') {
        return input;
    }

    defaults = defaults || {};

    const {
        content = defaults.content || '',
        title = defaults.title || undefined,
        color = defaults.color || 'black',
        backgroundColor = defaults.backgroundColor || 'rgb(136, 136, 136)',
        opacity = defaults.opacity || 0.2
    } = input;

    const titleBgColor = Color.fromString(backgroundColor.toLowerCase());
    const { r, g, b, a } = titleBgColor;

    // TODO: combine a and opacity for alpha?
    const alpha = opacity;

    const titleBgColorWithAlpha = Color.fromArray([r, g, b, alpha]);
    const titleBgColorRgbaString = titleBgColorWithAlpha.toRgbaString();


    const contentBgColor = `rgba(244, 244, 244, ${opacity})`;

    const titleHtml = title ? `<div class="${SparklineTooltip.class}-title";
    style="color: ${color}; background-color: ${titleBgColorRgbaString}">${title}</div>` : '';

    return `${titleHtml}<div class="${SparklineTooltip.class}-content" style="background-color: ${contentBgColor}">${content}</div>`;
}

export class SparklineTooltip extends Observable {
    element: HTMLElement = document.createElement('div');

    static class: string = 'ag-sparkline-tooltip';
    enabled: boolean = true;
    container?: HTMLElement = undefined;
    renderer?: (params: TooltipRendererParams) => string | TooltipRendererResult = undefined;

    constructor() {
        super();
        const tooltipRoot = document.body;
        tooltipRoot.appendChild(this.element);
    }

    isVisible(): boolean {
        const { element } = this;
        if (element.classList) {
            return !element.classList.contains(`${SparklineTooltip.class}-hidden`);
        }

        // IE11
        const classes = element.getAttribute('class');
        if (classes) {
            return classes.split(' ').indexOf(`${SparklineTooltip.class}-hidden`) < 0;
        }

        return false;
    }
    updateClass(visible?: boolean, constrained?: boolean) {
        const classList = [SparklineTooltip.class];

        if (visible !== true) {
            classList.push(`${SparklineTooltip.class}-hidden`);
        }

        if (constrained !== true) {
            classList.push(`${SparklineTooltip.class}-arrow`);
        }

        this.element.setAttribute('class', classList.join(' '));
    }

    private constrained = false;
    show(meta: TooltipMeta, html?: string) {
        this.toggle(false);

        const { element } = this;

        if (html !== undefined) {
            element.innerHTML = html;
        } else if (!element.innerHTML) {
            return;
        }

        let left = meta.pageX - element.clientWidth / 2;
        let top = meta.pageY - element.clientHeight - 6;

        this.constrained = false;
        const tooltipRect = element.getBoundingClientRect();

        let minLeft = 0;
        let maxLeft = window.innerWidth - tooltipRect.width;
        let minTop = window.pageYOffset;

        if (this.container) {
            const containerRect = this.container.getBoundingClientRect();

            minLeft = containerRect.left;
            maxLeft = containerRect.width - tooltipRect.width;
            minTop = containerRect.top < 0 ?  window.pageYOffset : containerRect.top;
        }

        if (left < minLeft) {
            left = minLeft;
            this.updateClass(true, this.constrained = true);
        } else if (left > maxLeft) {
            left = maxLeft;
            this.updateClass(true, this.constrained = true);
        }

        if (top < minTop) {
            top = minTop;
            this.updateClass(true, this.constrained = true);
        }

        element.style.left = `${Math.round(left)}px`;
        element.style.top = `${Math.round(top)}px`;

        this.toggle(true);
    }

    toggle(visible?: boolean) {
        this.updateClass(visible, this.constrained);
    }

    destroy() {
        const { parentNode } = this.element;

        if (parentNode) {
            parentNode.removeChild(this.element);
        }
    }
}