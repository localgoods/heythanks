import { Banner, Button, ButtonGroup, ColorPicker, FormLayout, Heading, RangeSlider, Select, TextContainer, TextField, TextStyle } from "@shopify/polaris"
import { useCallback, useEffect, useState } from "react"
import { hexToHsl, hslToHex } from "../../../helpers/colors"
import { useShop } from "../../../state/shop/context"
import { useCustomSettings } from "../../../state/custom-settings/context"
import localStyles from './customize-settings.module.css'
import globalStyles from '../../../pages/index.module.css'
import { useSettings } from "../../../state/settings/context"

// Todo which should override which? (Lookup standard)
const styles = { ...localStyles, ...globalStyles }

const CustomizeSettings = () => {

    const [{
        setDisableButtons,
        disableButtons,
    }] = useSettings()

    const [{
        onboarded,
        privateMetafieldValue,
        activePlan,
        upsertPrivateMetafield
    }] = useShop()

    const [{
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
    }] = useCustomSettings()

    const [customSettingsChanged, setCustomSettingsChanged] = useState(false)

    const [backgroundColorRgb, setBackgroundColorRgb] = useState(hexToHsl(backgroundColor))
    const [selectionColorRgb, setSelectionColorRgb] = useState(hexToHsl(selectionColor))
    const [strokeColorRgb, setStrokeColorRgb] = useState(hexToHsl(strokeColor))

    // Emoji Options
    const firstEmojiOptions = ['None', '🙂', '🏎']
    const secondEmojiOptions = ['None', '🥰', '🚀']

    const handleReset = () => {
        // Todo reset all to saved custom
        setFirstEmoji(privateMetafieldValue.customSettings.firstEmoji),
        setSecondEmoji(privateMetafieldValue.customSettings.secondEmoji),
        setBackgroundColor(privateMetafieldValue.customSettings.backgroundColor),
        setSelectionColor(privateMetafieldValue.customSettings.selectionColor),
        setStrokeColor(privateMetafieldValue.customSettings.strokeColor),
        setStrokeWidth(privateMetafieldValue.customSettings.strokeWidth),
        setCornerRadius(privateMetafieldValue.customSettings.cornerRadius),
        setLabelText(privateMetafieldValue.customSettings.labelText),
        setTooltipText(privateMetafieldValue.customSettings.tooltipText),
        setDisplayStatus(privateMetafieldValue.customSettings.displayStatus)
    }

    // Style Options
    const handleBackgroundColorChange = useCallback(
        (value) => {
            if (typeof value === "string") {
                setBackgroundColor(value)
                setBackgroundColorRgb(hexToHsl(value))
            } else {
                setBackgroundColor(hslToHex(value))
                setBackgroundColorRgb(value)
            }
        },
        [],
    )

    const handleSelectionColorChange = useCallback(
        (value) => {
            if (typeof value === "string") {
                setSelectionColor(value)
                setSelectionColorRgb(hexToHsl(value))
            } else {
                setSelectionColor(hslToHex(value))
                setSelectionColorRgb(value)
            }
        },
        [],
    )

    const handleStrokeColorChange = useCallback(
        (value) => {
            if (typeof value === "string") {
                setStrokeColor(value)
                setStrokeColorRgb(hexToHsl(value))
            } else {
                setStrokeColor(hslToHex(value))
                setStrokeColorRgb(value)
            }
        },
        [],
    )

    const handleStrokeWidthChange = useCallback(
        (value) => setStrokeWidth(value),
        [],
    )

    const handleCornerRadiusChange = useCallback(
        (value) => setCornerRadius(value),
        [],
    )

    useEffect(() => {
        const changed = JSON.stringify(privateMetafieldValue.customSettings) !== JSON.stringify({
            firstEmoji,
            secondEmoji,
            backgroundColor,
            selectionColor,
            strokeColor,
            strokeWidth,
            cornerRadius,
            labelText,
            tooltipText,
            displayStatus
        })
        setCustomSettingsChanged(changed)
    }, [privateMetafieldValue,
        firstEmoji,
        secondEmoji,
        backgroundColor,
        selectionColor,
        strokeColor,
        strokeWidth,
        cornerRadius,
        labelText,
        tooltipText,
        displayStatus])

    return (
        <TextContainer>
            <Heading>
                {!onboarded ? "Your widget settings" : "Change your widget settings"}
            </Heading>
            {!activePlan && (
                <TextStyle variation="negative">
                    Please renew your plan to edit the widget.
                </TextStyle>
            )}
            <Banner status="info">
                <p>The widget is added by default to your cart page. Please contact us if you prefer a different placement.</p>
                <div className={styles.spacer}></div>
            </Banner>

            <div className={styles.spacer}></div>

            <div className={styles.widget_box}>does this work</div>

            <div className={styles.spacer}></div>

            <FormLayout>
                <FormLayout.Group>
                    <TextContainer>
                        <Select
                            label="First Emoji"
                            options={firstEmojiOptions}
                            value={firstEmoji}
                            onChange={setFirstEmoji}
                        ></Select>
                    </TextContainer>
                    <TextContainer>
                        <Select
                            label="Second Emoji"
                            options={secondEmojiOptions}
                            value={secondEmoji}
                            onChange={setSecondEmoji}
                        ></Select>
                    </TextContainer>
                </FormLayout.Group>

                <div className={styles.spacer}></div>

                {/* Todo fix the grid here */}
                <FormLayout.Group>
                    <TextContainer>
                        <span>Background Color</span>
                        <ColorPicker
                            color={backgroundColorRgb}
                            onChange={handleBackgroundColorChange}
                        ></ColorPicker>
                        <TextField
                            value={backgroundColor}
                            onChange={handleBackgroundColorChange}
                            autoComplete="off"
                        ></TextField>
                    </TextContainer>
                    <TextContainer>
                        <span>Selection Color</span>
                        <ColorPicker
                            color={selectionColorRgb}
                            onChange={handleSelectionColorChange}
                        ></ColorPicker>
                        <TextField
                            value={selectionColor}
                            onChange={handleSelectionColorChange}
                            autoComplete="off"
                        ></TextField>
                    </TextContainer>
                    <TextContainer>
                        <span>Stroke Color</span>
                        <ColorPicker
                            color={strokeColorRgb}
                            onChange={handleStrokeColorChange}
                        ></ColorPicker>
                        <TextField
                            value={strokeColor}
                            onChange={handleStrokeColorChange}
                            autoComplete="off"
                        ></TextField>
                    </TextContainer>
                </FormLayout.Group>

                <div className={styles.spacer}></div>

                <FormLayout.Group>
                    <TextContainer>
                        <RangeSlider
                            output
                            label="Stroke Width"
                            min={1}
                            max={5}
                            value={strokeWidth}
                            onChange={handleStrokeWidthChange}
                        />
                    </TextContainer>
                    <TextContainer>
                        <RangeSlider
                            output
                            label="Corner Radius"
                            min={1}
                            max={5}
                            value={cornerRadius}
                            onChange={handleCornerRadiusChange}
                        />
                    </TextContainer>
                </FormLayout.Group>

                <div className={styles.spacer}></div>

                <FormLayout.Group>
                    <TextContainer>
                        <TextField
                            label="Label Text"
                            value={labelText}
                            onChange={setLabelText}
                            maxLength={75}
                            autoComplete="off"
                            showCharacterCount
                        ></TextField>
                    </TextContainer>
                </FormLayout.Group>

                <div className={styles.spacer}></div>

                <FormLayout.Group>
                    <TextContainer>
                        <TextField
                            label="Tooltip Text"
                            value={tooltipText}
                            onChange={setTooltipText}
                            multiline={2}
                            maxLength={200}
                            autoComplete="off"
                            showCharacterCount
                        ></TextField>
                    </TextContainer>
                </FormLayout.Group>

                <div className={styles.spacer}></div>

            </FormLayout>


            <ButtonGroup>
                <Button
                    disabled={(onboarded && !customSettingsChanged) || disableButtons}
                    loading={disableButtons}
                    size="large"
                    onClick={handleReset}
                >
                    Reset
                </Button>
                <Button
                    disabled={(onboarded && !customSettingsChanged) || disableButtons}
                    loading={disableButtons}
                    primary
                    size="large"
                    onClick={async () => {
                        setDisableButtons(true)

                        const existingValue = privateMetafieldValue
                            ? privateMetafieldValue
                            : {}

                        const privateMetafieldInput = {
                            namespace: "heythanks",
                            key: "shop",
                            valueInput: {
                                value: JSON.stringify({
                                    ...existingValue,
                                    customSettings: {
                                        firstEmoji,
                                        secondEmoji,
                                        backgroundColor,
                                        selectionColor,
                                        strokeColor,
                                        strokeWidth,
                                        cornerRadius,
                                        labelText,
                                        tooltipText,
                                        displayStatus,
                                    },
                                    onboarded: true,
                                }),
                                valueType: "JSON_STRING"
                            }
                        }

                        await upsertPrivateMetafield({
                            variables: { input: privateMetafieldInput },
                        })
                        setDisableButtons(false)
                    }}
                >
                    {!onboarded ? "Complete onboarding" : "Save changes"}
                </Button>
            </ButtonGroup>
        </TextContainer>
    )
}

export default CustomizeSettings
