import { CustomSettingsContext } from "./context"
import { useState } from "react"
import { useShop } from "../shop/context"
export const CustomSettingsProvider = (props) => {

    // Get current settings to override defaults
    const [{ privateMetafieldValue }] = useShop()

    // Style Options
    const [backgroundColor, setBackgroundColor] = useState(privateMetafieldValue?.customSettings?.backgroundColor || "#ffffff")
    const [selectionColor, setSelectionColor] = useState(privateMetafieldValue?.customSettings?.selectionColor || "#3678b4")
    const [strokeColor, setStrokeColor] = useState(privateMetafieldValue?.customSettings?.strokeColor || "#d9d9d9")
    const [strokeWidth, setStrokeWidth] = useState(privateMetafieldValue?.customSettings?.strokeWidth || 2)
    const [cornerRadius, setCornerRadius] = useState(privateMetafieldValue?.customSettings?.cornerRadius || 10)

    // Text Options
    const [labelText, setLabelText] = useState(privateMetafieldValue?.customSettings?.labelText || "Send a tip directly to our fulfillment team who packs your order with care.")

    // Display Options, default to false for new ScriptTag users
    const [displayStatus, setDisplayStatus] = useState(privateMetafieldValue?.customSettings?.displayStatus || false)

    return (
        <CustomSettingsContext.Provider
            value={[
                {
                    backgroundColor,
                    setBackgroundColor,
                    selectionColor,
                    setSelectionColor,
                    strokeColor,
                    setStrokeColor,
                    strokeWidth,
                    setStrokeWidth,
                    cornerRadius,
                    setCornerRadius,
                    labelText,
                    setLabelText,
                    displayStatus,
                    setDisplayStatus,
                },
            ]}
        >
            {props.children}
        </CustomSettingsContext.Provider>
    )
}