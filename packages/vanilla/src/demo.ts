import { SmartWizardDOM } from './SmartWizardDOM';

const wizard = new SmartWizardDOM('#smartwizard', {
    theme: 'default',
    toolbar: {
        position: 'bottom',
        showNextButton: true,
        showPreviousButton: true,
    },
});

// Expose globally so demo HTML onclick handlers work
(window as any).wizard = wizard;

function updateStepInfo() {
    const info = wizard.getStepInfo();
    const currentEl = document.getElementById('current-step');
    const totalEl = document.getElementById('total-steps');
    if (currentEl) currentEl.textContent = String(info.currentStep + 1);
    if (totalEl) totalEl.textContent = String(info.totalSteps);
}

const wizardElement = document.getElementById('smartwizard');
wizardElement?.addEventListener('initialized', () => {
    console.log('✅ SmartWizard initialized!');
    updateStepInfo();
});
wizardElement?.addEventListener('showStep', (e) => {
    console.log('Step changed:', (e as CustomEvent).detail);
    updateStepInfo();
});

updateStepInfo();
