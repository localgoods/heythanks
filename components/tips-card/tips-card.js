import { useMutation } from "@apollo/client";
import {
  Card,
  Heading,
  TextContainer,
  TextField,
  Button,
  TextStyle,
  ButtonGroup,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import { CREATE_TIP_PRODUCT } from "../../graphql/mutations/create-tip-product";
import { UPDATE_TIP_PRODUCT_VARIANT } from "../../graphql/mutations/update-tip-product-variant";
import styles from "./tips-card.module.css";

const TipsCard = (props) => {
  const {
    onboarded,
    activePlan,
    currentStep,
    setCurrentStep,
    disableButtons,
    setDisableButtons,
    productData,
    productDataLoading,
  } = props;

  const [tipOptionsChanged, setTipOptionsChanged] = useState(false);

  const [createTipProduct] = useMutation(CREATE_TIP_PRODUCT, {
    refetchQueries: ["getProductByHandle"],
  });
  const [updateTipProductVariant] = useMutation(UPDATE_TIP_PRODUCT_VARIANT, {
    refetchQueries: ["getProductByHandle"],
  });

  const getPricesByProductId = (productId) => {
    const prices = {
      first: '0',
      second: '0',
    }
    if (productId) {
      const { edges } = productData.productByHandle.variants;
      const productVariantNodes = edges.map((edge) => edge.node);
      for (let i = 0; i < productVariantNodes.length; i++) {
        const node = productVariantNodes[i];
        const { price } = node;
        let priceString = price.toString();
        if (priceString.includes(".00")) {
          priceString = priceString.replace(".00", "");
        }
        if (i === 0) {
          prices.first = priceString;
        } else {
          prices.second = priceString;
        }
      }
    }
    return prices;
  }

  const { first: initialFirstPrice, second: initialSecondPrice } = getPricesByProductId(productData?.productByHandle?.id); 

  const [firstPrice, setFirstPrice] = useState(initialFirstPrice);
  const [secondPrice, setSecondPrice] = useState(initialSecondPrice);

  useEffect(() => {
    const productId = productData?.productByHandle?.id;
    const { first, second } = getPricesByProductId(productId);
    setFirstPrice(first);
    setSecondPrice(second);
  }, [productData]);

  useEffect(() => {
    if (firstPrice !== initialFirstPrice || secondPrice !== initialSecondPrice) {
      setTipOptionsChanged(true);
    } else {
      setTipOptionsChanged(false);
    }
  }, [firstPrice, secondPrice]);

  const handleReset = () => {
    setFirstPrice(initialFirstPrice);
    setSecondPrice(initialSecondPrice);
  };

  const handleSubmit = async () => {
    setDisableButtons(true);
    const productId = productData?.productByHandle?.id;
    if (productId) {
      const { edges } = productData.productByHandle.variants;
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
      console.log("Creating tip product...");
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
    if (currentStep && setCurrentStep) setCurrentStep(currentStep + 1);
    setDisableButtons(false);
  };

  return (
    <Card sectioned>
      <Card.Section>
        <TextContainer>
          <Heading>
            {!currentStep ? "Change your tip options" : "Your tip options"}
          </Heading>
          {!activePlan && (
            <TextStyle variation="negative">
              Please renew your plan to edit tips.
            </TextStyle>
          )}
          <TextContainer>
            <TextField
              label="Tip option 1"
              type="number"
              value={productDataLoading ? "" : firstPrice}
              onChange={setFirstPrice}
              prefix="$"
              autoComplete="off"
              helpText="This should be the smallest tip amount"
            />
            <TextField
              label="Tip option 2"
              type="number"
              value={productDataLoading ? "" : secondPrice}
              onChange={setSecondPrice}
              prefix="$"
              autoComplete="off"
              helpText="This should be the largest tip amount"
            />
          </TextContainer>
          {onboarded ? (
            <ButtonGroup>
              <Button
                disabled={!tipOptionsChanged || disableButtons}
                size="large"
                onClick={handleReset}
              >Reset</Button>
              <Button
                disabled={!tipOptionsChanged || disableButtons || !activePlan}
                loading={productDataLoading || disableButtons}
                size="large"
                primary
                onClick={handleSubmit}
              >
                {!currentStep ? "Save changes" : "Confirm and continue"}
              </Button>
            </ButtonGroup>
          ) : (
            <Button
              fullWidth
              disabled={disableButtons || !activePlan}
              loading={productDataLoading || disableButtons}
              size="large"
              primary
              onClick={handleSubmit}
            >
              Confirm and continue
            </Button>
          )}
        </TextContainer>
      </Card.Section>
    </Card>
  );
};

export default TipsCard;
