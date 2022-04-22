import {
  Button,
  ButtonGroup,
  Card,
  DisplayText,
  Layout,
  TextContainer,
} from "@shopify/polaris";
import styles from "./completion.module.css";

import EditorButton from "../../elements/editor-button/editor-button";
import EditorSteps from "../../modules/editor-steps/editor-steps";
import CustomizeInputs from "../../modules/customize-inputs/customize-inputs";
import { useShop } from "../../../state/shop/context";
import { useSettings } from "../../../state/settings/context";
import InstallButton from "../../elements/install-button/install-button";

const Completion = () => {
  const [{
    privateMetafieldValue,
    upsertPrivateMetafield,
  }] = useShop();

  const [{ disableButtons, setDisableButtons }] = useSettings();

  return (
    <TextContainer>
      <DisplayText size="large">Add HeyThanks to your cart page</DisplayText>
      <DisplayText size="small">
        Follow these final steps to add HeyThanks to your cart page and start
        changing the world! You will be able to customize and preview any
        changes before you publish them.
      </DisplayText>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Card.Section>
              <TextContainer>
                <CustomizeInputs />
                {/* <EditorSteps /> */}
                <ButtonGroup fullWidth>
                  <InstallButton></InstallButton>
                  <EditorButton />
                  <Button
                    loading={disableButtons}
                    primary
                    size="large"
                    onClick={async () => {
                      setDisableButtons(true);
                      const existingValue = privateMetafieldValue
                        ? privateMetafieldValue
                        : {};
                      const privateMetafieldInput = {
                        namespace: "heythanks",
                        key: "shop",
                        valueInput: {
                          value: JSON.stringify({
                            ...existingValue,
                            onboarded: true,
                          }),
                          valueType: "JSON_STRING"
                        }
                      };
                      await upsertPrivateMetafield({
                        variables: { input: privateMetafieldInput },
                      });
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
