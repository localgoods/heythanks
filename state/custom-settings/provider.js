import { CustomSettingsContext } from "./context"
import { useState } from "react"
import { useShop } from "../shop/context"
export const CustomSettingsProvider = (props) => {

    // Get current settings to override defaults
    const [{ privateMetafieldValue }] = useShop()

    // Emoji Options
    const [firstEmoji, setFirstEmoji] = useState(privateMetafieldValue?.customSettings?.firstEmoji || '🙂')
    const [secondEmoji, setSecondEmoji] = useState(privateMetafieldValue?.customSettings?.secondEmoji || '🥰')

    // Style Options
    const [backgroundColor, setBackgroundColor] = useState(privateMetafieldValue?.customSettings?.backgroundColor || "#ffffff")
    const [selectionColor, setSelectionColor] = useState(privateMetafieldValue?.customSettings?.selectionColor || "#3678b4")
    const [strokeColor, setStrokeColor] = useState(privateMetafieldValue?.customSettings?.strokeColor || "#d9d9d9")
    const [strokeWidth, setStrokeWidth] = useState(privateMetafieldValue?.customSettings?.strokeWidth || 2)
    const [cornerRadius, setCornerRadius] = useState(privateMetafieldValue?.customSettings?.cornerRadius || 2)

    // Text Options
    const [labelText, setLabelText] = useState(privateMetafieldValue?.customSettings?.labelText || "Send a tip directly to your fulfillment workers 💜")
    const [tooltipText, setTooltipText] = useState(privateMetafieldValue?.customSettings?.tooltipText || "HeyThanks is a service that delivers your tips directly to the fulfillment employees who pick, pack, and ship your order.")

    // Display Options
    const [displayStatus, setDisplayStatus] = useState(privateMetafieldValue?.customSettings?.displayStatus || 'preview')

    return (
        <CustomSettingsContext.Provider
            value={[
                {
                    firstEmoji,
                    setFirstEmoji,
                    secondEmoji,
                    setSecondEmoji,
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
                    tooltipText,
                    setTooltipText,
                    displayStatus,
                    setDisplayStatus,
                },
            ]}
        >
            {props.children}
        </CustomSettingsContext.Provider>
    )
}