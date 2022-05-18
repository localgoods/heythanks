import { CustomSettingsContext } from "./context";
import { useState } from "react";
export const CustomSettingsProvider = (props) => {
    // Emoji Options
    const [firstEmoji, setFirstEmoji] = useState('🙂')
    const [secondEmoji, setSecondEmoji] = useState('🥰')

    // Style Options
    const [backgroundColor, setBackgroundColor] = useState("#ffffff")
    const [selectionColor, setSelectionColor] = useState("#3678b4")
    const [strokeColor, setStrokeColor] = useState("#d9d9d9")
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [cornerRadius, setCornerRadius] = useState(2)

    // Text Options
    const [labelText, setLabelText] = useState("Send a tip directly to your fulfillment workers 💜")
    const [tooltipText, setTooltipText] = useState("HeyThanks is a service that delivers your tips directly to the fulfillment employees who pick, pack, and ship your order.")

    // Display Options
    const [displayStatus, setDisplayStatus] = useState('preview')

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
    );
};