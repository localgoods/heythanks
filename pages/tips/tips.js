import {
  Button,
  Card,
  DisplayText,
  Frame,
  Heading,
  Layout,
  Loading,
  Page,
  TextContainer,
  TextField,
} from "@shopify/polaris";
import styles from "./tips.module.css";

import { useMutation, useQuery } from "@apollo/client";
import { CREATE_TIP_PRODUCT } from "../../graphql/mutations/create-tip-product";
import { UPDATE_TIP_PRODUCT_VARIANT } from "../../graphql/mutations/update-tip-product-variant";
import { useState } from "react";
import { GET_PRODUCT_BY_HANDLE } from "../../graphql/queries/get-product-by-handle";

const Tips = (props) => {
  const {
    currentStep,
    setCurrentStep,
    disableButtons,
    setDisableButtons,
  } = props;

  const [firstPrice, setFirstPrice] = useState("1");
  const [secondPrice, setSecondPrice] = useState("5");

  const [createTipProduct] = useMutation(CREATE_TIP_PRODUCT, {
    refetchQueries: ["getProductByHandle"],
  });
  const [updateTipProductVariant] = useMutation(UPDATE_TIP_PRODUCT_VARIANT, {
    refetchQueries: ["getProductByHandle"],
  });
  const { data: existingProductData, loading, error } = useQuery(
    GET_PRODUCT_BY_HANDLE,
    {
      variables: { handle: "fulfillment-tip" },
      onCompleted: (newProductData) => {
        const productId = newProductData?.productByHandle?.id;
        if (productId) {
          const { edges } = newProductData.productByHandle.variants;
          const productVariantNodes = edges.map((edge) => edge.node);
          for (let i = 0; i < productVariantNodes.length; i++) {
            const node = productVariantNodes[i];
            const { price } = node;
            let priceString = price.toString();
            if (priceString.includes(".00")) {
              priceString = priceString.replace(".00", "");
            }
            if (i === 0) {
              setFirstPrice(priceString);
            } else {
              setSecondPrice(priceString);
            }
          }
        }
      },
    }
  );

  if (loading)
    return (
      <div style={{ height: "100px" }}>
        <Frame>
          <Loading />
        </Frame>
      </div>
    );

  if (error)
    return (
      <div style={{ height: "100px" }}>
        <Frame>
          <p>`Error! ${error.message}`</p>
        </Frame>
      </div>
    );

  return (
    <Page
      breadcrumbs={[{ onAction: () => setCurrentStep(currentStep - 1) }]}
      title={`Step ${currentStep}`}
    >
      <TextContainer>
        <DisplayText size="large">Confirm your tip options</DisplayText>
        <DisplayText size="small">
          Please select and confirm the prices for your two tip options. You can
          change these prices whenever and however many times you'd like.
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
                    disabled={disableButtons}
                    fullWidth
                    size="large"
                    primary
                    onClick={async () => {
                      setDisableButtons(true);
                      const productId = existingProductData.productByHandle?.id;
                      if (productId) {
                        const {
                          edges,
                        } = existingProductData.productByHandle.variants;
                        const productVariantNodes = edges.map(
                          (edge) => edge.node
                        );
                        for (let i = 0; i < productVariantNodes.length; i++) {
                          const node = productVariantNodes[i];
                          const { id } = node;
                          const price = i === 0 ? firstPrice : secondPrice;
                          const productVariantInput = { id, price };
                          await updateTipProductVariant({
                            variables: { input: productVariantInput },
                          });
                        }
                      } else {
                        const productInput = {
                          bodyHtml:
                            "Tip that goes directly to the fulfillment workers of an order",
                          title: "Fulfillment Tip",
                          productType: "Tip",
                          vendor: "HeyThanks",
                          status: "ACTIVE",
                          published: true,
                          images: [
                            {
                              src:
                                "https://storage.googleapis.com/heythanks-app-images/TipIcon.png",
                              altText: "Tip Icon",
                            },
                          ],
                          variants: [
                            { options: ["1"], price: firstPrice },
                            { options: ["2"], price: secondPrice },
                          ],
                          options: ["Option"],
                        };
                        await createTipProduct({
                          variables: { input: productInput },
                        });
                      }
                      setCurrentStep(currentStep + 1);
                      setDisableButtons(false);
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
