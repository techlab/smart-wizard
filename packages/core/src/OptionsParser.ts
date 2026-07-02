import { WizardOptions, WizardLayout, ColorScheme } from './types';
import { mergeOptions } from './util';
import { defaultOptions } from './options';
import { DATA_ATTRIBUTES, LAYOUT } from './constants';

/**
 * Parses and merges SmartWizard options from defaults, caller-supplied values,
 * and data attributes on the root element.
 */
export class OptionsParser {
    /**
     * Produce a fully-resolved `WizardOptions` object.
     * Priority (highest wins): data attributes > caller options > defaults.
     */
    static parse(el: HTMLElement, supplied?: Partial<WizardOptions>): WizardOptions {
        // Start from a fully isolated copy of defaults — never mutate the shared defaultOptions object.
        const base = structuredClone(defaultOptions) as WizardOptions;
        let opts = mergeOptions(base, supplied ?? {});

        const overrides = OptionsParser.fromAttributes(el, opts);
        if (Object.keys(overrides).length > 0) {
            opts = mergeOptions(opts, overrides);
        }

        return opts;
    }

    /** Read supported data attributes from the element and return them as option overrides. */
    private static fromAttributes(el: HTMLElement, base: WizardOptions): Partial<WizardOptions> {
        const overrides: Partial<WizardOptions> = {};

        const layout = el.getAttribute(DATA_ATTRIBUTES.LAYOUT);
        if (layout !== null && (Object.values(LAYOUT) as string[]).includes(layout)) {
            overrides.layout = layout as WizardLayout;
        }

        const theme = el.getAttribute(DATA_ATTRIBUTES.THEME);
        if (theme !== null) overrides.theme = theme;

        const colorScheme = el.getAttribute(DATA_ATTRIBUTES.COLOR_SCHEME);
        if (colorScheme !== null) overrides.colorScheme = colorScheme as ColorScheme;

        const color = el.getAttribute(DATA_ATTRIBUTES.COLOR);
        if (color !== null) overrides.color = color;

        const transition = el.getAttribute(DATA_ATTRIBUTES.TRANSITION);
        if (transition !== null) {
            overrides.transition = { ...base.transition, effect: transition };
        }

        return overrides;
    }
}
