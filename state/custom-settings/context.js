import { createContext, useContext } from 'react';

// Create a context with createContext api
export const CustomSettingsContext = createContext();

// Create a reusable hook for consuming the context
export function useCustomSettings() {
    return useContext(CustomSettingsContext);
}