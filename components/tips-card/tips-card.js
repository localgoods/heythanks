import {
  Card,
  Heading,
  TextContainer,
  TextField,
  Button,
  TextStyle,
  ButtonGroup,
} from "@shopify/polaris"
import { useEffect, useState } from "react"
import { useSettings } from "../../state/settings/context"
import { useShop } from "../../state/shop/context"

import localStyles from './tips-card.module.css'
import globalStyles from '../../pages/index.module.css'
const styles = { ...localStyles, ...globalStyles }

const TipsCard = () => {
  const [{
    currentStep,
    setCurrentStep,
    disableButtons,
    setDisableButtons,
  }] = useSettings()

  const [tipOptionsChanged, setTipOptionsChanged] = useState(false)

  const [{
    createTipProduct,
    updateTipProductVariant,
    onboarded,
    activePlan,
    productData,
    productDataLoading,
    getProductPrices
  }] = useShop()

  const {
    first: initialFirstPrice,
    second: initialSecondPrice,
  } = getProductPrices(productData)

  const [firstPrice, setFirstPrice] = useState(initialFirstPrice)
  const [secondPrice, setSecondPrice] = useState(initialSecondPrice)

  useEffect(() => {
    const ac = new AbortController()
    console.log(initialFirstPrice, initialSecondPrice)
    setFirstPrice(initialFirstPrice)
    setSecondPrice(initialSecondPrice)
    return ac.abort()
  }, [productData])

  useEffect(() => {
    const ac = new AbortController()
    console.log(firstPrice, secondPrice)
    console.log(initialFirstPrice, initialSecondPrice)
    if (
      firstPrice !== initialFirstPrice ||
      secondPrice !== initialSecondPrice
    ) {
      setTipOptionsChanged(true)

    } else {
      setTipOptionsChanged(false)
    }

    /* Push update to settings in preview */
    const ev = new Event("pricesupdate", { bubbles: true, cancelable: true })
    window.dispatchEvent(ev)

    return ac.abort()
  }, [firstPrice, secondPrice])

  const handleReset = () => {
    setFirstPrice(initialFirstPrice)
    setSecondPrice(initialSecondPrice)
  }

  const handleSubmit = async () => {
    setDisableButtons(true)
    const productId = productData?.productByHandle?.id
    if (productId) {
      const { edges } = productData.productByHandle.variants
      const productVariantNodes = edges.map((edge) => edge.node)
      for (let i = 0; i < productVariantNodes.length; i++) {
        const node = productVariantNodes[i]
        const { id } = node
        const price = i === 0 ? firstPrice : secondPrice
        const productVariantInput = { id, price }
        const resp = await updateTipProductVariant({
          variables: { input: productVariantInput },
        })
        console.log('resp', resp)
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
      }
      const resp = await createTipProduct({
        variables: { input: productInput },
      })
      console.log('resp', resp)
    }
    if (currentStep && setCurrentStep) setCurrentStep(currentStep + 1)
    console.log('currentStep', currentStep)
    setDisableButtons(false)
  }

  return (
    <Card sectioned>
      <Card.Section>
        <TextContainer>
          <Heading>
            {!onboarded ? "Your tip options" : "Change your tip options"}
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
              min={1}
              value={productDataLoading ? "" : firstPrice}
              onChange={setFirstPrice}
              prefix="$"
              autoComplete="off"
              helpText="This should be the smallest tip amount"
            />
            <TextField
              label="Tip option 2"
              type="number"
              min={1}
              value={productDataLoading ? "" : secondPrice}
              onChange={setSecondPrice}
              prefix="$"
              autoComplete="off"
              helpText="This should be the largest tip amount"
            />
          </TextContainer>

          <div id="heythanks-prices" data-prices={JSON.stringify({ firstPrice, secondPrice })}></div>

          <div className={styles.spacer}></div>

          {!onboarded ? (
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
          ) :
            (<ButtonGroup>
              <Button
                disabled={!tipOptionsChanged || disableButtons}
                size="large"
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button
                disabled={!tipOptionsChanged || disableButtons || !activePlan}
                loading={productDataLoading || disableButtons}
                size="large"
                primary
                onClick={handleSubmit}
              >
                Save changes
              </Button>
            </ButtonGroup>)
          }
        </TextContainer>
      </Card.Section>
    </Card>
  )
}

export default TipsCard
