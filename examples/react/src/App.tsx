import { useRef, useState, useEffect, useCallback } from "react";
import { useSmartWizard } from "@smart-wizard/react";
import "./App.css";

// ── Constants ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "swx-example-theme";

const themeList: Record<string, string> = {
    "": "Default",
    arrows: "Arrows",
    pills: "Pills",
};

const colorList: Record<string, string> = {
    "": "Default",
    ocean: "Ocean",
    teal: "Teal",
    forest: "Forest",
    violet: "Violet",
    crimson: "Crimson",
    amber: "Amber",
    indigo: "Indigo",
    slate: "Slate",
    purple: "Purple",
    green: "Green",
};

const cssAnimationList: Record<string, object> = {
    cssSlideH: { prefix: "animate__animated animate__faster", forward: { show: "animate__slideInLeft", hide: "animate__slideOutRight" }, backward: { show: "animate__slideInRight", hide: "animate__slideOutLeft" } },
    cssSlideV: { prefix: "animate__animated animate__faster", forward: { show: "animate__slideInDown", hide: "animate__slideOutDown" }, backward: { show: "animate__slideInUp", hide: "animate__slideOutUp" } },
    cssFade: { prefix: "animate__animated animate__faster", forward: { show: "animate__fadeIn", hide: "animate__fadeOut" }, backward: { show: "animate__fadeIn", hide: "animate__fadeOut" } },
    cssFadeSlideH: { prefix: "animate__animated animate__faster", forward: { show: "animate__fadeInLeft", hide: "animate__fadeOutRight" }, backward: { show: "animate__fadeInRight", hide: "animate__fadeOutLeft" } },
    cssFadeSlideV: { prefix: "animate__animated animate__faster", forward: { show: "animate__fadeInDown", hide: "animate__fadeOutDown" }, backward: { show: "animate__fadeInUp", hide: "animate__fadeOutUp" } },
    cssFadeSlideCorner1: { prefix: "animate__animated animate__faster", forward: { show: "animate__fadeInTopLeft", hide: "animate__fadeOutBottomRight" }, backward: { show: "animate__fadeInBottomRight", hide: "animate__fadeOutTopLeft" } },
    cssFadeSlideCorner2: { prefix: "animate__animated animate__faster", forward: { show: "animate__fadeInBottomLeft", hide: "animate__fadeOutTopRight" }, backward: { show: "animate__fadeInTopRight", hide: "animate__fadeOutBottomLeft" } },
    cssBounce: { prefix: "animate__animated animate__faster", forward: { show: "animate__bounceIn", hide: "animate__bounceOut" }, backward: { show: "animate__bounceIn", hide: "animate__bounceOut" } },
    cssBounceSlideH: { prefix: "animate__animated animate__faster", forward: { show: "animate__bounceInLeft", hide: "animate__bounceOutRight" }, backward: { show: "animate__bounceInRight", hide: "animate__bounceOutLeft" } },
    cssBounceSlideV: { prefix: "animate__animated animate__faster", forward: { show: "animate__bounceInDown", hide: "animate__bounceOutDown" }, backward: { show: "animate__bounceInUp", hide: "animate__bounceOutUp" } },
    cssBackSlideH: { prefix: "animate__animated animate__faster", forward: { show: "animate__backInLeft", hide: "animate__backOutRight" }, backward: { show: "animate__backInRight", hide: "animate__backOutLeft" } },
    cssBackSlideV: { prefix: "animate__animated animate__faster", forward: { show: "animate__backInDown", hide: "animate__backOutDown" }, backward: { show: "animate__backInUp", hide: "animate__backOutUp" } },
    cssFlipH: { prefix: "animate__animated animate__faster", forward: { show: "animate__flipInY", hide: "animate__flipOutY" }, backward: { show: "animate__flipInY", hide: "animate__flipOutY" } },
    cssFlipV: { prefix: "animate__animated animate__faster", forward: { show: "animate__flipInX", hide: "animate__flipOutX" }, backward: { show: "animate__flipInX", hide: "animate__flipOutX" } },
    cssLightspeed: { prefix: "animate__animated animate__faster", forward: { show: "animate__lightSpeedInLeft", hide: "animate__lightSpeedOutRight" }, backward: { show: "animate__lightSpeedInRight", hide: "animate__lightSpeedOutLeft" } },
    cssRotate: { prefix: "animate__animated animate__faster", forward: { show: "animate__rotateIn", hide: "animate__rotateOut" }, backward: { show: "animate__rotateIn", hide: "animate__rotateOut" } },
    cssRotateClock: { prefix: "animate__animated animate__faster", forward: { show: "animate__rotateInDownLeft", hide: "animate__rotateOutDownLeft" }, backward: { show: "animate__rotateInUpLeft", hide: "animate__rotateOutUpLeft" } },
    cssRotateAntiClock: { prefix: "animate__animated animate__faster", forward: { show: "animate__rotateInDownRight", hide: "animate__rotateOutDownRight" }, backward: { show: "animate__rotateInUpRight", hide: "animate__rotateOutUpRight" } },
    cssZoom: { prefix: "animate__animated animate__faster", forward: { show: "animate__zoomIn", hide: "animate__zoomOut" }, backward: { show: "animate__zoomIn", hide: "animate__zoomOut" } },
};

const transitionList: Record<string, Record<string, string>> = {
    "Built-in": {
        none: "None",
        fade: "Fade",
        slideHorizontal: "Slide Horizontal",
        slideVertical: "Slide Vertical",
        slideSwing: "Slide Swing",
    },
    CSS: {
        cssSlideH: "Slide Horizontal",
        cssSlideV: "Slide Vertical",
        cssFade: "Fade",
        cssFadeSlideH: "Fade + Slide H",
        cssFadeSlideV: "Fade + Slide V",
        cssFadeSlideCorner1: "Fade + Corner 1",
        cssFadeSlideCorner2: "Fade + Corner 2",
        cssBounce: "Bounce",
        cssBounceSlideH: "Bounce + Slide H",
        cssBounceSlideV: "Bounce + Slide V",
        cssBackSlideH: "Back + Slide H",
        cssBackSlideV: "Back + Slide V",
        cssFlipH: "Flip H",
        cssFlipV: "Flip V",
        cssLightspeed: "Lightspeed",
        cssRotate: "Rotate",
        cssRotateClock: "Rotate CW",
        cssRotateAntiClock: "Rotate CCW",
        cssZoom: "Zoom",
    },
};

const demoPages: Record<string, string> = {
    Main: "index.html",
    Ajax: "ajax.html",
    Validation: "validation.html",
    RTL: "rtl.html",
    Multiple: "multiple.html",
};

// ── Dark mode helpers ──────────────────────────────────────────────────────

function osPrefersDark() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getStoredPref(): string {
    return localStorage.getItem(STORAGE_KEY) ?? "auto";
}

function isDarkFromPref(pref: string): boolean {
    return pref === "dark" || (pref === "auto" && osPrefersDark());
}

// ── Main App ───────────────────────────────────────────────────────────────

function App() {
    // ── Wizard 1 (Horizontal Classic) ──
    const wizard1Ref = useRef<HTMLDivElement>(null);
    const { stepInfo: stepInfo1, setOptions: setOptions1 } =
        useSmartWizard(wizard1Ref, {
            transition: {
                effect: "css" as any,
                speed: 400,
                css: cssAnimationList.cssLightspeed as any,
            },
        });

    // ── Wizard 2 (Grouped / Vertical) ──
    const wizard2Ref = useRef<HTMLDivElement>(null);
    const { stepInfo: stepInfo2, setOptions: setOptions2 } =
        useSmartWizard(wizard2Ref, {});

    // ── Shared control state ──
    const [selectedTheme, setSelectedTheme] = useState("");
    const [selectedTransition, setSelectedTransition] = useState("cssLightspeed");
    const [selectedColor, setSelectedColor] = useState("ocean");

    // ── Dark mode state ──
    const [themePref, setThemePref] = useState<string>(getStoredPref);
    const [isDark, setIsDark] = useState<boolean>(() => isDarkFromPref(getStoredPref()));

    // Apply dark/light to body dataset
    useEffect(() => {
        document.body.dataset.uiTheme = isDark ? "dark" : "light";
    }, [isDark]);

    // OS preference change listener
    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e: MediaQueryListEvent) => {
            if (getStoredPref() === "auto") setIsDark(e.matches);
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    const applyThemePref = useCallback(
        (pref: string) => {
            if (pref === "auto") localStorage.removeItem(STORAGE_KEY);
            else localStorage.setItem(STORAGE_KEY, pref);
            const dark = isDarkFromPref(pref);
            setThemePref(pref);
            setIsDark(dark);
            const colorScheme = dark ? "dark" : "light";
            setOptions1?.({ colorScheme });
            setOptions2?.({ colorScheme });
        },
        [setOptions1, setOptions2]
    );

    // ── Control handlers ──
    const handleThemeChange = useCallback(
        (theme: string) => {
            setSelectedTheme(theme);
            setOptions1?.({ theme });
            setOptions2?.({ theme });
        },
        [setOptions1, setOptions2]
    );

    const handleTransitionChange = useCallback(
        (value: string) => {
            setSelectedTransition(value);
            const cssAnim = cssAnimationList[value];
            const opts = cssAnim
                ? { transition: { effect: "css" as any, css: cssAnim as any } }
                : { transition: { effect: value as any } };
            setOptions1?.(opts);
            setOptions2?.(opts);
        },
        [setOptions1, setOptions2]
    );

    const handleColorChange = useCallback(
        (color: string) => {
            setSelectedColor(color);
            setOptions1?.({ color });
            setOptions2?.({ color });
        },
        [setOptions1, setOptions2]
    );

    const progress1 =
        stepInfo1.totalSteps > 0
            ? ((stepInfo1.currentStep + 1) / stepInfo1.totalSteps) * 100
            : 0;
    const progress2 =
        stepInfo2.totalSteps > 0
            ? ((stepInfo2.currentStep + 1) / stepInfo2.totalSteps) * 100
            : 0;

    return (
        <>
            {/* ── Header ── */}
            <header className="demo-header">
                <h1>SmartWizard — Examples</h1>

                {/* Page nav */}
                <nav className="header-right" aria-label="Demo pages">
                    {Object.entries(demoPages).map(([label, href]) => (
                        <a
                            key={label}
                            href={href}
                            className={`header-btn${label === "Main" ? " active" : ""}`}
                        >
                            {label}
                        </a>
                    ))}
                </nav>

                {/* Dark mode toggle */}
                <div className="header-right">
                    <div className="toggle-btn-group" role="group" aria-label="Color scheme">
                        {(["auto", "dark", "light"] as const).map((mode) => (
                            <button
                                key={mode}
                                className={`header-btn${themePref === mode ? " active" : ""}`}
                                onClick={() => applyThemePref(mode)}
                            >
                                {mode === "auto" ? "⚡Auto" : mode === "dark" ? "🌙 Dark" : "☀️ Light"}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* ── Controls bar ── */}
            <div className="demo-controls">
                <div className="demo-control-wrapper">

                    {/* Theme */}
                    <div className="control-group">
                        <label className="control-label" htmlFor="theme-select">Theme:</label>
                        <select
                            id="theme-select"
                            className="ctrl-select"
                            value={selectedTheme}
                            onChange={(e) => handleThemeChange(e.target.value)}
                        >
                            {Object.entries(themeList).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="ctrl-divider" />

                    {/* Animation */}
                    <div className="control-group">
                        <label className="control-label" htmlFor="transition-select">Animation:</label>
                        <select
                            id="transition-select"
                            className="ctrl-select"
                            value={selectedTransition}
                            onChange={(e) => handleTransitionChange(e.target.value)}
                        >
                            {Object.entries(transitionList).map(([groupKey, groupItems]) => (
                                <optgroup key={groupKey} label={groupKey}>
                                    {Object.entries(groupItems).map(([key, lbl]) => (
                                        <option key={key} value={key}>{lbl}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    <div className="ctrl-divider" />

                    {/* Color */}
                    <div className="control-group">
                        <span className="control-label">Color:</span>
                        <div className="btn-group" id="color-list">
                            {Object.entries(colorList).map(([key, lbl]) => (
                                <button
                                    key={key}
                                    className={`btn btn-color-theme${selectedColor === key ? " active" : ""}`}
                                    data-color={key || "default"}
                                    onClick={() => handleColorChange(key)}
                                >
                                    {lbl}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="ctrl-divider" />

                    {/* External controls */}
                    <div className="control-group">
                        <label className="control-label">External Controls:</label>
                        <div className="btn-group">
                            <button className="btn btn-prev" onClick={() => { setOptions1?.({ startStep: Math.max(0, stepInfo1.currentStep - 1) }); }}>← Prev</button>
                            <button className="btn btn-next" onClick={() => { setOptions1?.({ startStep: Math.min(stepInfo1.totalSteps - 1, stepInfo1.currentStep + 1) }); }}>Next →</button>
                            <button className="btn btn-reset" onClick={() => { setOptions1?.({ startStep: 0 }); setOptions2?.({ startStep: 0 }); }}>↺ Reset</button>
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Demo Body ── */}
            <div className="demo-body">

                {/* ══ SECTION 1 — Horizontal Navigation (Classic) ══ */}
                <div className="section-block">
                    <div className="section-label">Layout 01</div>
                    <div className="section-title">Horizontal Navigation — Classic</div>
                    <div className="section-desc">All steps visible simultaneously. Numbers + labels + connectors.</div>

                    <div
                        ref={wizard1Ref}
                        id="smartwizard-1"
                        className="sw"
                        data-layout="circular"
                        data-theme="arrows"
                        data-color="ocean"
                        data-start-step="0"
                        role="region"
                        aria-label="Setup Wizard"
                    >
                        {/* Toolbar top */}
                        <div className="sw-toolbar sw-toolbar-top">
                            <div className="sw-toolbar-group">
                                <span className="sw-badge sw-badge-primary" id="step-info-1">
                                    {stepInfo1.totalSteps > 0
                                        ? `Step ${stepInfo1.currentStep + 1} of ${stepInfo1.totalSteps}`
                                        : ""}
                                </span>
                                <div className="sw-toolbar-divider" />
                                <span className="sw-badge sw-badge-warn">⚠ Unsaved</span>
                            </div>
                            <div className="sw-toolbar-group">
                                <button className="sw-btn sw-btn-primary">Primary</button>
                                <button className="sw-btn sw-btn-success">Success</button>
                                <button className="sw-btn sw-btn-warning">Warning</button>
                                <button className="sw-btn sw-btn-info">Info</button>
                                <button type="button" className="sw-btn sw-btn-danger sw-btn-reset">Reset</button>
                                <button type="button" className="sw-btn sw-btn-prev" disabled>Previous</button>
                                <button type="button" className="sw-btn sw-btn-next" disabled>Next</button>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="sw-nav" role="tablist" aria-label="Wizard steps" aria-orientation="horizontal">
                            <div className="sw-nav-item done" data-step="1" role="tab" aria-selected="false" tabIndex={-1}>
                                <div className="badge">✓</div>
                                <div className="info">
                                    <span className="title">Account</span>
                                    <span className="desc">Personal details</span>
                                </div>
                            </div>
                            <div className="sw-nav-item active" data-step="2" role="tab" aria-controls="sw1-panel-2">
                                <div className="badge">2</div>
                                <div className="info">
                                    <span className="title">Address</span>
                                    <span className="desc">Location info</span>
                                </div>
                            </div>
                            <div className="sw-nav-item" data-step="2" role="tab" aria-controls="sw1-panel-3">
                                <div className="badge">3</div>
                                <div className="info">
                                    <span className="title">Payment</span>
                                    <span className="desc">Billing details</span>
                                </div>
                            </div>
                            <div className="sw-nav-item" data-step="3" role="tab" aria-controls="sw1-panel-4">
                                <div className="badge">4</div>
                                <div className="info">
                                    <span className="title">Review</span>
                                    <span className="desc">Confirmation</span>
                                </div>
                            </div>
                            <div className="sw-nav-item" data-step="4" role="tab" aria-controls="sw1-panel-5">
                                <div className="badge">5</div>
                                <div className="info">
                                    <span className="title">Finish</span>
                                    <span className="desc">Done!</span>
                                </div>
                            </div>
                        </nav>

                        {/* Content panels */}
                        <div className="sw-panels">
                            <section className="sw-panel active" id="sw1-panel-1" role="tabpanel" hidden>
                                <div className="sw-title">Account Details</div>
                                <div className="sw-desc">Enter your personal information to get started.</div>
                                <div className="sw-field-row">
                                    <div className="sw-field"><label>First Name</label><input type="text" placeholder="Jane" className="sw-input" /></div>
                                    <div className="sw-field"><label>Last Name</label><input type="text" placeholder="Doe" className="sw-input" /></div>
                                </div>
                                <div className="sw-field-row">
                                    <div className="sw-field"><label>Email</label><input type="email" placeholder="jane@example.com" className="sw-input" /></div>
                                    <div className="sw-field"><label>Phone</label><input type="tel" placeholder="+1 555 0100" className="sw-input" /></div>
                                </div>
                            </section>

                            <section className="sw-panel" id="sw1-panel-2" role="tabpanel" hidden>
                                <div className="sw-title">Address</div>
                                <div className="sw-desc">Enter the address where you'd like your order delivered.</div>
                                <div className="sw-field-row">
                                    <div className="sw-field"><label>First Name</label><input type="text" placeholder="Jane" className="sw-input" /></div>
                                    <div className="sw-field"><label>Last Name</label><input type="text" placeholder="Doe" className="sw-input" /></div>
                                </div>
                                <div className="sw-field-row">
                                    <div className="sw-field"><label>Street Address</label><input type="text" placeholder="123 Main St" className="sw-input" /></div>
                                    <div className="sw-field"><label>City</label><input type="text" placeholder="New York" className="sw-input" /></div>
                                </div>
                            </section>

                            <section className="sw-panel" id="sw1-panel-3" role="tabpanel" hidden>
                                <div className="sw-title">Payment</div>
                                <div className="sw-desc">Enter your billing details.</div>
                                <div className="sw-field-row">
                                    <div className="sw-field"><label>Card Number</label><input type="text" placeholder="4242 4242 4242 4242" className="sw-input" /></div>
                                    <div className="sw-field"><label>Name on Card</label><input type="text" placeholder="Jane Doe" className="sw-input" /></div>
                                </div>
                                <div className="sw-field-row">
                                    <div className="sw-field"><label>Expiry</label><input type="text" placeholder="MM / YY" className="sw-input" /></div>
                                    <div className="sw-field"><label>CVV</label><input type="text" placeholder="123" className="sw-input" /></div>
                                </div>
                            </section>

                            <section className="sw-panel" id="sw1-panel-4" role="tabpanel" hidden>
                                <div className="sw-title">Review</div>
                                <div className="sw-desc">Please review your order before submitting.</div>
                                <dl className="summary-box">
                                    <dt>Name</dt><dd>Jane Doe</dd>
                                    <dt>Address</dt><dd>123 Main St, New York</dd>
                                    <dt>Payment</dt><dd>Visa &#8226;&#8226;&#8226;&#8226; 4242</dd>
                                </dl>
                            </section>

                            <section className="sw-panel" id="sw1-panel-5" role="tabpanel" hidden>
                                <div className="sw-title">All Done! 🎉</div>
                                <div className="sw-desc">Your order has been placed successfully. Thank you!</div>
                            </section>
                        </div>

                        {/* Toolbar bottom */}
                        <div className="sw-toolbar sw-toolbar-bottom">
                            <div className="sw-toolbar-group">
                                <button className="sw-btn sw-btn-outline sw-btn-prev" data-action="prev">← Back</button>
                            </div>
                            <div className="sw-toolbar-group">
                                <div className="sw-progress">
                                    <div
                                        className="sw-progress-bar"
                                        role="progressbar"
                                        style={{ width: `${progress1}%` }}
                                        aria-valuenow={progress1}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                    />
                                </div>
                            </div>
                            <div className="sw-toolbar-group">
                                <button className="sw-btn sw-btn-ghost sw-btn-skip" data-action="skip">Skip</button>
                                <button className="sw-btn sw-btn-primary sw-btn-next" data-action="next">Next →</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══ SECTION 2 — Grouped Navigation ══ */}
                <div className="section-block">
                    <div className="section-label">Layout 02</div>
                    <div className="section-title">Navigation — Grouped</div>
                    <div className="section-desc">Steps organised into named groups with a vertical sidebar layout.</div>

                    <div
                        ref={wizard2Ref}
                        id="smartwizard-2"
                        className="sw"
                        data-layout="vertical"
                        data-theme="arrows"
                        data-nav="classic"
                        data-progress="segmented"
                        data-start-step="0"
                        aria-label="Setup Wizard"
                    >
                        {/* Toolbar top */}
                        <div className="sw-toolbar sw-toolbar-top">
                            <div className="sw-toolbar-group">
                                <span className="sw-badge sw-badge-info" id="step-info-2">
                                    {stepInfo2.totalSteps > 0
                                        ? `Step ${stepInfo2.currentStep + 1} of ${stepInfo2.totalSteps}`
                                        : ""}
                                </span>
                                <div className="sw-toolbar-divider" />
                                <span className="sw-badge sw-badge-warn">⚠ Unsaved</span>
                            </div>
                            <div className="sw-toolbar-group">
                                <button className="sw-btn sw-btn-primary">Primary</button>
                                <button className="sw-btn sw-btn-success">Success</button>
                                <button className="sw-btn sw-btn-warning">Warning</button>
                                <button className="sw-btn sw-btn-info">Info</button>
                                <button type="button" className="sw-btn sw-btn-danger sw-btn-reset">Reset</button>
                                <button type="button" className="sw-btn sw-btn-prev" disabled>Previous</button>
                                <button type="button" className="sw-btn sw-btn-next" disabled>Next</button>
                            </div>
                        </div>

                        {/* Grouped Navigation */}
                        <nav className="sw-nav" role="tablist" aria-label="Wizard steps" aria-orientation="horizontal">
                            {/* Group A */}
                            <div className="sw-nav-item-group">
                                <span className="sw-group-header">Group A</span>
                                <div className="sw-nav-item" data-step="1" role="tab" aria-selected="false" tabIndex={-1}>
                                    <div className="badge">✓</div>
                                    <div className="info">
                                        <span className="title">Account</span>
                                        <span className="desc">Personal details</span>
                                    </div>
                                </div>
                                <div className="sw-nav-item" data-step="2" role="tab" aria-controls="sw2-panel-2">
                                    <div className="badge">2</div>
                                    <div className="info">
                                        <span className="title">Address</span>
                                        <span className="desc">Location info</span>
                                    </div>
                                </div>
                            </div>

                            {/* Group B */}
                            <div className="sw-nav-item-group">
                                <span className="sw-group-header">Group B</span>
                                <div className="sw-nav-item" data-step="3" role="tab" aria-controls="sw2-panel-3">
                                    <div className="badge">3</div>
                                    <div className="info">
                                        <span className="title">Payment</span>
                                        <span className="desc">Billing details</span>
                                    </div>
                                </div>
                                <div className="sw-nav-item" data-step="4" role="tab" aria-controls="sw2-panel-4">
                                    <div className="badge">4</div>
                                    <div className="info">
                                        <span className="title">Review</span>
                                        <span className="desc">Confirmation</span>
                                    </div>
                                </div>
                                <div className="sw-nav-item" data-step="5" role="tab" aria-controls="sw2-panel-5">
                                    <div className="badge">5</div>
                                    <div className="info">
                                        <span className="title">Finish</span>
                                        <span className="desc">Done!</span>
                                    </div>
                                </div>
                            </div>

                            {/* Group C */}
                            <div className="sw-nav-item-group">
                                <span className="sw-group-header">Group C</span>
                                <div className="sw-nav-item" data-step="6" role="tab" aria-controls="sw2-panel-6">
                                    <div className="badge">10</div>
                                    <div className="info">
                                        <span className="title">Extra E</span>
                                        <span className="desc">This is extra for testing!</span>
                                    </div>
                                </div>
                                <div className="sw-nav-item" data-step="7" role="tab" aria-controls="sw2-panel-7">
                                    <div className="badge">11</div>
                                    <div className="info">
                                        <span className="title">Extra F</span>
                                        <span className="desc">This is extra for testing!</span>
                                    </div>
                                </div>
                            </div>
                        </nav>

                        {/* Content panels */}
                        <div className="sw-panels">
                            <section className="sw-panel active" id="sw2-panel-1" role="tabpanel" hidden>
                                <div className="sw-title">AA Address</div>
                                <div className="sw-desc">Enter the address where you'd like your order delivered.</div>
                                <div className="sw-field-row">
                                    <div className="sw-field"><label>First Name</label><input type="text" placeholder="Jane" className="sw-input" /></div>
                                    <div className="sw-field"><label>Last Name</label><input type="text" placeholder="Doe" className="sw-input" /></div>
                                </div>
                                <div className="sw-field-row">
                                    <div className="sw-field"><label>Street Address</label><input type="text" placeholder="123 Main St" className="sw-input" /></div>
                                    <div className="sw-field"><label>City</label><input type="text" placeholder="New York" className="sw-input" /></div>
                                </div>
                            </section>
                            <section className="sw-panel" id="sw2-panel-2" role="tabpanel" hidden>
                                <div className="sw-title">BB Address</div>
                                <div className="sw-desc">Enter the address where you'd like your order delivered.</div>
                                <div className="sw-field-row">
                                    <div className="sw-field"><label>First Name</label><input type="text" placeholder="Jane" className="sw-input" /></div>
                                    <div className="sw-field"><label>Last Name</label><input type="text" placeholder="Doe" className="sw-input" /></div>
                                </div>
                            </section>
                            <section className="sw-panel" id="sw2-panel-3" role="tabpanel" hidden>
                                <div className="sw-title">CC Address</div>
                                <div className="sw-desc">Enter the address where you'd like your order delivered.</div>
                                <div className="sw-field-row">
                                    <div className="sw-field"><label>First Name</label><input type="text" placeholder="Jane" className="sw-input" /></div>
                                    <div className="sw-field"><label>Last Name</label><input type="text" placeholder="Doe" className="sw-input" /></div>
                                </div>
                                <div className="sw-field-row">
                                    <div className="sw-field"><label>Street Address</label><input type="text" placeholder="123 Main St" className="sw-input" /></div>
                                    <div className="sw-field"><label>City</label><input type="text" placeholder="New York" className="sw-input" /></div>
                                </div>
                            </section>
                            <section className="sw-panel" id="sw2-panel-4" role="tabpanel" hidden>
                                <div className="sw-title">DDD Address</div>
                                <div className="sw-desc">Enter the address where you'd like your order delivered.</div>
                                <div className="sw-field-row">
                                    <div className="sw-field"><label>First Name</label><input type="text" placeholder="Jane" className="sw-input" /></div>
                                    <div className="sw-field"><label>Last Name</label><input type="text" placeholder="Doe" className="sw-input" /></div>
                                </div>
                                <div className="sw-field-row">
                                    <div className="sw-field"><label>Street Address</label><input type="text" placeholder="123 Main St" className="sw-input" /></div>
                                    <div className="sw-field"><label>City</label><input type="text" placeholder="New York" className="sw-input" /></div>
                                </div>
                            </section>
                            <section className="sw-panel" id="sw2-panel-5" role="tabpanel" hidden>
                                <div className="sw-title">Finish</div>
                                <div className="sw-desc">All done! Your wizard is complete.</div>
                            </section>
                            <section className="sw-panel" id="sw2-panel-6" role="tabpanel" hidden>
                                <div className="sw-title">Extra E</div>
                                <div className="sw-desc">This is extra for testing!</div>
                            </section>
                            <section className="sw-panel" id="sw2-panel-7" role="tabpanel" hidden>
                                <div className="sw-title">Extra F</div>
                                <div className="sw-desc">This is extra for testing!</div>
                            </section>
                        </div>

                        {/* Toolbar bottom */}
                        <div className="sw-toolbar sw-toolbar-bottom">
                            <div className="sw-toolbar-group">
                                <button className="sw-btn sw-btn-outline sw-btn-prev" data-action="prev">← Back</button>
                            </div>
                            <div className="sw-toolbar-group">
                                <div className="sw-progress">
                                    <div
                                        className="sw-progress-bar"
                                        role="progressbar"
                                        style={{ width: `${progress2}%` }}
                                        aria-valuenow={progress2}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                    />
                                </div>
                            </div>
                            <div className="sw-toolbar-group">
                                <button className="sw-btn sw-btn-ghost sw-btn-skip" data-action="skip">Skip</button>
                                <button className="sw-btn sw-btn-primary sw-btn-next" data-action="next">Next →</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

export default App;
