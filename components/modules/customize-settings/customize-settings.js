
import { ChoiceList, ColorPicker, FormLayout, Heading, RangeSlider, Select, TextContainer, TextField } from "@shopify/polaris"
import { useCallback, useState } from "react";
import { hexToHsl, hslToHex } from "../../../helpers/colors";
import { useShop } from "../../../state/shop/context";
import { useCustomSettings } from "../../../state/custom-settings/context";
import localStyles from './customize-settings.module.css';
import globalStyles from '../../../pages/index.module.css';

// Todo which should override which? (Lookup standard)
const styles = { ...localStyles, ...globalStyles };

const CustomizeSettings = () => {
    const [{
        onboarded,
        activePlan,
    }] = useShop();

    const [{
        firstEmoji,
        setFirstEmoji,
        secondEmoji,
        setSecondEmoji,
        backgroundColor,
        setBackgroundColor,
        backgroundColorRgb,
        setBackgroundColorRgb,
        selectionColor,
        setSelectionColor,
        selectionColorRgb,
        setSelectionColorRgb,
        strokeColor,
        setStrokeColor,
        strokeColorRgb,
        setStrokeColorRgb,
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
    }] = useCustomSettings();

    // Emoji Options
    const firstEmojiOptions = ['None', '🙂', '🏎']
    const secondEmojiOptions = ['None', '🥰', '🚀']

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
    );

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
    );

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
    );

    const handleStrokeWidthChange = useCallback(
        (value) => setStrokeWidth(value),
        [],
    );

    const handleCornerRadiusChange = useCallback(
        (value) => setCornerRadius(value),
        [],
    );

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

                <FormLayout.Group>
                    <TextContainer>
                        <span>Background Color</span>
                        <ColorPicker
                            color={backgroundColorRgb}
                            onChange={handleBackgroundColorChange}
                        ></ColorPicker>
                    </TextContainer>
                    <TextContainer>
                        <span>Selection Color</span>
                        <ColorPicker
                            color={selectionColorRgb}
                            onChange={handleSelectionColorChange}
                        ></ColorPicker>
                    </TextContainer>
                    <TextContainer>
                        <span>Stroke Color</span>
                        <ColorPicker
                            color={strokeColorRgb}
                            onChange={handleStrokeColorChange}
                        ></ColorPicker>
                    </TextContainer>
                </FormLayout.Group>
                <FormLayout.Group>
                    <TextContainer>
                        <TextField
                            value={backgroundColor}
                            onChange={handleBackgroundColorChange}
                            autoComplete="off"
                        ></TextField>
                    </TextContainer>
                    <TextContainer>
                        <TextField
                            value={selectionColor}
                            onChange={handleSelectionColorChange}
                            autoComplete="off"
                        ></TextField>
                    </TextContainer>
                    <TextContainer>
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

                <FormLayout.Group>
                    <TextContainer>
                        <ChoiceList
                            title="Display Status"
                            choices={[
                                { label: 'Preview – only visible in your theme editor', value: 'preview' },
                                { label: 'Display – visible in your live store', value: 'display' },
                            ]}
                            selected={displayStatus}
                            onChange={setDisplayStatus}
                        />
                    </TextContainer>
                </FormLayout.Group>

                <div className={styles.spacer}></div>
                
            </FormLayout>


        </TextContainer>
    )
}

export default CustomizeSettings
