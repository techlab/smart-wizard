import {
    WizardInterface, WizardExtension,
    ExtensionBeforeShowArgs, ExtensionAfterShowArgs
} from './types';

const UNSAFE_NAMES = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Manages extension registration and lifecycle hook dispatch for SmartWizard.
 */
export class ExtensionRegistry {
    private extensions: WizardExtension[] = [];

    /**
     * Validate, deduplicate, register extensions and fire `onInstall` immediately.
     * Returns `this` so callers can chain.
     */
    register(wizard: WizardInterface, ...exts: WizardExtension[]): this {
        for (const ext of exts) {
            if (typeof ext !== 'object' || ext === null) {
                console.warn('SmartWizard: extension must be a plain object — skipping');
                continue;
            }
            const name = ext.name;
            if (typeof name !== 'string' || !name.trim() || UNSAFE_NAMES.has(name)) {
                console.warn('SmartWizard: extension must have a valid non-empty name — skipping');
                continue;
            }
            if (this.extensions.find(x => x.name === name)) {
                console.warn(`SmartWizard: extension "${name}" is already registered — skipping`);
                continue;
            }
            this.extensions.push(ext);
            if (typeof ext.onInstall === 'function') {
                try {
                    ext.onInstall(wizard);
                } catch (err) {
                    console.error(`SmartWizard: extension "${name}" threw in onInstall:`, err);
                }
            }
        }
        return this;
    }

    /**
     * Run a synchronous lifecycle hook across all registered extensions in order.
     * Exceptions are caught per-extension so one failure does not block the rest.
     */
    runSync(hook: 'onInit' | 'onLoad' | 'onDestroy', wizard: WizardInterface): void;
    runSync(hook: 'onAfterShow', wizard: WizardInterface, args: ExtensionAfterShowArgs): void;
    runSync(hook: string, wizard: WizardInterface, args?: unknown): void {
        for (const ext of this.extensions) {
            const fn = (ext as unknown as Record<string, unknown>)[hook];
            if (typeof fn !== 'function') continue;
            try {
                (fn as Function).call(ext, wizard, args);
            } catch (err) {
                console.error(`SmartWizard: extension "${ext.name}" threw in ${hook}:`, err);
            }
        }
    }

    /**
     * Run `onBeforeShow` across all extensions.
     * Supports async handlers. Returns `false` if any extension cancels navigation.
     */
    async runBeforeShow(wizard: WizardInterface, args: ExtensionBeforeShowArgs): Promise<boolean> {
        for (const ext of this.extensions) {
            if (typeof ext.onBeforeShow !== 'function') continue;
            try {
                const result = await ext.onBeforeShow(wizard, args);
                if (result === false) return false;
            } catch (err) {
                console.error(`SmartWizard: extension "${ext.name}" threw in onBeforeShow:`, err);
            }
        }
        return true;
    }

    /** Remove all registered extensions — called during destroy(). */
    clear(): void {
        this.extensions = [];
    }
}
