import { Section } from "@/interfaces/Section"

export interface ShopDictionary {
    [key: string]: {
        placementSelector: string;
        cartSections: Section[];
        wrapperClass: string;
    }
}