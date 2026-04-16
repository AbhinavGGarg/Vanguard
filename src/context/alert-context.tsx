
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

export type Alert = {
    id: string;
    timestamp: string;
    type: 'Sound' | 'Object' | 'Verbal';
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    description: string;
    details: Record<string, any>;
};

interface AlertState {
    alerts: Alert[];
    addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void;
    clearAlerts: () => void;
}

const AlertContext = createContext<AlertState | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    const addAlert = useCallback((alertData: Omit<Alert, 'id'|'timestamp'>) => {
        const newAlert: Alert = {
            ...alertData,
            id: `ALERT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            timestamp: new Date().toISOString(),
        };
        setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
    }, []);

    const clearAlerts = useCallback(() => {
        setAlerts([]);
    }, []);

    const value = useMemo(() => ({
        alerts,
        addAlert,
        clearAlerts
    }), [alerts, addAlert, clearAlerts]);

    return (
        <AlertContext.Provider value={value}>
            {children}
        </AlertContext.Provider>
    );
}

export function useAlerts() {
    const context = useContext(AlertContext);
    if (context === undefined) {
        throw new Error('useAlerts must be used within an AlertProvider');
    }
    return context;
}
