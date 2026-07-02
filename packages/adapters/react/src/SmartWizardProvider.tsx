import React, { createContext, useContext, ReactNode, useRef } from 'react';
import { WizardOptions, WizardInfo, SmartWizard } from '@smart-wizard/core';
import { useSmartWizard } from './useSmartWizard';

interface SmartWizardContextValue {
    info: WizardInfo;
    next: () => void;
    prev: () => void;
    goTo: (index: number, force?: boolean) => void;
    reset: () => void;
    wizard: SmartWizard | null;
}

const SmartWizardContext = createContext<SmartWizardContextValue | null>(null);

interface SmartWizardProviderProps {
    containerRef: React.RefObject<HTMLElement>;
    options: Partial<WizardOptions>;
    children: ReactNode;
}

export function SmartWizardProvider({ containerRef, options, children }: SmartWizardProviderProps) {
    const wizard = useSmartWizard(containerRef, options);

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
