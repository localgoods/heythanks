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
} from "@shopify/polaris";

import styles from "./admin.module.css";

import { useEffect, useState } from "react";
import Plan from "../../pages/plan/plan";
import TipsCard from "../../components/tips-card/tips-card";
import EditorButton from "../../components/editor-button/editor-button";
import Metrics from "../../components/metrics/metrics";
import Support from "../../pages/support/support";
import EditorSteps from "../../components/editor-steps/editor-steps";
import RemoveButton from "../../components/remove-button/remove-button";
import FulfillmentCard from "../../components/fulfillment-card/fulfillment-card";

const Admin = (props) => {
  const {
    authAxios,
    onboarded,
    activePlanId,
    activePlan,
    myshopifyDomain,
    privateMetafieldValue,
    upsertPrivateMetafield,
    fulfillmentManual,
    fulfillmentService,
    fulfillmentEmail,
    fulfillmentPhone,
    fulfillmentServices,
    fulfillmentBearerToken,
    fulfillmentRefreshToken,
    disableButtons,
    setDisableButtons,
    deletePrivateMetafield,
    productData,
    productDataLoading,
    deleteCurrentSubscription,
  } = props;

  const [selected, setSelected] = useState(0);

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
  ];

  useEffect(() => {
    // Todo: Make this a global plugin or centralize usage of this
    const html = document.getElementsByTagName("html")[0];
    html.scrollTop = 0;
  }, [selected]);

  return (
    <div>
      <header className={styles.tabs__wrapper}>
        <Tabs tabs={tabs} selected={selected} onSelect={setSelected}></Tabs>
      </header>
      <div className={styles.page__wrapper}>
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
                    disableButtons={disableButtons}
                    setDisableButtons={setDisableButtons}
                  ></TipsCard>
                </Layout.Section>
                <Layout.Section>
                  <Card sectioned>
                    <Card.Section>
                      <TextContainer>
                        <EditorSteps onboarded={onboarded}></EditorSteps>
                        <ButtonGroup>
                          <EditorButton
                            myshopifyDomain={myshopifyDomain}
                          ></EditorButton>
                          <RemoveButton
                            myshopifyDomain={myshopifyDomain}
                          ></RemoveButton>
                        </ButtonGroup>
                      </TextContainer>
                    </Card.Section>
                  </Card>
                </Layout.Section>
                <Layout.Section>
                  <FulfillmentCard
                    privateMetafieldValue={privateMetafieldValue}
                    upsertPrivateMetafield={upsertPrivateMetafield}
                    disableButtons={disableButtons}
                    setDisableButtons={setDisableButtons}
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
              authAxios={authAxios}
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
              disableButtons={disableButtons}
              setDisableButtons={setDisableButtons}
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
              };
              deletePrivateMetafield({
                variables: { input: privateMetafieldInput },
              });
            }}
          >
            Reset metafield
          </Button>
        )}
      </div>
    </div>
  );
};

export default Admin;
