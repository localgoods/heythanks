
import { Card, Heading, Select, TextContainer } from "@shopify/polaris"
import { useShop } from "../../../state/shop/context";

const CustomizeCard = () => {
    const [{
        onboarded,
        activePlan,
    }] = useShop();

    // Emoji Options
    const firstEmojiOptions = ['🙂']
    const secondEmojiOptions = ['🥰']
    
    // Style Options
    const backgroundColor = "#ffffff"
    const selectionColor = "#3678b4"
    const strokeColor = "#d9d9d9"
    const strokeWidth = 2
    const cornerRadius = 2

    // Text Options
    const labelText = "Send a tip directly to your fulfillment workers 💜"
    const tooltipText = "HeyThanks is a service that delivers your tips directly to the fulfillment employees who pick, pack, and ship your order."

    return (
        <Card sectioned>
            <Card.Section>
                <TextContainer>
                    <Heading>
                        {!onboarded ? "Your widget settings" : "Change your widget settings" }
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
                            onChange={() => {}}
                        ></Select>
                    </TextContainer>
                    <TextContainer>
                        <Select
                            label="Second Emoji"
                            options={secondEmojiOptions}
                            value={secondEmojiOptions[0]}
                            onChange={() => {}}
                        ></Select>
                    </TextContainer>
                </TextContainer>
            </Card.Section>
        </Card>
    )
}

export default CustomizeCard