import {
  Badge,
  Button,
  Card,
  DisplayText,
  Heading,
  Layout,
  List,
  TextContainer,
  TextStyle,
} from "@shopify/polaris"
import styles from "./plan.module.css"

import { useAppBridge } from "@shopify/app-bridge-react"
import { Redirect } from "@shopify/app-bridge/actions"
import { useMutation } from "@apollo/client"

import { GET_BASIC_SUBSCRIPTION_URL } from "../../graphql/mutations/get-basic-subscription-url"
import { GET_PRO_SUBSCRIPTION_URL } from "../../graphql/mutations/get-pro-subscription-url"
import { GET_VIP_SUBSCRIPTION_URL } from "../../graphql/mutations/get-vip-subscription-url"
import { useSettings } from "../../state/settings/context"
import { useShop } from "../../state/shop/context"

const Plan = () => {
  const [
    {
      onboarded,
      activePlan,
      activePlanId,
      myshopifyDomain,
      fulfillmentManual,
      deleteCurrentSubscription,
    },
  ] = useShop()

  const [
    { currentStep, setCurrentStep, disableButtons, setDisableButtons },
  ] = useSettings()

  const app = useAppBridge()
  const redirect = Redirect.create(app)

  const [getBasicSubscriptionUrl] = useMutation(GET_BASIC_SUBSCRIPTION_URL)
  const [getProSubscriptionUrl] = useMutation(GET_PRO_SUBSCRIPTION_URL)
  const [getVipSubscriptionUrl] = useMutation(GET_VIP_SUBSCRIPTION_URL)

  const vipDomains = [
    "loop-chocolate.myshopify.com",
    "local-goods-ian-dev.myshopify.com",
    "local-goods-shane-dev.myshopify.com",
    "local-goods-dawn-staging.myshopify.com",
    "urban-edc-supply-staging.myshopify.com",
    "spotted-by-humphrey-staging.myshopify.com",
    "shopwayre-staging.myshopify.com",
    "urban-edc-supply.myshopify.com",
    "spotted-by-humphrey.myshopify.com",
    "shopwayre.myshopify.com"
  ]

  const vipDomain = vipDomains.includes(myshopifyDomain)

  if (vipDomain) console.log("You are on a VIP domain")

  return (
    <TextContainer>
      <DisplayText size="large">
        {!activePlan ? "Please pick a plan" : "Plan"}
      </DisplayText>
      <DisplayText size="small">
        {!activePlan
          ? "We only have two plans and you can cancel anytime. If you use professional fulfillment then you will need to use the Pro Plan."
          : "Manage your plan. Change or cancel anytime."}
      </DisplayText>
      <Layout>
        <Layout.Section oneHalf>
          <div className={styles.plan__selected}>
            <Card sectioned subdued={!fulfillmentManual}>
              <Card.Section>
                <TextContainer>
                  <DisplayText size="large">Basic Plan</DisplayText>
                  <div className={styles.plan__heading}>
                    <Heading>
                      <TextStyle variation="subdued">
                        Our basic plan is best for stores that fulfill manually,
                        without professional assistance.
                      </TextStyle>
                      <br></br>
                      <br></br>
                      {fulfillmentManual && (
                        <Badge status="success" size="medium">
                          Recommended for your shop
                        </Badge>
                      )}
                      {!fulfillmentManual && (
                        <Badge status="danger" size="medium">
                          Recommended for manual fulfillment
                        </Badge>
                      )}
                    </Heading>
                  </div>
                  <DisplayText size="large">
                    <TextStyle variation="subdued">$4.99/month</TextStyle>
                  </DisplayText>
                  <div className={styles.plan__list}>
                    <List type="bullet">
                      <List.Item>All custom UI features</List.Item>
                      <List.Item>All reporting data</List.Item>
                      <List.Item>Dedicated customer support</List.Item>
                      <List.Item>Support for manual fulfillment</List.Item>
                    </List>
                  </div>
                  <Button
                    disabled={!fulfillmentManual && activePlan !== "Basic Plan"}
                    size="large"
                    primary={!activePlan || activePlan === "Pro Plan"}
                    fullWidth
                    onClick={async () => {
                      if (activePlan === "Basic Plan") {
                        if (currentStep) setCurrentStep(currentStep + 1)
                        return
                      }
                      // eslint-disable-next-line no-undef
                      const url = `https://${myshopifyDomain}/admin/apps/heythanks${DEV_APP ? "-" + DEV_APP : ""}`
                      let response = await getBasicSubscriptionUrl({
                        variables: {
                          url,
                          // eslint-disable-next-line no-undef
                          test: !!DEV_APP
                        },
                      })
                      const {
                        confirmationUrl,
                      } = response.data.appSubscriptionCreate
                      redirect.dispatch(
                        Redirect.Action.REMOTE,
                        confirmationUrl
                      )
                    }}
                  >
                    {!activePlan || activePlan === "Pro Plan" || activePlan === "VIP Plan"
                      ? "Subscribe to Basic"
                      : activePlan === "Basic Plan" && !onboarded
                        ? "Continue with this plan"
                        : "Current plan"}
                  </Button>
                </TextContainer>
              </Card.Section>
            </Card>
          </div>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Card sectioned subdued={fulfillmentManual}>
            <Card.Section>
              <TextContainer>
                <DisplayText size="large">Pro Plan</DisplayText>
                <div className={styles.plan__heading}>
                  <Heading>
                    <TextStyle variation="subdued">
                      Our pro plan is best for stores that manage their own
                      professional fulfillment warehouse(s) and/or use
                      professional 3PL fulfillment.
                    </TextStyle>
                    <br></br>
                    <br></br>
                    {!fulfillmentManual && (
                      <Badge status="success" size="medium">
                        Recommended for your shop
                      </Badge>
                    )}
                    {fulfillmentManual && (
                      <Badge status="danger" size="medium">
                        Recommended for partner fulfillment
                      </Badge>
                    )}
                  </Heading>
                </div>
                <DisplayText size="large">
                  <TextStyle variation="subdued">$49.99/month</TextStyle>
                </DisplayText>
                <div className={styles.plan__list}>
                  <List type="bullet">
                    <List.Item>All custom UI features</List.Item>
                    <List.Item>All reporting data</List.Item>
                    <List.Item>Dedicated customer support</List.Item>
                    <List.Item>
                      Support for 3PL and internal professional fulfillment
                    </List.Item>
                  </List>
                </div>
                <Button
                  disabled={fulfillmentManual && activePlan !== "Pro Plan"}
                  size="large"
                  primary={!activePlan || activePlan === "Basic Plan"}
                  fullWidth
                  onClick={async () => {
                    if (activePlan === "Pro Plan") {
                      if (currentStep) setCurrentStep(currentStep + 1)
                      return
                    }
                    // eslint-disable-next-line no-undef
                    const url = `https://${myshopifyDomain}/admin/apps/heythanks${DEV_APP ? "-" + DEV_APP : ""}`
                    let response = await getProSubscriptionUrl({
                      variables: {
                        url,
                        // eslint-disable-next-line no-undef
                        test: !!DEV_APP
                      },
                    })
                    const {
                      confirmationUrl,
                    } = response.data.appSubscriptionCreate
                    redirect.dispatch(Redirect.Action.REMOTE, confirmationUrl)
                  }}
                >
                  {!activePlan || activePlan === "Basic Plan" || activePlan === "VIP Plan"
                    ? "Subscribe to Pro"
                    : activePlan === "Pro Plan" && !onboarded
                      ? "Continue with this plan"
                      : "Current plan"}
                </Button>
              </TextContainer>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
      <div style={{ color: "#ECC200" }}>
        <Button
          monochrome
          outline
          v-if="vipDomain"
          secondary={true}
          size="large"
          fullWidth
          onClick={async () => {
            if (activePlan === "VIP Plan") {
              if (currentStep) setCurrentStep(currentStep + 1)
              return
            }
            // eslint-disable-next-line no-undef
            const url = `https://${myshopifyDomain}/admin/apps/heythanks${DEV_APP ? "-" + DEV_APP : ""}`
            let response = await getVipSubscriptionUrl({
              variables: {
                url,
                // eslint-disable-next-line no-undef
                test: !!DEV_APP
              }
            })
            const { confirmationUrl } = response.data.appSubscriptionCreate
            redirect.dispatch(Redirect.Action.REMOTE, confirmationUrl)
          }}
        >
          {activePlan && onboarded ? "VIP Plan" : "Continue as VIP"}
        </Button>
      </div>
      {activePlan && onboarded && (
        <Button
          fullWidth
          outline
          destructive
          size="large"
          disabled={disableButtons}
          onClick={async () => {
            setDisableButtons(true)
            await deleteCurrentSubscription({
              variables: { id: activePlanId },
            })
            redirect.dispatch(Redirect.Action.APP, "/")
            setDisableButtons(false)
          }}
        >
          Deactivate current plan
        </Button>
      )}
    </TextContainer>
  )
}

export default Plan
