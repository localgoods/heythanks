import { CustomSettingsContext } from "./context"
import { useEffect, useState } from "react"
import { useShop } from "../shop/context"

const defaultSettings = {
    // Style Options
    backgroundColor: "#ffffff",
    selectionColor: "#3678b4",
    strokeColor: "#d9d9d9",
    strokeWidth: 2,
    cornerRadius: 10,
    // Text Options
    labelText: "Send a tip directly to our fulfillment team who packs your order with care.",
    // Display Options, default to false for new ScriptTag users
    displayStatus: false
}

export const CustomSettingsProvider = (props) => {

    // Get current settings to override defaults
    const [{ privateMetafieldValue }] = useShop()
    const [backgroundColor, setBackgroundColor] = useState(privateMetafieldValue?.customSettings?.backgroundColor || defaultSettings.backgroundColor)
    const [selectionColor, setSelectionColor] = useState(privateMetafieldValue?.customSettings?.selectionColor || defaultSettings.selectionColor)
    const [strokeColor, setStrokeColor] = useState(privateMetafieldValue?.customSettings?.strokeColor || defaultSettings.strokeColor)
    const [strokeWidth, setStrokeWidth] = useState(privateMetafieldValue?.customSettings?.strokeWidth || defaultSettings.strokeWidth)
    const [cornerRadius, setCornerRadius] = useState(privateMetafieldValue?.customSettings?.cornerRadius || defaultSettings.cornerRadius)
    const [labelText, setLabelText] = useState(privateMetafieldValue?.customSettings?.labelText || defaultSettings.labelText)
    const [displayStatus, setDisplayStatus] = useState(privateMetafieldValue?.customSettings?.displayStatus || defaultSettings.displayStatus)

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