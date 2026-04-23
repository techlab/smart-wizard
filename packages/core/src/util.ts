import { WizardOptions } from "./types";

export type ElementCallback = (element: HTMLElement) => void;
export type EventCallback = (event: Event) => void;

export const applyTo = (value: Element | Element[] | NodeListOf<Element>, cb: ElementCallback): void => {
    const elements = Array.isArray(value) || value instanceof NodeList ? value : [value];
    Array.from(elements).forEach(element => {
        if (element instanceof HTMLElement) {
            cb(element);
        }
    });
};

export const getElement = (selector: string): HTMLElement | null => {
    return document.querySelector(selector) as HTMLElement | null;
};

export const getElements = (selector: string): HTMLElement[] => {
    return Array.from(document.querySelectorAll(selector)) as HTMLElement[];
};

export const getChildren = (selector: string, root: Element | Document | any = document): HTMLElement[] => {
    if (root && (Array.isArray(root) || root instanceof NodeList || (root.length !== undefined && root[0]))) {
        root = root[0];
    }
    return (root && typeof root.querySelectorAll === 'function') ? Array.from(root.querySelectorAll(selector)) as HTMLElement[] : [];
};

export const getFirstDescendant = (selector: string, parent: Element | Document | any = document): HTMLElement | null => {
    // If parent is unexpectedly an array or NodeList (e.g. from a jQuery object), use the first element
    if (parent && (Array.isArray(parent) || parent instanceof NodeList || (parent.length !== undefined && parent[0]))) {
        parent = parent[0];
    }
    return (parent && typeof parent.querySelector === 'function') ? (parent.querySelector(selector) as HTMLElement | null) : null;
};

export const getAllDescendants = (selector: string, parent: Element | Document | any = document): HTMLElement[] => {
    if (parent && (Array.isArray(parent) || parent instanceof NodeList || (parent.length !== undefined && parent[0]))) {
        parent = parent[0];
    }
    return (parent && typeof parent.querySelectorAll === 'function') ? Array.from(parent.querySelectorAll(selector)) as HTMLElement[] : [];
};

export const addClass = (className: string, element: Element | Element[] | NodeListOf<Element>): void => {
    const cls = className.split(' ').filter(c => c.trim());
    applyTo(element, (el: HTMLElement) => {
        el.classList.add(...cls);
    });
};

export const removeClass = (className: string, element: Element | Element[] | NodeListOf<Element>): void => {
    const cls = className.split(' ').filter(c => c.trim());
    applyTo(element, (el: HTMLElement) => {
        el.classList.remove(...cls);
    });
};

export const removeClassByPrefix = (element: Element | Element[] | NodeListOf<Element>, classNamePrefix: string): void => {
    applyTo(element, (el: HTMLElement) => {
        Array.from(el.classList).forEach((className: string) => {
            if (className.startsWith(classNamePrefix)) {
                el.classList.remove(className);
            }
        });
    });
};

export const hasClass = (className: string, element: HTMLElement): boolean => {
    return element.classList.contains(className);
};

export const showElement = (element: Element | Element[] | NodeListOf<Element>): void => {
    applyTo(element, (el: HTMLElement) => {
        el.style.display = 'block';
    });
};

export const hideElement = (element: Element | Element[] | NodeListOf<Element>): void => {
    applyTo(element, (el: HTMLElement) => {
        el.style.display = 'none';
    });
};

export const addEvent = (
    element: Element | Element[] | NodeListOf<Element> | Window | Document,
    event: keyof HTMLElementEventMap | keyof WindowEventMap,
    listener: EventCallback
): void => {
    if (element instanceof Window || element instanceof Document) {
        element.addEventListener(event, listener);
    } else {
        applyTo(element, (el: HTMLElement) => {
            el.addEventListener(event, listener);
        });
    }
};

export const dispatchEvent = (element: HTMLElement, eventName: string, data?: CustomEventInit): boolean => {
    return element.dispatchEvent(new CustomEvent(eventName, data));
};

export const getAttribute = (element: HTMLElement, attributeName: string): string | null => {
    return element.getAttribute(attributeName);
};

export const setAttribute = (el: HTMLElement, attributeName: string, value: string): void => {
    el.setAttribute(attributeName, value);
};

export const getElementHeight = (element: HTMLElement): string => {
    const computedStyle = window.getComputedStyle(element);
    return computedStyle.height;
};

export const setElementHeight = (element: HTMLElement, value: string): void => {
    element.style.height = value;
};

export const setElementWidth = (element: HTMLElement, value: string): void => {
    element.style.width = value;
};

export const getElementWidth = (element: HTMLElement): number => {
    return element.offsetWidth;
};

export const setHtml = (element: HTMLElement, content: string): void => {
    element.innerHTML = content;
};

export const appendHTML = (element: HTMLElement, content: string): void => {
    element.innerHTML = element.innerHTML + content;
};

export const prependHTML = (element: HTMLElement, content: string): void => {
    element.innerHTML = content + element.innerHTML;
};

export const appendElement = (element: HTMLElement, content: HTMLElement): void => {
    element.insertAdjacentElement('beforebegin', content);
};

export const prependElement = (element: HTMLElement, content: HTMLElement): void => {
    element.insertAdjacentElement('afterend', content);
};

export const triggerEvent = (el: HTMLElement, eventName: string, data = {}): boolean => {
    return el.dispatchEvent(new CustomEvent(eventName, data));
};

export const deepMerge = <T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T => {
    if (!sources.length) return target;
    const source = sources.shift();

    if (source) {
        for (const key in source) {
            const sourceValue = source[key];
            const targetValue = target[key];

            if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
                // Always create a fresh object so we never mutate shared references
                const base = (targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue))
                    ? targetValue
                    : {} as T[Extract<keyof T, string>];
                target[key] = deepMerge({ ...base }, sourceValue);
            } else if (sourceValue !== undefined) {
                target[key] = sourceValue as T[Extract<keyof T, string>];
            }
        }
    }

    return deepMerge(target, ...sources);
};

export const mergeOptions = (target: WizardOptions, ...sources: Partial<WizardOptions>[]): WizardOptions => {
    if (!sources.length) return target;
    const source = sources.shift();

    if (source) {
        for (const key in source) {
            const k = key as keyof WizardOptions;
            const sourceValue = source[k];
            const targetValue = target[k];

            if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue) &&
                targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
                (target[k] as Record<string, unknown>) = deepMerge({ ...targetValue } as Record<string, unknown>, sourceValue as Record<string, unknown>);
            } else if (sourceValue !== undefined) {
                (target[k] as WizardOptions[keyof WizardOptions]) = sourceValue;
            }
        }
    }

    return mergeOptions(target, ...sources);
};
