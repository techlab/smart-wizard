import React, { createContext, useContext, ReactNode, useRef } from 'react';
import { WizardOptions } from '@smart-wizard/core';
import { useSmartWizard } from './useSmartWizard';

export type SmartWizardContextValue = ReturnType<typeof useSmartWizard> & {
    containerRef: React.RefObject<HTMLElement>;
};

const SmartWizardContext = createContext<SmartWizardContextValue | null>(null);

export interface SmartWizardProviderProps {
    containerRef?: React.RefObject<HTMLElement>;
    options?: Partial<WizardOptions>;
    children: ReactNode;
}

export function SmartWizardProvider({ containerRef, options = {}, children }: SmartWizardProviderProps) {
    const internalRef = useRef<HTMLElement>(null);
    const targetRef = containerRef ?? internalRef;
    const wizard = useSmartWizard(targetRef, options);

    const value: SmartWizardContextValue = {
        ...wizard,
        containerRef: targetRef,
    };

    return (
        <SmartWizardContext.Provider value={value}>
            {children}
        </SmartWizardContext.Provider>
    );
}

export function useWizardContext(): SmartWizardContextValue {
    const context = useContext(SmartWizardContext);
    if (!context) {
        throw new Error('useWizardContext must be used within SmartWizardProvider');
    }
    return context;
}
