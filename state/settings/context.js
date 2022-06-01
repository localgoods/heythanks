import { createContext, useContext } from 'react'

// Create a context with createContext api
export const SettingsContext = createContext()

// Create a reusable hook for consuming the context
export function useSettings() {
    return useContext(SettingsContext)
}