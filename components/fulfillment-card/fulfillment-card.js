import {
  Card,
  Heading,
  ResourceList,
  ResourceItem,
  TextContainer,
  TextStyle,
  Button,
  TextField,
  Thumbnail,
  ButtonGroup,
} from "@shopify/polaris"

import localStyles from './fulfillment-card.module.css'
import globalStyles from '../../pages/index.module.css'
const styles = { ...localStyles, ...globalStyles }

import { useEffect, useState } from "react"
import { useShop } from "../../state/shop/context"
import { useSettings } from "../../state/settings/context"

const FulfillmentCard = () => {
  const [{
    onboarded,
    privateMetafieldValue,
    fulfillmentManual,
    fulfillmentEmail,
    fulfillmentPhone,
    fulfillmentBearerToken,
    fulfillmentRefreshToken,
    fulfillmentService,
    fulfillmentServices,
    upsertPrivateMetafield,
  }] = useShop()

  const [{
    currentStep,
    setCurrentStep,
    disableButtons,
    setDisableButtons,
  }] = useSettings()

  const [selectedItems, setSelectedItems] = useState([fulfillmentService])

  const handleSelectionChange = (changeSelectedItems) => {
    if (changeSelectedItems.length < 2) {
      setSelectedItems(changeSelectedItems)
    } else {
      setSelectedItems(
        changeSelectedItems.filter((item) => !selectedItems.includes(item))
      )
    }
  }

  const handleResourceItemClick = (resourceItemId) => {
    setSelectedItems([resourceItemId])
  }

  useEffect(() => {
    const ac = new AbortController()
    const selectedItem = selectedItems?.[0]
    setUpdatedFulfillmentManual(selectedItem === "Manual self-fulfillment")
    if (selectedItem !== "Other") {
      const updatedFulfillmentService = selectedItem
      setUpdatedFulfillmentService(updatedFulfillmentService)
    } else {
      const updatedFulfillmentService = !resourceListItems.includes(
        (item) => item.name === fulfillmentService
      )
        ? fulfillmentService
        : ""
      setUpdatedFulfillmentService(updatedFulfillmentService)
    }
    if (selectedItem && !resourceListItemNames.includes(selectedItem)) {
      setSelectedItems(["Other"])
    }
    return ac.abort()
  }, [selectedItems])

  const [updatedFulfillmentManual, setUpdatedFulfillmentManual] = useState(
    fulfillmentManual ? fulfillmentManual : false
  )

  const resourceListItems = [
    {
      thumbnailSource:
        "https://storage.googleapis.com/heythanks-app-images/HomeMajor.svg",
      name: "Manual self-fulfillment",
      description:
        "I fulfill orders manually, without professional assistance (i.e. from my home)",
    },
    {
      thumbnailSource:
        "https://storage.googleapis.com/heythanks-app-images/WholesaleMajor.svg",
      name: "Professional self-fulfillment",
      description:
        "I manage my own professional fulfillment and warehouse (i.e. do not use a 3PL or dropship)",
    },
    {
      thumbnailSource:
        "https://storage.googleapis.com/heythanks-app-images/ShipHero.png",
      name: "ShipHero",
      description: "I fulfill orders with ShipHero 3PL",
    },
    // {
    //   thumbnailSource:
    //     "https://storage.googleapis.com/heythanks-app-images/ShipBob.png",
    //   name: "ShipBob",
    //   description: "I fulfill orders with ShipBob",
    // },
    {
      thumbnailSource:
        "https://storage.googleapis.com/heythanks-app-images/ShipmentMajor.svg",
      name: "Other",
      description: "I fulfill orders with another service not mentioned above",
    },
  ]

  const resourceListItemNames = resourceListItems.map((item) => item.name)

  const getFulfillmentService = () => {
    return fulfillmentServices?.find(
      (fulfillmentService) => fulfillmentService.type !== "MANUAL"
    )
  }

  const [updatedFulfillmentService, setUpdatedFulfillmentService] = useState(
    fulfillmentService || getFulfillmentService()?.serviceName || ""
  )

  const [updatedFulfillmentPhone, setUpdatedFulfillmentPhone] = useState(
    fulfillmentPhone || getFulfillmentService()?.location?.address.phone || ""
  )
  const [updatedFulfillmentEmail, setUpdatedFulfillmentEmail] = useState(
    fulfillmentEmail || ""
  )
  const [
    updatedFulfillmentBearerToken,
    setUpdatedFulfillmentBearerToken,
  ] = useState(fulfillmentBearerToken || "")
  const [
    updatedFulfillmentRefreshToken,
    setUpdatedFulfillmentRefreshToken,
  ] = useState(fulfillmentRefreshToken || "")

  const requiredFields =
    updatedFulfillmentService === "Manual self-fulfillment" ||
      updatedFulfillmentService === "Professional self-fulfillment"
      ? []
      : updatedFulfillmentService === "ShipHero" ||
        updatedFulfillmentService === "ShipBob"
        ? [updatedFulfillmentBearerToken, updatedFulfillmentRefreshToken]
        : [
          updatedFulfillmentService,
          updatedFulfillmentPhone,
          updatedFulfillmentEmail,
        ]

  const fulfillmentIncomplete = !requiredFields.every((field) => !!field)

  const fulfillmentChanged =
    fulfillmentService !== updatedFulfillmentService ||
    fulfillmentPhone !== updatedFulfillmentPhone ||
    fulfillmentEmail !== updatedFulfillmentEmail ||
    fulfillmentBearerToken !== updatedFulfillmentBearerToken ||
    fulfillmentRefreshToken !== updatedFulfillmentRefreshToken ||
    fulfillmentManual !== updatedFulfillmentManual

  const handleSubmit = async () => {
    setDisableButtons(true)
    const existingValue = privateMetafieldValue ? privateMetafieldValue : {}
    const privateMetafieldInput = {
      namespace: "heythanks",
      key: "shop",
      valueInput: {
        value: JSON.stringify({
          ...existingValue,
          fulfillmentManual: updatedFulfillmentManual,
          fulfillmentService: updatedFulfillmentService,
          fulfillmentPhone: updatedFulfillmentPhone,
          fulfillmentEmail: updatedFulfillmentEmail,
          fulfillmentBearerToken: updatedFulfillmentBearerToken,
          fulfillmentRefreshToken: updatedFulfillmentRefreshToken,
        }),
        valueType: "JSON_STRING",
      },
    }
    await upsertPrivateMetafield({
      variables: { input: privateMetafieldInput },
    })
    if (currentStep) {
      setCurrentStep(currentStep + 1)
    }
    setDisableButtons(false)
  }

  const handleReset = () => {
    setSelectedItems([fulfillmentService])
    setUpdatedFulfillmentManual(fulfillmentManual)
    setUpdatedFulfillmentService(fulfillmentService)
    setUpdatedFulfillmentPhone(fulfillmentPhone)
    setUpdatedFulfillmentEmail(fulfillmentEmail)
    setUpdatedFulfillmentBearerToken(fulfillmentBearerToken)
    setUpdatedFulfillmentRefreshToken(fulfillmentRefreshToken)
  }

  return (
    <Card sectioned>
      <Card.Section>
        <TextContainer>
          <Heading>
            {!onboarded ? "Your" : "Change your"} fulfillment information
          </Heading>
          <ResourceList
            showHeader={false}
            items={resourceListItems}
            renderItem={(item) => {
              const { thumbnailSource, name, description } = item

              return (
                <ResourceItem
                  id={name}
                  media={
                    <Thumbnail
                      size="small"
                      name={name}
                      source={thumbnailSource}
                    />
                  }
                  accessibilityLabel={`Select ${name} as your fulfillment service`}
                  name={name}
                  onClick={handleResourceItemClick}
                >
                  <h3>
                    <TextStyle variation="strong">{name}</TextStyle>
                  </h3>
                  <div>{description}</div>
                </ResourceItem>
              )
            }}
            selectedItems={selectedItems}
            onSelectionChange={handleSelectionChange}
            selectable
          />
          {updatedFulfillmentService === "Manual self-fulfillment" ||
            updatedFulfillmentService === "Professional self-fulfillment" ? (
            <TextContainer>
              <p>
                Your fulfillment information will be the same as your store.
              </p>
            </TextContainer>
          ) : updatedFulfillmentService === "ShipHero" ? (
            <TextContainer>
              <p>
                HeyThanks needs a <b>bearer token</b> and <b>refresh token</b>{" "}
                to access your fulfillment data without using your credentials
                directly. You can get these tokens by going to{" "}
                <a
                  href="https://app.shiphero.com/dashboard/users"
                  target="_blank"
                >
                  https://app.shiphero.com/dashboard/users
                </a>{" "}
                and clicking <b>+ Add Third-Party Developer</b>. Enter the
                developer first name as "HeyThanks", last name as "Inc", email
                as "dev@heythanks.io" and press <b>Add Developer</b>. Paste the
                tokens returned from ShipHero below.
              </p>
              <TextField
                label="Bearer token"
                value={updatedFulfillmentBearerToken}
                onChange={setUpdatedFulfillmentBearerToken}
                autoComplete="off"
                helpText="HeyThanks needs a bearer token to access your fulfillment data without using your credentials directly."
              />
              <TextField
                label="Refresh token"
                value={updatedFulfillmentRefreshToken}
                onChange={setUpdatedFulfillmentRefreshToken}
                autoComplete="off"
                helpText="HeyThanks needs a refresh token to access your fulfillment data without using your credentials directly."
              />
            </TextContainer>
          ) : updatedFulfillmentService === "ShipBob" ? (
            <TextContainer>
              {!updatedFulfillmentBearerToken ||
                !updatedFulfillmentRefreshToken ? (
                <TextContainer>
                  <p>
                    HeyThanks needs a <b>bearer token</b> and{" "}
                    <b>refresh token</b> to access your fulfillment data without
                    using your credentials directly. You can get these tokens by
                    clicking <b>Connect to ShipBob</b> and signing in to your
                    account.
                  </p>
                  <Button size="large" primary outline>
                    Connect to ShipBob
                  </Button>
                </TextContainer>
              ) : (
                <p>Your fulfillment information will be provided by ShipBob.</p>
              )}
            </TextContainer>
          ) : (
            <TextContainer>
              <TextField
                label="Fulfillment partner name"
                value={updatedFulfillmentService}
                onChange={setUpdatedFulfillmentService}
                autoComplete="off"
                helpText="This helps us cross reference against our database of known fulfillment partners. If you manage your own warehouse, please include your business name."
                disabled={updatedFulfillmentManual}
              />
              <TextField
                label="Fulfillment partner phone number"
                value={updatedFulfillmentPhone}
                onChange={setUpdatedFulfillmentPhone}
                autoComplete="off"
                helpText="We’ll use this number to connect with and onboard your fulfillment partner. If you manage your own warehouse, please include your own phone number."
                disabled={updatedFulfillmentManual}
              />
              <TextField
                type="email"
                label="Fulfillment partner email address"
                value={updatedFulfillmentEmail}
                onChange={setUpdatedFulfillmentEmail}
                autoComplete="off"
                helpText="We’ll use this address to connect with and onboard your fulfillment partner. If you manage your own warehouse, please include your own email address."
                disabled={updatedFulfillmentManual}
              />

            </TextContainer>

          )}

          <div className={styles.spacer}></div>

          {!onboarded ? (
            <Button
              loading={disableButtons}
              disabled={fulfillmentIncomplete}
              fullWidth={!onboarded}
              size="large"
              primary
              onClick={handleSubmit}
            >
              Confirm and continue
            </Button>
          ) : (
            <ButtonGroup>
              <Button
                size="large"
                disabled={!fulfillmentChanged}
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button
                loading={disableButtons}
                disabled={fulfillmentIncomplete || !fulfillmentChanged}
                fullWidth={!onboarded}
                size="large"
                primary
                onClick={handleSubmit}
              >
                Save changes
              </Button>
            </ButtonGroup>
          )}
        </TextContainer>
      </Card.Section>
    </Card>
  )
}

export default FulfillmentCard
