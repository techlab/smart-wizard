/**
 * Internal DOM event binder for SmartWizard.
 */

type BoundEntry = {
    target: EventTarget;
    type: string;
    handler: EventListenerOrEventListenerObject;
    options?: AddEventListenerOptions | boolean;
};

export class EventBinder {
    private bound: BoundEntry[] = [];

    /**
     * Add an event listener and record it for later cleanup.
     */
    bind(
        target: EventTarget,
        type: string,
        handler: EventListenerOrEventListenerObject,
        options?: AddEventListenerOptions | boolean
    ): void {
        target.addEventListener(type, handler, options);
        this.bound.push({ target, type, handler, options });
    }

    /**
     * Remove all previously bound listeners and clear the registry.
     * Safe to call multiple times.
     */
    unbindAll(): void {
        for (const { target, type, handler, options } of this.bound) {
            target.removeEventListener(type, handler, options);
        }
        this.bound = [];
    }
}
