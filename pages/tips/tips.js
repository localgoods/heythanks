import {
  Button,
  Card,
  DisplayText,
  Heading,
  Layout,
  Page,
  TextContainer,
  TextField,
} from "@shopify/polaris";
import styles from "./tips.module.css";

import { useMutation } from "@apollo/client";
import { CREATE_TIP_PRODUCT } from "../../graphql/mutations/create-tip-product";
import { useState } from "react";

// Todo: get a remote Shopify URL for this image
// import TipIconSrc from "../../public/images/TipIcon.png";

const Tips = (props) => {
  const { currentStep, setCurrentStep } = props;

  const [firstPrice, setFirstPrice] = useState("1");
  const [secondPrice, setSecondPrice] = useState("5");

  const [createTipProduct] = useMutation(CREATE_TIP_PRODUCT);

  return (
    <Page
      breadcrumbs={[{ onAction: () => setCurrentStep(currentStep - 1) }]}
      title={`Step ${currentStep}`}
    >
      <TextContainer>
        <DisplayText size="large">Confirm your tip options</DisplayText>
        <DisplayText size="small">
          Please select and confirm the prices for your two fulfillment tip
          options. These options will be displayed in your cart.
        </DisplayText>
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <Card.Section>
                <TextContainer>
                  <Heading>Your tip options</Heading>
                  <TextContainer>
                    <TextField
                      label="Tip option 1"
                      type="number"
                      value={firstPrice}
                      onChange={setFirstPrice}
                      prefix="$"
                      autoComplete="off"
                      helpText="This should be the smallest tip amount"
                    />
                    <TextField
                      label="Tip option 2"
                      type="number"
                      value={secondPrice}
                      onChange={setSecondPrice}
                      prefix="$"
                      autoComplete="off"
                      helpText="This should be the largest tip amount"
                    />
                  </TextContainer>
                  <Button
                    fullWidth
                    size="large"
                    primary
                    onClick={async () => {
                      const input = {
                        bodyHtml:
                          "Tip that goes directly to the fulfillment workers of an order",
                        title: "Fulfillment Tip",
                        productType: "Tip",
                        vendor: "HeyThanks",
                        status: "ACTIVE",
                        published: true,
                        // images: [
                        //   {
                        //     src: TipIconSrc,
                        //   },
                        // ],
                        variants: [
                          { options: ["1"], price: firstPrice },
                          { options: ["2"], price: secondPrice },
                        ],
                        options: ["Option"],
                      };
                      const response = await createTipProduct({
                        variables: { input },
                      });
                      console.log(response);
                      // setCurrentStep(currentStep + 1);
                    }}
                  >
                    Confirm and continue
                  </Button>
                </TextContainer>
              </Card.Section>
            </Card>
          </Layout.Section>
        </Layout>
      </TextContainer>
    </Page>
  );
};

export default Tips;
