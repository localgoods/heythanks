import {
  Banner,
  Button,
  ButtonGroup,
  Card,
  DisplayText,
  Layout,
  Page,
  Tabs,
  TextContainer,
} from "@shopify/polaris"

import styles from "./admin.module.css"

import { useEffect, useState } from "react"
import Plan from "../../components/plan/plan"
import TipsCard from "../../components/tips-card/tips-card"
import EditorButton from "../../components/editor-button/editor-button"
import Metrics from "../../components/metrics/metrics"
import Support from "../../components/support/support"
import EditorSteps from "../../components/editor-steps/editor-steps"
import FulfillmentCard from "../../components/fulfillment-card/fulfillment-card"
import { useShop } from "../../state/shop/context"
import CustomizeSettings from "../../components/customize-settings/customize-settings"
import VisibilityToggle from "../../components/visibility-toggle/visibility-toggle"
import { useCustomSettings } from "../../state/custom-settings/context"
import { useSettings } from "../../state/settings/context"
import SaveBar from "../../components/save-bar/save-bar"

const Admin = () => {
  const [{
    onboarded,
    activePlanId,
    activePlan,
    myshopifyDomain,
    privateMetafieldValue,
    fulfillmentManual,
    fulfillmentService,
    fulfillmentEmail,
    fulfillmentPhone,
    fulfillmentServices,
    fulfillmentBearerToken,
    fulfillmentRefreshToken,
    deletePrivateMetafield,
    productData,
    productDataLoading,
    deleteCurrentSubscription,
    upsertPrivateMetafield,
    scriptTagDomain
  }] = useShop()

  const [{
    backgroundColor,
    selectionColor,
    strokeColor,
    strokeWidth,
    cornerRadius,
    labelText,
    displayStatus,
  }] = useCustomSettings()

  const [{ disableButtons, setDisableButtons }] = useSettings()

  const [selected, setSelected] = useState(0)

  const tabs = [
    {
      id: "settings-1",
      content: "Settings",
    },
    {
      id: "metrics-1",
      content: "Metrics",
    },
    {
      id: "plan-1",
      content: "Plan",
    },
    {
      id: "support-1",
      content: "Support",
    },
  ]

  useEffect(() => {
    const ac = new AbortController()
    
    const html = document.getElementsByTagName("html")[0]
    html.scrollTop = 0
    
    return ac.abort()
  }, [selected])
  
  return (
    <div>
      <header className={styles.tabs__wrapper}>
        <Tabs tabs={tabs} selected={selected} onSelect={setSelected}></Tabs>
      </header>
      <div className={styles.page__wrapper}>
        {/* {scriptTagDomain && (<SaveBar />)} */}
        <Page>
          {tabs[selected].content === "Settings" && (
            <TextContainer>
              <DisplayText size="large">Settings</DisplayText>
              <DisplayText size="small">
                Edit the price options for your tips, edit the look in the theme
                editor, and configure fulfillment settings.
              </DisplayText>
              {!activePlan && (
                <Banner
                  status="critical"
                  title="Your plan needs to be renewed"
                  action={{
                    onAction: () => setSelected(2),
                    content: "Renew plan",
                  }}
                >
                  <p>
                    HeyThanks will not be visible in your store until you renew
                    your plan.
                  </p>
                </Banner>
              )}
              <Layout>
                <Layout.Section>
                  <TipsCard
                    onboarded={onboarded}
                    activePlan={activePlan}
                    productData={productData}
                    productDataLoading={productDataLoading}
                  ></TipsCard>
                </Layout.Section>
                <Layout.Section>
                  <TextContainer>
                    {scriptTagDomain && (
                      <VisibilityToggle />)}
                  </TextContainer>
                </Layout.Section>
                <Layout.Section>
                  <Card sectioned>
                    <Card.Section>
                      <TextContainer>
                        {scriptTagDomain ? (
                          <CustomizeSettings />) : (<EditorSteps />)}
                        {!scriptTagDomain && (
                          <ButtonGroup>
                            <EditorButton
                              myshopifyDomain={myshopifyDomain}
                            ></EditorButton>
                            {/* <RemoveButton
                            myshopifyDomain={myshopifyDomain}
                          ></RemoveButton> */}
                            <Button
                              loading={disableButtons}
                              primary
                              size="large"
                              onClick={async () => {
                                setDisableButtons(true)

                                const existingValue = privateMetafieldValue
                                  ? privateMetafieldValue
                                  : {}

                                const privateMetafieldInput = {
                                  namespace: "heythanks",
                                  key: "shop",
                                  valueInput: {
                                    value: JSON.stringify({
                                      ...existingValue,
                                      customSettings: {
                                        backgroundColor,
                                        selectionColor,
                                        strokeColor,
                                        strokeWidth,
                                        cornerRadius,
                                        labelText,
                                        displayStatus,
                                      },
                                      onboarded: true,
                                    }),
                                    valueType: "JSON_STRING"
                                  }
                                }

                                await upsertPrivateMetafield({
                                  variables: { input: privateMetafieldInput },
                                })
                                setDisableButtons(false)
                              }}
                            >
                              Save changes
                            </Button>
                          </ButtonGroup>
                        )}
                      </TextContainer>
                    </Card.Section>
                  </Card>
                </Layout.Section>
                <Layout.Section>
                  <FulfillmentCard
                    privateMetafieldValue={privateMetafieldValue}
                    fulfillmentManual={fulfillmentManual}
                    fulfillmentEmail={fulfillmentEmail}
                    fulfillmentPhone={fulfillmentPhone}
                    fulfillmentBearerToken={fulfillmentBearerToken}
                    fulfillmentRefreshToken={fulfillmentRefreshToken}
                    fulfillmentService={fulfillmentService}
                    fulfillmentServices={fulfillmentServices}
                  ></FulfillmentCard>
                </Layout.Section>
              </Layout>
            </TextContainer>
          )}
          {tabs[selected].content === "Metrics" && (
            <Metrics
              activePlanId={activePlanId}
              myshopifyDomain={myshopifyDomain}
            ></Metrics>
          )}
          {tabs[selected].content === "Plan" && (
            <Plan
              onboarded={onboarded}
              activePlan={activePlan}
              activePlanId={activePlanId}
              myshopifyDomain={myshopifyDomain}
              fulfillmentManual={fulfillmentManual}
              deleteCurrentSubscription={deleteCurrentSubscription}
            ></Plan>
          )}
          {tabs[selected].content === "Support" && <Support></Support>}
        </Page>
        {process.env.NODE_ENV !== "production" && (
          <Button
            onClick={() => {
              const privateMetafieldInput = {
                namespace: "heythanks",
                key: "shop",
              }
              deletePrivateMetafield({
                variables: { input: privateMetafieldInput },
              })
            }}
          >
            Reset metafield
          </Button>
        )}
      </div>
    </div>
  )
}

export default Admin
