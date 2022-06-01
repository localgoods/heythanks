import { CustomSettingsContext } from "./context"
import { useState } from "react"
import { useShop } from "../shop/context"
export const CustomSettingsProvider = (props) => {

    // Get current settings to override defaults
    const [{ privateMetafieldValue }] = useShop()

    const {
        firstEmoji: firstEmojiOverride,
        secondEmoji: secondEmojiOverride,
        backgroundColor: backgroundColorOverride,
        selectionColor: selectionColorOverride,
        strokeColor: strokeColorOverride,
        strokeWidth: strokeWidthOverride,
        cornerRadius: cornerRadiusOverride,
        labelText: labelTextOverride,
        tooltipText: tooltipTextOverride,
        displayStatus: displayStatusOverride,
    } = privateMetafieldValue.customSettings

    // Emoji Options
    const [firstEmoji, setFirstEmoji] = useState(firstEmojiOverride || '🙂')
    const [secondEmoji, setSecondEmoji] = useState(secondEmojiOverride || '🥰')

    // Style Options
    const [backgroundColor, setBackgroundColor] = useState(backgroundColorOverride || "#ffffff")
    const [selectionColor, setSelectionColor] = useState(selectionColorOverride || "#3678b4")
    const [strokeColor, setStrokeColor] = useState(strokeColorOverride || "#d9d9d9")
    const [strokeWidth, setStrokeWidth] = useState(strokeWidthOverride || 2)
    const [cornerRadius, setCornerRadius] = useState(cornerRadiusOverride || 2)

    // Text Options
    const [labelText, setLabelText] = useState(labelTextOverride || "Send a tip directly to your fulfillment workers 💜")
    const [tooltipText, setTooltipText] = useState(tooltipTextOverride || "HeyThanks is a service that delivers your tips directly to the fulfillment employees who pick, pack, and ship your order.")

    // Display Options
    const [displayStatus, setDisplayStatus] = useState(displayStatusOverride || 'preview')

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