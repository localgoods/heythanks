import {
  Button,
  ButtonGroup,
  Card,
  DisplayText,
  Heading,
  Layout,
  List,
  TextContainer,
} from "@shopify/polaris";
import styles from "./completion.module.css";

import EditorButton from "../../components/editor-button/editor-button";

const Completion = (props) => {
  const {
    privateMetafieldValue,
    upsertPrivateMetafield,
    myshopifyDomain,
    disableButtons,
    setDisableButtons,
  } = props;

  return (
    <TextContainer>
      <DisplayText size="large">Add HeyThanks to your cart page</DisplayText>
      <DisplayText size="small">
        Follow these final steps to add HeyThanks to your cart page and start changing the world! You will be able to customize and preview any changes before you publish them.
      </DisplayText>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Card.Section>
              <TextContainer>
                <Heading>Steps to add HeyThanks to your cart page</Heading>
                <List type="number">
                  <List.Item>Launch your cart page in a new tab by pressing the <b>Launch theme editor</b> button in the bottom left below</List.Item>
                  <List.Item>If your cart is empty, add a product to your cart and return to your cart page (to make HeyThanks visible on the page)</List.Item>
                  <List.Item>In your editor side panel, press <b>Add section</b></List.Item>
                  <List.Item>In the popup menu, scroll down to the <b>APPS</b> section and press the <b>Tips block</b> by Heythanks</List.Item>
                  <List.Item>In the side panel, press on the newly added HeyThanks <b>Apps</b> section (the one with the Tips block inside of it) and check "Make section margins the same as theme"</List.Item>
                  <List.Item>Navigate back to the side panel showing all cart sections</List.Item>
                  <List.Item>In the side panel, hover over the HeyThanks <b>Apps</b> section, and press and hold the drag handle icon on the right to position HeyThanks (we recommend between the <b>Items</b> and <b>Subtotal</b> sections</List.Item>
                  <List.Item>In the side panel, press on the HeyThanks <b>Tips block</b> and configure your styles as you wish</List.Item>
                  <List.Item>Press <b>Save</b> in the top right of the editor to save your changes, and then you may close the tab</List.Item>
                  <List.Item>Press the <b>Complete onboarding</b> button in the bottom right below (because you're done! 🎉)</List.Item>
                </List>
                <ButtonGroup fullWidth>
                  <EditorButton
                    myshopifyDomain={myshopifyDomain}
                  ></EditorButton>
                  <Button
                    loading={disableButtons}
                    primary
                    size="large"
                    onClick={async () => {
                      setDisableButtons(true);
                      const existingValue = privateMetafieldValue ? privateMetafieldValue : {};
                      const privateMetafieldInput = {
                        namespace: "heythanks",
                        key: "shop",
                        valueInput: {
                          value: JSON.stringify({ ...existingValue, onboarded: true }),
                          valueType: "JSON_STRING",
                        },
                      };
                      await upsertPrivateMetafield({ variables: { input: privateMetafieldInput } });
                      await new Promise((resolve) => setTimeout(resolve, 1000));
                      setDisableButtons(false);
                    }}
                  >
                    Complete onboarding
                  </Button>
                </ButtonGroup>
              </TextContainer>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </TextContainer>
  );
};

export default Completion;
