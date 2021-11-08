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
import EditorSteps from "../../components/editor-steps/editor-steps";

const Completion = (props) => {
  const {
    onboarded,
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
                <p>
                  The HeyThanks cart <b>Tips Widget</b> will be installed as an <b>App Block</b> on your Storefront 2.0 theme. An <b>App Block</b> is a section of customer-facing UI that can be added and modified in the drag and drop theme editor.
                </p>
                <EditorSteps onboarded={onboarded}></EditorSteps>
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
