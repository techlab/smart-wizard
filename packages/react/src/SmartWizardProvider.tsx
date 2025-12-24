import React, { createContext, useContext, ReactNode } from 'react';
import { WizardOptions } from '@smartwizard/core';
import { useSmartWizard } from './useSmartWizard';

interface SmartWizardContextValue {
    state: any;
    next: () => void;
    previous: () => void;
    goToStep: (index: number) => void;
}

const SmartWizardContext = createContext<SmartWizardContextValue | null>(null);

interface SmartWizardProviderProps {
    options: WizardOptions;
    children: ReactNode;
}

export function SmartWizardProvider({ options, children }: SmartWizardProviderProps) {
    const wizard = useSmartWizard(options);

    return (
        <SmartWizardContext.Provider value={wizard}>
            {children}
        </SmartWizardContext.Provider>
    );
}

export function useWizardContext() {
    const context = useContext(SmartWizardContext);
    if (!context) {
        throw new Error('useWizardContext must be used within SmartWizardProvider');
    }
    return context;
}
