import {
  Button,
  ButtonGroup,
  Card,
  DisplayText,
  Layout,
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
        You made it! Click the complete button below to start changing the
        world! You'll be taken to the cart in your theme editor to insert,
        customize and deploy HeyThanks to your store.
      </DisplayText>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Card.Section>
              <TextContainer>
                <div className={styles.img__placeholder}>
                  <span>Editor add-section demo GIF</span>
                </div>
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
