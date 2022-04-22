
import { Card, ChoiceList, ColorPicker, Heading, RangeSlider, Select, TextContainer, TextField } from "@shopify/polaris"
import { useCallback, useState } from "react";
import { hexToHsl, hslToHex } from "../../../helpers/colors";
import { useShop } from "../../../state/shop/context";

const CustomizeInputs = () => {
    const [{
        onboarded,
        activePlan,
    }] = useShop();

    // Emoji Options
    const firstEmojiOptions = ['🙂']
    const secondEmojiOptions = ['🥰']

    // Style Options
    const [backgroundColor, setBackgroundColor] = useState("#ffffff")
    const [backgroundColorRgb, setBackgroundColorRgb] = useState({ hue: 255, brightness: 255, saturation: 255 })
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

    const [selectionColor, setSelectionColor] = useState("#3678b4")
    const [selectionColorRgb, setSelectionColorRgb] = useState({ hue: 54, brightness: 120, saturation: 180 })
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

    const [strokeColor, setStrokeColor] = useState("#d9d9d9")
    const [strokeColorRgb, setStrokeColorRgb] = useState({ hue: 217, brightness: 217, saturation: 217 })
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

    const [strokeWidth, setStrokeWidth] = useState(2);
    const handleStrokeWidthChange = useCallback(
        (value) => setStrokeWidth(value),
        [],
    );

    const [cornerRadius, setCornerRadius] = useState(2)
    const handleCornerRadiusChange = useCallback(
        (value) => setCornerRadius(value),
        [],
    );

    const [displayStatus, setDisplayStatus] = useState('hidden')

    // Text Options
    const [labelText, setLabelText] = useState("Send a tip directly to your fulfillment workers 💜")
    const [tooltipText, setTooltipText] = useState("HeyThanks is a service that delivers your tips directly to the fulfillment employees who pick, pack, and ship your order.")

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
          <TextContainer>
              <Select
                  label="First Emoji"
                  options={firstEmojiOptions}
                  value={firstEmojiOptions[0]}
                  onChange={() => { }}
              ></Select>
          </TextContainer>
          <TextContainer>
              <Select
                  label="Second Emoji"
                  options={secondEmojiOptions}
                  value={secondEmojiOptions[0]}
                  onChange={() => { }}
              ></Select>
          </TextContainer>

          <TextContainer>
              <span>Background Color</span>
              <ColorPicker
                  color={backgroundColorRgb}
                  onChange={handleBackgroundColorChange}
              ></ColorPicker>
          </TextContainer>
          <TextContainer>
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
          </TextContainer>
          <TextContainer>
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
          </TextContainer>
          <TextContainer>
              <TextField
                  value={strokeColor}
                  onChange={handleStrokeColorChange}
                  autoComplete="off"
              ></TextField>
          </TextContainer>

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

          <TextContainer>
            <ChoiceList
              title="Display Status"
              choices={[
                {label: 'Hidden – not visible in your store', value: 'hidden'},
                {label: 'Preview – only visible in your theme editor', value: 'preview'},
                {label: 'Display – visible in your live store', value: 'display'},
              ]}
              selected={displayStatus}
              onChange={setDisplayStatus}
            />
          </TextContainer>
      </TextContainer>
    )
}

export default CustomizeInputs
