function initWizardControls() {
    // Select the parent container holding the items
    const controlPanel = document.querySelector(".wizard-control-panel");
    // Attach the same function to both events
    controlPanel.addEventListener("click", handlePanelEvent);
    controlPanel.addEventListener("change", handlePanelEvent);

    // Handler function
    function handlePanelEvent(event) {
        var wizardId = event.currentTarget.dataset.wizardId;
        if (typeof window[wizardId] === 'undefined') {
            return;
        }
        const wizardObj = window[wizardId];
        const element = event.target;

        if (event.type == 'change') {
            if (element.classList.contains("theme-select")) {
                wizardObj.setOptions({
                    theme: element.value,
                });
            }
            else if (element.classList.contains("transition-select")) {
                const cssAnim = cssAnimationList[element.value];
                const options = cssAnim
                    ? { transition: { effect: 'css', css: { ...cssAnim } } }
                    : { transition: { effect: element.value } };
                wizardObj.setOptions(options);
            }
        } else {
            if (element.classList.contains("btn-reset")) {
                wizardObj.reset();
            }
            else if (element.classList.contains("btn-prev")) {
                wizardObj.prev();
            }
            else if (element.classList.contains("btn-next")) {
                wizardObj.next();
            }
            else if (element.classList.contains("btn-color-theme")) {
                const clickedBtn = element.closest('[data-color]');
                if (!clickedBtn) return; // Ignore clicks that aren't on a color button

                // Get all children of the item's parent, turned into an array
                const siblings = Array.from(clickedBtn.parentNode.children);
                // Loop and remove the class from everyone EXCEPT the current element 'b'
                siblings.forEach(sibling => {
                    if (sibling !== clickedBtn) {
                        sibling.classList.remove('active');
                    }
                });

                clickedBtn.classList.add('active');
                const color = clickedBtn.dataset.color;
                wizardObj.setOptions({
                    color: color
                });
            }
        }
    }

    // ── Theme switcher ──
    const themeList = {
        '': 'Default',
        'arrows': 'Arrows',
        'glow': 'Glow',
        'basic': 'Basic',
        'pills': 'Pills',
        'chevron': 'Chevron',
    };
    const themeListControls = document.getElementById('theme-select');
    if (themeListControls) {
        Object.entries(themeList).forEach(([key, value]) => {
            const option = document.createElement('option');
            option.textContent = value;
            option.value = key;
            if (typeof activeTheme !== 'undefined' && key === activeTheme) option.selected = true;
            themeListControls.appendChild(option);
        });
    }

    // ── CSS Animation definitions (Animate.css) ──
    const cssAnimationList = {
        cssSlideH: { prefix: 'animate__animated animate__faster', forward: { show: 'animate__slideInLeft', hide: 'animate__slideOutRight' }, backward: { show: 'animate__slideInRight', hide: 'animate__slideOutLeft' } },
        cssSlideV: { prefix: 'animate__animated animate__faster', forward: { show: 'animate__slideInDown', hide: 'animate__slideOutDown' }, backward: { show: 'animate__slideInUp', hide: 'animate__slideOutUp' } },
        cssFade: { prefix: 'animate__animated animate__faster', forward: { show: 'animate__fadeIn', hide: 'animate__fadeOut' }, backward: { show: 'animate__fadeIn', hide: 'animate__fadeOut' } },
        cssFadeSlideH: { prefix: 'animate__animated animate__faster', forward: { show: 'animate__fadeInLeft', hide: 'animate__fadeOutRight' }, backward: { show: 'animate__fadeInRight', hide: 'animate__fadeOutLeft' } },
        cssFadeSlideV: { prefix: 'animate__animated animate__faster', forward: { show: 'animate__fadeInDown', hide: 'animate__fadeOutDown' }, backward: { show: 'animate__fadeInUp', hide: 'animate__fadeOutUp' } },
        cssFadeSlideCorner1: { prefix: 'animate__animated animate__faster', forward: { show: 'animate__fadeInTopLeft', hide: 'animate__fadeOutBottomRight' }, backward: { show: 'animate__fadeInBottomRight', hide: 'animate__fadeOutTopLeft' } },
        cssFadeSlideCorner2: { prefix: 'animate__animated animate__faster', forward: { show: 'animate__fadeInBottomLeft', hide: 'animate__fadeOutTopRight' }, backward: { show: 'animate__fadeInTopRight', hide: 'animate__fadeOutBottomLeft' } },
        cssBounce: { prefix: 'animate__animated animate__faster', forward: { show: 'animate__bounceIn', hide: 'animate__bounceOut' }, backward: { show: 'animate__bounceIn', hide: 'animate__bounceOut' } },
        cssBounceSlideH: { prefix: 'animate__animated animate__faster', forward: { show: 'animate__bounceInLeft', hide: 'animate__bounceOutRight' }, backward: { show: 'animate__bounceInRight', hide: 'animate__bounceOutLeft' } },
        cssBounceSlideV: { prefix: 'animate__animated animate__faster', forward: { show: 'animate__bounceInDown', hide: 'animate__bounceOutDown' }, backward: { show: 'animate__bounceInUp', hide: 'animate__bounceOutUp' } },
        cssBackSlideH: { prefix: 'animate__animated animate__faster', forward: { show: 'animate__backInLeft', hide: 'animate__backOutRight' }, backward: { show: 'animate__backInRight', hide: 'animate__backOutLeft' } },
        cssBackSlideV: { prefix: 'animate__animated animate__faster', forward: { show: 'animate__backInDown', hide: 'animate__backOutDown' }, backward: { show: 'animate__backInUp', hide: 'animate__backOutUp' } },
        cssFlipH: { prefix: 'animate__animated animate__faster', forward: { show: 'animate__flipInY', hide: 'animate__flipOutY' }, backward: { show: 'animate__flipInY', hide: 'animate__flipOutY' } },
        cssFlipV: { prefix: 'animate__animated animate__faster', forward: { show: 'animate__flipInX', hide: 'animate__flipOutX' }, backward: { show: 'animate__flipInX', hide: 'animate__flipOutX' } },
        cssLightspeed: { prefix: 'animate__animated animate__faster', forward: { show: 'animate__lightSpeedInLeft', hide: 'animate__lightSpeedOutRight' }, backward: { show: 'animate__lightSpeedInRight', hide: 'animate__lightSpeedOutLeft' } },
        cssRotate: { prefix: 'animate__animated animate__faster', forward: { show: 'animate__rotateIn', hide: 'animate__rotateOut' }, backward: { show: 'animate__rotateIn', hide: 'animate__rotateOut' } },
        cssRotateClock: { prefix: 'animate__animated animate__faster', forward: { show: 'animate__rotateInDownLeft', hide: 'animate__rotateOutDownLeft' }, backward: { show: 'animate__rotateInUpLeft', hide: 'animate__rotateOutUpLeft' } },
        cssRotateAntiClock: { prefix: 'animate__animated animate__faster', forward: { show: 'animate__rotateInDownRight', hide: 'animate__rotateOutDownRight' }, backward: { show: 'animate__rotateInUpRight', hide: 'animate__rotateOutUpRight' } },
        cssZoom: { prefix: 'animate__animated animate__faster', forward: { show: 'animate__zoomIn', hide: 'animate__zoomOut' }, backward: { show: 'animate__zoomIn', hide: 'animate__zoomOut' } },
    };

    // ── Transition selector ──
    const transitionList = {
        'Built-in': {
            'none': 'None',
            'fade': 'Fade',
            'slideHorizontal': 'Slide Horizontal',
            'slideVertical': 'Slide Vertical',
            'slideSwing': 'Slide Swing',
        },
        'CSS': {
            'cssSlideH': 'Slide Horizontal',
            'cssSlideV': 'Slide Vertical',
            'cssFade': 'Fade',
            'cssFadeSlideH': 'Fade + Slide H',
            'cssFadeSlideV': 'Fade + Slide V',
            'cssFadeSlideCorner1': 'Fade + Corner 1',
            'cssFadeSlideCorner2': 'Fade + Corner 2',
            'cssBounce': 'Bounce',
            'cssBounceSlideH': 'Bounce + Slide H',
            'cssBounceSlideV': 'Bounce + Slide V',
            'cssBackSlideH': 'Back + Slide H',
            'cssBackSlideV': 'Back + Slide V',
            'cssFlipH': 'Flip H',
            'cssFlipV': 'Flip V',
            'cssLightspeed': 'Lightspeed',
            'cssRotate': 'Rotate',
            'cssRotateClock': 'Rotate CW',
            'cssRotateAntiClock': 'Rotate CCW',
            'cssZoom': 'Zoom',
        },
    };

    const transitionControls = document.getElementById('transition-select');
    if (transitionControls) {
        Object.entries(transitionList).forEach(([groupKey, groupValue]) => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = groupKey;

            Object.entries(groupValue).forEach(([key, value]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = value;
                if (typeof activeTransition !== 'undefined' && key === activeTransition) option.selected = true;
                optgroup.appendChild(option);
            });

            transitionControls.appendChild(optgroup);
        });
    }

    // ── Color switcher ──
    const colorList = {
        '': 'Default',
        'ocean': 'Ocean',
        'teal': 'Teal',
        'forest': 'Forest',
        'violet': 'Violet',
        'crimson': 'Crimson',
        'amber': 'Amber',
        'indigo': 'Indigo',
        'slate': 'Slate',
        'purple': 'Purple',
        'green': 'Green',
    };

    const colorListControls = document.getElementById('color-list');
    if (colorListControls) {
        Object.entries(colorList).forEach(([key, value]) => {
            const btn = document.createElement('button');
            btn.textContent = value;
            btn.dataset.color = key;
            btn.classList.add('btn');
            btn.classList.add('btn-color-theme');
            // if (typeof activeColor !== 'undefined' && key === activeColor) btn.classList.add('active');
            colorListControls.appendChild(btn);
        });
    }
}