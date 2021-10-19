import { useMutation, useQuery } from "@apollo/client";
import { Card, Heading, TextContainer, TextField, Button } from "@shopify/polaris";
import { useState } from "react";
import { CREATE_TIP_PRODUCT } from "../../graphql/mutations/create-tip-product";
import { UPDATE_TIP_PRODUCT_VARIANT } from "../../graphql/mutations/update-tip-product-variant";
import { GET_PRODUCT_BY_HANDLE } from "../../graphql/queries/get-product-by-handle";
import styles from "./tips-card.module.css";

const TipsCard = (props) => {
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

  const { data: existingProductData, loading } = useQuery(
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
  return (
    <Card sectioned>
      <Card.Section>
        <TextContainer>
          <Heading>{ !currentStep ? 'Change your tip options' : 'Your tip options' }</Heading>
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
            loading={loading || disableButtons}
            size="large"
            primary
            onClick={async () => {
              setDisableButtons(true);
              const productId = existingProductData.productByHandle?.id;
              if (productId) {
                const { edges } = existingProductData.productByHandle.variants;
                const productVariantNodes = edges.map((edge) => edge.node);
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
              if (currentStep && setCurrentStep)
                setCurrentStep(currentStep + 1);
              setDisableButtons(false);
            }}
          >
            { !currentStep ? 'Save changes' : 'Confirm and continue' }
          </Button>
        </TextContainer>
      </Card.Section>
    </Card>
  );
};

export default TipsCard;
