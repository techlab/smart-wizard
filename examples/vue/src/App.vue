<template>
  <!-- ── Header ── -->
  <header class="demo-header">
    <h1>SmartWizard — Examples</h1>

    <!-- Page nav -->
    <nav class="header-right" aria-label="Demo pages">
      <a
        v-for="(href, label) in demoPages"
        :key="label"
        :href="href"
        :class="['header-btn', { active: label === 'Main' }]"
      >
        {{ label }}
      </a>
    </nav>

    <!-- Dark mode toggle -->
    <div class="header-right">
      <div class="toggle-btn-group" role="group" aria-label="Color scheme">
        <button
          v-for="mode in (['auto', 'dark', 'light'] as const)"
          :key="mode"
          :class="['header-btn', { active: themePref === mode }]"
          @click="applyThemePref(mode)"
        >
          {{ mode === 'auto' ? '⚡Auto' : mode === 'dark' ? '🌙 Dark' : '☀️ Light' }}
        </button>
      </div>
    </div>
  </header>

  <!-- ── Controls bar ── -->
  <div class="demo-controls">
    <div class="demo-control-wrapper">
      <!-- Theme -->
      <div class="control-group">
        <label class="control-label" for="theme-select">Theme:</label>
        <select
          id="theme-select"
          class="ctrl-select"
          :value="selectedTheme"
          @change="handleThemeChange"
        >
          <option
            v-for="(label, key) in themeList"
            :key="key"
            :value="key"
          >
            {{ label }}
          </option>
        </select>
      </div>

      <div class="ctrl-divider" />

      <!-- Animation -->
      <div class="control-group">
        <label class="control-label" for="transition-select">Animation:</label>
        <select
          id="transition-select"
          class="ctrl-select"
          :value="selectedTransition"
          @change="handleTransitionChange"
        >
          <optgroup
            v-for="(groupItems, groupKey) in transitionList"
            :key="groupKey"
            :label="groupKey"
          >
            <option
              v-for="(lbl, key) in groupItems"
              :key="key"
              :value="key"
            >
              {{ lbl }}
            </option>
          </optgroup>
        </select>
      </div>

      <div class="ctrl-divider" />

      <!-- Color -->
      <div class="control-group">
        <span class="control-label">Color:</span>
        <div class="btn-group" id="color-list">
          <button
            v-for="(lbl, key) in colorList"
            :key="key"
            :class="['sw btn btn-color-theme', { active: selectedColor === key }]"
            :data-color="key || 'default'"
            @click="handleColorChange(key)"
          >
            {{ lbl }}
          </button>
        </div>
      </div>

      <div class="ctrl-divider" />

      <!-- External controls -->
      <div class="control-group">
        <label class="control-label">External Controls:</label>
        <div class="btn-group">
          <button class="btn btn-prev" @click="handlePrev">← Prev</button>
          <button class="btn btn-next" @click="handleNext">Next →</button>
          <button class="btn btn-reset" @click="handleReset">↺ Reset</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Demo Body ── -->
  <div class="demo-body">
    <!-- ══ SECTION 1 — Horizontal Navigation (Classic) ══ -->
    <div class="section-block">
      <div class="section-label">Layout 01</div>
      <div class="section-title">Horizontal Navigation — Classic</div>
      <div class="section-desc">All steps visible simultaneously. Numbers + labels + connectors.</div>

      <div
        ref="wizard1Ref"
        id="smartwizard-1"
        class="sw"
        data-layout="circular"
        data-theme="arrows"
        data-color="ocean"
        data-start-step="0"
        role="region"
        aria-label="Setup Wizard"
      >
        <!-- Toolbar top -->
        <div class="sw-toolbar sw-toolbar-top">
          <div class="sw-toolbar-group">
            <span class="sw-badge sw-badge-primary" id="step-info-1">
              {{ stepInfo1.totalSteps > 0 ? `Step ${stepInfo1.currentStep + 1} of ${stepInfo1.totalSteps}` : '' }}
            </span>
            <div class="sw-toolbar-divider" />
            <span class="sw-badge sw-badge-warn">⚠ Unsaved</span>
          </div>
          <div class="sw-toolbar-group">
            <button class="sw-btn sw-btn-primary">Primary</button>
            <button class="sw-btn sw-btn-success">Success</button>
            <button class="sw-btn sw-btn-warning">Warning</button>
            <button class="sw-btn sw-btn-info">Info</button>
            <button type="button" class="sw-btn sw-btn-danger sw-btn-reset">Reset</button>
            <button type="button" class="sw-btn sw-btn-prev" disabled>Previous</button>
            <button type="button" class="sw-btn sw-btn-next" disabled>Next</button>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="sw-nav" role="tablist" aria-label="Wizard steps" aria-orientation="horizontal">
          <div class="sw-nav-item done" data-step="1" role="tab" aria-selected="false" tabindex="-1">
            <div class="badge">✓</div>
            <div class="info">
              <span class="title">Account</span>
              <span class="desc">Personal details</span>
            </div>
          </div>
          <div class="sw-nav-item active" data-step="2" role="tab" aria-controls="sw1-panel-2">
            <div class="badge">2</div>
            <div class="info">
              <span class="title">Address</span>
              <span class="desc">Location info</span>
            </div>
          </div>
          <div class="sw-nav-item" data-step="2" role="tab" aria-controls="sw1-panel-3">
            <div class="badge">3</div>
            <div class="info">
              <span class="title">Payment</span>
              <span class="desc">Billing details</span>
            </div>
          </div>
          <div class="sw-nav-item" data-step="3" role="tab" aria-controls="sw1-panel-4">
            <div class="badge">4</div>
            <div class="info">
              <span class="title">Review</span>
              <span class="desc">Confirmation</span>
            </div>
          </div>
          <div class="sw-nav-item" data-step="4" role="tab" aria-controls="sw1-panel-5">
            <div class="badge">5</div>
            <div class="info">
              <span class="title">Finish</span>
              <span class="desc">Done!</span>
            </div>
          </div>
        </nav>

        <!-- Content panels -->
        <div class="sw-panels">
          <section class="sw-panel active" id="sw1-panel-1" role="tabpanel" hidden>
            <div class="sw-title">Account Details</div>
            <div class="sw-desc">Enter your personal information to get started.</div>
            <div class="sw-field-row">
              <div class="sw-field"><label>First Name</label><input type="text" placeholder="Jane" class="sw-input" /></div>
              <div class="sw-field"><label>Last Name</label><input type="text" placeholder="Doe" class="sw-input" /></div>
            </div>
            <div class="sw-field-row">
              <div class="sw-field"><label>Email Address</label><input type="email" placeholder="jane@example.com" class="sw-input" /></div>
              <div class="sw-field"><label>Phone Number</label><input type="tel" placeholder="+1 (555) 000-0000" class="sw-input" /></div>
            </div>
          </section>

          <section class="sw-panel" id="sw1-panel-2" role="tabpanel" hidden>
            <div class="sw-title">Address</div>
            <div class="sw-desc">Enter the address where you'd like your order delivered.</div>
            <div class="sw-field-row">
              <div class="sw-field"><label>First Name</label><input type="text" placeholder="Jane" class="sw-input" /></div>
              <div class="sw-field"><label>Last Name</label><input type="text" placeholder="Doe" class="sw-input" /></div>
            </div>
            <div class="sw-field-row">
              <div class="sw-field"><label>Street Address</label><input type="text" placeholder="123 Main St" class="sw-input" /></div>
              <div class="sw-field"><label>City</label><input type="text" placeholder="New York" class="sw-input" /></div>
            </div>
          </section>

          <section class="sw-panel" id="sw1-panel-3" role="tabpanel" hidden>
            <div class="sw-title">Payment</div>
            <div class="sw-desc">Provide payment details to complete your order.</div>
            <div class="sw-field-row">
              <div class="sw-field"><label>Card Number</label><input type="text" placeholder="4242 4242 4242 4242" class="sw-input" /></div>
              <div class="sw-field"><label>Name on Card</label><input type="text" placeholder="Jane Doe" class="sw-input" /></div>
            </div>
            <div class="sw-field-row">
              <div class="sw-field"><label>Expiry</label><input type="text" placeholder="MM / YY" class="sw-input" /></div>
              <div class="sw-field"><label>CVV</label><input type="text" placeholder="123" class="sw-input" /></div>
            </div>
          </section>

          <section class="sw-panel" id="sw1-panel-4" role="tabpanel" hidden>
            <div class="sw-title">Review</div>
            <div class="sw-desc">Please review your order before submitting.</div>
            <dl class="summary-box">
              <dt>Name</dt><dd>Jane Doe</dd>
              <dt>Address</dt><dd>123 Main St, New York</dd>
              <dt>Payment</dt><dd>Visa •••• 4242</dd>
            </dl>
          </section>

          <section class="sw-panel" id="sw1-panel-5" role="tabpanel" hidden>
            <div class="sw-title">All Done! 🎉</div>
            <div class="sw-desc">Your order has been placed successfully. Thank you!</div>
          </section>
        </div>

        <!-- Toolbar bottom -->
        <div class="sw-toolbar sw-toolbar-bottom">
          <div class="sw-toolbar-group">
            <button class="sw-btn sw-btn-outline sw-btn-prev" data-action="prev">← Back</button>
          </div>
          <div class="sw-toolbar-group">
            <div class="sw-progress">
              <div
                class="sw-progress-bar"
                role="progressbar"
                :style="{ width: `${progress1}%` }"
                :aria-valuenow="progress1"
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
          </div>
          <div class="sw-toolbar-group">
            <button class="sw-btn sw-btn-ghost sw-btn-skip" data-action="skip">Skip</button>
            <button class="sw-btn sw-btn-primary sw-btn-next" data-action="next">Next →</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ SECTION 2 — Grouped Navigation ══ -->
    <div class="section-block">
      <div class="section-label">Layout 02</div>
      <div class="section-title">Navigation — Grouped</div>
      <div class="section-desc">Steps organised into named groups with a vertical sidebar layout.</div>

      <div
        ref="wizard2Ref"
        id="smartwizard-2"
        class="sw"
        data-layout="vertical"
        data-theme="arrows"
        data-nav="classic"
        data-progress="segmented"
        data-start-step="0"
        aria-label="Setup Wizard"
      >
        <!-- Toolbar top -->
        <div class="sw-toolbar sw-toolbar-top">
          <div class="sw-toolbar-group">
            <span class="sw-badge sw-badge-info" id="step-info-2">
              {{ stepInfo2.totalSteps > 0 ? `Step ${stepInfo2.currentStep + 1} of ${stepInfo2.totalSteps}` : '' }}
            </span>
            <div class="sw-toolbar-divider" />
            <span class="sw-badge sw-badge-warn">⚠ Unsaved</span>
          </div>
          <div class="sw-toolbar-group">
            <button class="sw-btn sw-btn-primary">Primary</button>
            <button class="sw-btn sw-btn-success">Success</button>
            <button class="sw-btn sw-btn-warning">Warning</button>
            <button class="sw-btn sw-btn-info">Info</button>
            <button type="button" class="sw-btn sw-btn-danger sw-btn-reset">Reset</button>
            <button type="button" class="sw-btn sw-btn-prev" disabled>Previous</button>
            <button type="button" class="sw-btn sw-btn-next" disabled>Next</button>
          </div>
        </div>

        <!-- Grouped Navigation -->
        <nav class="sw-nav" role="tablist" aria-label="Wizard steps" aria-orientation="horizontal">
          <!-- Group A -->
          <div class="sw-nav-item-group">
            <span class="sw-group-header">Group A</span>
            <div class="sw-nav-item" data-step="1" role="tab" aria-selected="false" tabindex="-1">
              <div class="badge">✓</div>
              <div class="info">
                <span class="title">Account</span>
                <span class="desc">Personal details</span>
              </div>
            </div>
            <div class="sw-nav-item" data-step="2" role="tab" aria-controls="sw2-panel-2">
              <div class="badge">2</div>
              <div class="info">
                <span class="title">Address</span>
                <span class="desc">Location info</span>
              </div>
            </div>
          </div>

          <!-- Group B -->
          <div class="sw-nav-item-group">
            <span class="sw-group-header">Group B</span>
            <div class="sw-nav-item" data-step="3" role="tab" aria-controls="sw2-panel-3">
              <div class="badge">3</div>
              <div class="info">
                <span class="title">Payment</span>
                <span class="desc">Billing details</span>
              </div>
            </div>
            <div class="sw-nav-item" data-step="4" role="tab" aria-controls="sw2-panel-4">
              <div class="badge">4</div>
              <div class="info">
                <span class="title">Review</span>
                <span class="desc">Confirmation</span>
              </div>
            </div>
            <div class="sw-nav-item" data-step="5" role="tab" aria-controls="sw2-panel-5">
              <div class="badge">5</div>
              <div class="info">
                <span class="title">Finish</span>
                <span class="desc">Done!</span>
              </div>
            </div>
          </div>

          <!-- Group C -->
          <div class="sw-nav-item-group">
            <span class="sw-group-header">Group C</span>
            <div class="sw-nav-item" data-step="6" role="tab" aria-controls="sw2-panel-6">
              <div class="badge">10</div>
              <div class="info">
                <span class="title">Extra E</span>
                <span class="desc">This is extra for testing!</span>
              </div>
            </div>
            <div class="sw-nav-item" data-step="7" role="tab" aria-controls="sw2-panel-7">
              <div class="badge">11</div>
              <div class="info">
                <span class="title">Extra F</span>
                <span class="desc">This is extra for testing!</span>
              </div>
            </div>
          </div>
        </nav>

        <!-- Content panels -->
        <div class="sw-panels">
          <section class="sw-panel active" id="sw2-panel-1" role="tabpanel" hidden>
            <div class="sw-title">AA Address</div>
            <div class="sw-desc">Enter the address where you'd like your order delivered.</div>
            <div class="sw-field-row">
              <div class="sw-field"><label>First Name</label><input type="text" placeholder="Jane" class="sw-input" /></div>
              <div class="sw-field"><label>Last Name</label><input type="text" placeholder="Doe" class="sw-input" /></div>
            </div>
            <div class="sw-field-row">
              <div class="sw-field"><label>Street Address</label><input type="text" placeholder="123 Main St" class="sw-input" /></div>
              <div class="sw-field"><label>City</label><input type="text" placeholder="New York" class="sw-input" /></div>
            </div>
          </section>
          <section class="sw-panel" id="sw2-panel-2" role="tabpanel" hidden>
            <div class="sw-title">BB Address</div>
            <div class="sw-desc">Enter the address where you'd like your order delivered.</div>
            <div class="sw-field-row">
              <div class="sw-field"><label>First Name</label><input type="text" placeholder="Jane" class="sw-input" /></div>
              <div class="sw-field"><label>Last Name</label><input type="text" placeholder="Doe" class="sw-input" /></div>
            </div>
          </section>
          <section class="sw-panel" id="sw2-panel-3" role="tabpanel" hidden>
            <div class="sw-title">CC Address</div>
            <div class="sw-desc">Enter the address where you'd like your order delivered.</div>
            <div class="sw-field-row">
              <div class="sw-field"><label>First Name</label><input type="text" placeholder="Jane" class="sw-input" /></div>
              <div class="sw-field"><label>Last Name</label><input type="text" placeholder="Doe" class="sw-input" /></div>
            </div>
            <div class="sw-field-row">
              <div class="sw-field"><label>Street Address</label><input type="text" placeholder="123 Main St" class="sw-input" /></div>
              <div class="sw-field"><label>City</label><input type="text" placeholder="New York" class="sw-input" /></div>
            </div>
          </section>
          <section class="sw-panel" id="sw2-panel-4" role="tabpanel" hidden>
            <div class="sw-title">DDD Address</div>
            <div class="sw-desc">Enter the address where you'd like your order delivered.</div>
            <div class="sw-field-row">
              <div class="sw-field"><label>First Name</label><input type="text" placeholder="Jane" class="sw-input" /></div>
              <div class="sw-field"><label>Last Name</label><input type="text" placeholder="Doe" class="sw-input" /></div>
            </div>
            <div class="sw-field-row">
              <div class="sw-field"><label>Street Address</label><input type="text" placeholder="123 Main St" class="sw-input" /></div>
              <div class="sw-field"><label>City</label><input type="text" placeholder="New York" class="sw-input" /></div>
            </div>
          </section>
          <section class="sw-panel" id="sw2-panel-5" role="tabpanel" hidden>
            <div class="sw-title">Finish</div>
            <div class="sw-desc">All done! Your wizard is complete.</div>
          </section>
          <section class="sw-panel" id="sw2-panel-6" role="tabpanel" hidden>
            <div class="sw-title">Extra E</div>
            <div class="sw-desc">This is extra for testing!</div>
          </section>
          <section class="sw-panel" id="sw2-panel-7" role="tabpanel" hidden>
            <div class="sw-title">Extra F</div>
            <div class="sw-desc">This is extra for testing!</div>
          </section>
        </div>

        <!-- Toolbar bottom -->
        <div class="sw-toolbar sw-toolbar-bottom">
          <div class="sw-toolbar-group">
            <button class="sw-btn sw-btn-outline sw-btn-prev" data-action="prev">← Back</button>
          </div>
          <div class="sw-toolbar-group">
            <div class="sw-progress">
              <div
                class="sw-progress-bar"
                role="progressbar"
                :style="{ width: `${progress2}%` }"
                :aria-valuenow="progress2"
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
          </div>
          <div class="sw-toolbar-group">
            <button class="sw-btn sw-btn-ghost sw-btn-skip" data-action="skip">Skip</button>
            <button class="sw-btn sw-btn-primary sw-btn-next" data-action="next">Next →</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useSmartWizard } from "@smart-wizard/vue";

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
  // Ajax: "ajax.html",
  // Validation: "validation.html",
  // RTL: "rtl.html",
  // Multiple: "multiple.html",
};

// ── Dark mode helpers ──────────────────────────────────────────────────────

function osPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getStoredPref(): string {
  return localStorage.getItem(STORAGE_KEY) ?? "auto";
}

function isDarkFromPref(pref: string): boolean {
  return pref === "dark" || (pref === "auto" && osPrefersDark());
}

// ── Wizard Instances ───────────────────────────────────────────────────────

const wizard1Ref = ref<HTMLElement | null>(null);
const {
  stepInfo: stepInfo1,
  setOptions: setOptions1,
  next: next1,
  prev: prev1,
  reset: reset1,
} = useSmartWizard(wizard1Ref, {
  transition: {
    effect: "css" as any,
    speed: 400,
    css: cssAnimationList.cssLightspeed as any,
  },
});

const wizard2Ref = ref<HTMLElement | null>(null);
const {
  stepInfo: stepInfo2,
  setOptions: setOptions2,
  reset: reset2,
} = useSmartWizard(wizard2Ref, {});

// ── Shared control state ──
const selectedTheme = ref("");
const selectedTransition = ref("cssLightspeed");
const selectedColor = ref("ocean");

// ── Dark mode state ──
const themePref = ref<string>(getStoredPref());
const isDark = ref<boolean>(isDarkFromPref(themePref.value));

function applyThemePref(pref: string) {
  if (pref === "auto") localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, pref);
  const dark = isDarkFromPref(pref);
  themePref.value = pref;
  isDark.value = dark;
  const colorScheme = dark ? "dark" : "light";
  setOptions1?.({ colorScheme });
  setOptions2?.({ colorScheme });
}

// Apply dark/light to body dataset
watch(
  isDark,
  (val) => {
    document.body.dataset.uiTheme = val ? "dark" : "light";
  },
  { immediate: true }
);

// OS preference change listener
let mqHandler: ((e: MediaQueryListEvent) => void) | null = null;

onMounted(() => {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mqHandler = (e: MediaQueryListEvent) => {
    if (getStoredPref() === "auto") {
      isDark.value = e.matches;
      const colorScheme = e.matches ? "dark" : "light";
      setOptions1?.({ colorScheme });
      setOptions2?.({ colorScheme });
    }
  };
  mq.addEventListener("change", mqHandler);

  const colorScheme = isDark.value ? "dark" : "light";
  setOptions1?.({ colorScheme });
  setOptions2?.({ colorScheme });
});

onUnmounted(() => {
  if (mqHandler) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.removeEventListener("change", mqHandler);
  }
});

// ── Control handlers ──

function handleThemeChange(e: Event) {
  const theme = (e.target as HTMLSelectElement).value;
  selectedTheme.value = theme;
  setOptions1?.({ theme });
  setOptions2?.({ theme });
}

function handleTransitionChange(e: Event) {
  const value = (e.target as HTMLSelectElement).value;
  selectedTransition.value = value;
  const cssAnim = cssAnimationList[value];
  const opts = cssAnim
    ? { transition: { effect: "css" as any, css: cssAnim as any } }
    : { transition: { effect: value as any } };
  setOptions1?.(opts);
  setOptions2?.(opts);
}

function handleColorChange(color: string) {
  selectedColor.value = color;
  setOptions1?.({ color });
  setOptions2?.({ color });
}

function handlePrev() {
  prev1?.();
}

function handleNext() {
  next1?.();
}

function handleReset() {
  reset1?.();
  reset2?.();
}

const progress1 = computed(() =>
  stepInfo1.value.totalSteps > 0
    ? ((stepInfo1.value.currentStep + 1) / stepInfo1.value.totalSteps) * 100
    : 0
);

const progress2 = computed(() =>
  stepInfo2.value.totalSteps > 0
    ? ((stepInfo2.value.currentStep + 1) / stepInfo2.value.totalSteps) * 100
    : 0
);
</script>

<style scoped></style>
