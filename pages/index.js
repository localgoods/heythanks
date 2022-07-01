import { Page, Button } from "@shopify/polaris"
import StepsProgress from "../components/steps-progress/steps-progress"
import Welcome from "../components/welcome/welcome"
import Plan from "../components/plan/plan"
import Fulfillment from "../components/fulfillment/fulfillment"
import Completion from "../components/completion/completion"
import Admin from "../layouts/admin/admin"
import Tips from "../components/tips/tips"

import React, { useEffect } from "react"
import styles from "./index.module.css"

import { useSettings } from "../state/settings/context"
import { useShop } from "../state/shop/context"

const Index = () => {

  const [{ currentStep, setCurrentStep }] = useSettings()

  const [{
    onboarded,
    deletePrivateMetafield,
  }] = useShop()

  useEffect(() => {
    const ac = new AbortController()
    const searchItems = location.search.split("?")[1]?.split("&")
    const chargeId = searchItems
      .find((item) => item.split("=")[0] === "charge_id")
      ?.split("=")[1]
    if (chargeId && currentStep !== 3) setCurrentStep(3)
    return ac.abort()
  }, [])

  useEffect(() => {
    const ac = new AbortController()
    // Todo: Make this a global plugin or centralize usage of this
    if (document) {
      const html = document.getElementsByTagName("html")[0]
      html.scrollTop = 0
    }
    return ac.abort()
  }, [currentStep])

  return (
    <>
      {/* Show onboarding or admin home page */}
      {!onboarded ? (
        <div>
          {currentStep > 0 && (
            <header className={styles.progress__header}>
              <StepsProgress
                currentStep={currentStep - 1}
              ></StepsProgress>
            </header>
          )}
          <div
            className={
              currentStep !== 0 ? styles.step__wrapper : styles.welcome__wrapper
            }
          >
            <Page
              breadcrumbs={
                currentStep !== 0
                  ? [{ onAction: () => setCurrentStep(currentStep - 1) }]
                  : ""
              }
              title={currentStep !== 0 ? `Step ${currentStep}` : ""}
            >
              {currentStep === 0 && <Welcome></Welcome>}
              {currentStep === 1 && (
                <Fulfillment></Fulfillment>
              )}
              {currentStep === 2 && (
                <Plan></Plan>
              )}
              {currentStep === 3 && (
                <Tips></Tips>
              )}
              {currentStep === 4 && (
                <Completion></Completion>
              )}
            </Page>
          </div>
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
      ) : (<Admin></Admin>)
      }
    </>
  )
}

export default Index
