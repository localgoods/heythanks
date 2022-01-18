import { createContext, useContext } from 'react';

// Create a context with createContext api
export const ShopContext = createContext();

// Create a reusable hook for consuming the context
export function useShop() {
    return useContext(ShopContext);
}