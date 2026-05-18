import { WizardEvents, EventCallback } from './types';

/**
 * Event emitter for SmartWizard
 */
export class EventEmitter {
    private listeners: Partial<
        Record<keyof WizardEvents, Set<EventCallback>>
    > = {};

    constructor(private readonly target: HTMLElement) { }

    on<K extends keyof WizardEvents>(
        eventName: K,
        callback: EventCallback<WizardEvents[K]>
    ): this {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = new Set();
        }
        this.listeners[eventName]!.add(callback as EventCallback);
        return this;
    }

    off<K extends keyof WizardEvents>(
        eventName: K,
        callback?: EventCallback<WizardEvents[K]>
    ): this {
        const set = this.listeners[eventName];
        if (!set) return this;
        if (callback) {
            set.delete(callback as EventCallback);
        } else {
            set.clear();
        }
        return this;
    }

    once<K extends keyof WizardEvents>(
        eventName: K,
        callback: EventCallback<WizardEvents[K]>
    ): this {
        const wrapper: EventCallback<WizardEvents[K]> = (event) => {
            callback(event);
            this.off(eventName, wrapper);
        };
        return this.on(eventName, wrapper);
    }

    emit<K extends keyof WizardEvents>(
        eventName: K,
        detail?: WizardEvents[K],
        options: EventInit = {}
    ): boolean {
        const event = new CustomEvent<WizardEvents[K]>(eventName, {
            detail,
            bubbles: options.bubbles ?? true,
            cancelable: options.cancelable ?? false,
        });

        // Notify internal listeners first
        this.listeners[eventName]?.forEach(cb => cb(event));

        // Then dispatch on the DOM element for external listeners
        this.target.dispatchEvent(event);

        return !event.defaultPrevented;
    }

    /** Remove all internal listener sets — called during destroy(). */
    clear(): void {
        this.listeners = {};
    }
}
