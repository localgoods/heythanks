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
    first,
    second,
  } = getProductPrices(productData)

  const [initialFirstPrice, setInitialFirstPrice] = useState(first)
  const [initialSecondPrice, setInitialSecondPrice] = useState(second)

  const [firstPrice, setFirstPrice] = useState(initialFirstPrice)
  const [secondPrice, setSecondPrice] = useState(initialSecondPrice)

  useEffect(() => {
    const ac = new AbortController()
    setInitialFirstPrice(firstPrice)
    setInitialSecondPrice(secondPrice)
    setTipOptionsChanged(false)
    return ac.abort()
  }, [productData])

  useEffect(() => {
    const ac = new AbortController()
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
        const option = i === 0 ? "L" : "XL"
        const price = i === 0 ? firstPrice : secondPrice
        const priceString = parseFloat(price).toFixed(2)
        const options = [`${option}`]
        const productVariantInput = { id, options, price: priceString }
        await updateTipProductVariant({
          variables: { input: productVariantInput }
        })
      }
    } else {
      const firstPriceString = parseFloat(firstPrice).toFixed(2)
      const secondPriceString = parseFloat(secondPrice).toFixed(2)
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
        options: ["Option"],
        variants: [
          // Todo: change option names to match prices and update app
          // Also see if we can remove the option names?
          { options: ["L"], position: 0, price: firstPriceString },
          { options: ["XL"], position: 1, price: secondPriceString }
        ]
      }
      await createTipProduct({
        variables: { input: productInput },
      })
    }
    if (currentStep && setCurrentStep) setCurrentStep(currentStep + 1)
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
              min={1.00}
              value={productDataLoading ? "0.00" : parseFloat(firstPrice).toFixed(2)}
              onChange={setFirstPrice}
              prefix="$"
              autoComplete="off"
              helpText="This should be the smallest tip amount"
            />
            <TextField
              label="Tip option 2"
              type="number"
              min={(parseFloat(firstPrice) + 0.01).toFixed(2)}
              value={productDataLoading ? "0.00" : parseFloat(secondPrice).toFixed(2)}
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
