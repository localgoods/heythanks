import {
  Button,
  Card,
  Checkbox,
  DisplayText,
  Heading,
  Layout,
  Link,
  Page,
  Tabs,
  TextContainer,
  TextField,
} from "@shopify/polaris";

import styles from "./admin.module.css";

import { useState } from "react";
import Plan from "../plan/plan";
import TipsCard from "../../components/tips-card/tips-card";
import EditorButton from "../../components/editor-button/editor-button";
import Metrics from "../../components/metrics/metrics";

const Admin = (props) => {
  const {
    activePlan,
    myshopifyDomain,
    privateMetafieldValue,
    upsertPrivateMetafield,
    fulfillmentManual,
    fulfillmentService,
    fulfillmentEmail,
    fulfillmentPhone,
    fulfillmentServices,
    disableButtons,
    setDisableButtons,
    deletePrivateMetafield,
    productData,
    productDataLoading,
  } = props;

  const [updatedFulfillmentManual, setUpdatedFulfillmentManual] = useState(
    fulfillmentManual ? fulfillmentManual : false
  );

  const getFulfillmentService = () => {
    return fulfillmentServices.find(
      (fulfillmentService) => fulfillmentService.type !== "MANUAL"
    );
  };

  const [updatedFulfillmentService, setUpdatedFulfillmentService] = useState(
    fulfillmentService || getFulfillmentService()?.serviceName || ""
  );
  const [updatedFulfillmentPhone, setUpdatedFulfillmentPhone] = useState(
    fulfillmentPhone || getFulfillmentService()?.location?.address.phone || ""
  );
  const [updatedFulfillmentEmail, setUpdatedFulfillmentEmail] = useState(
    fulfillmentEmail || ""
  );

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
              <Layout>
                <Layout.Section>
                  <TipsCard
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
                        <Heading>Change tipping module UI</Heading>
                        <p>
                          Edit the colors and other elements of how the in-cart
                          tipping module looks using the theme editor.
                        </p>
                        <EditorButton
                          myshopifyDomain={myshopifyDomain}
                        ></EditorButton>
                      </TextContainer>
                    </Card.Section>
                  </Card>
                </Layout.Section>
                <Layout.Section>
                  <Card sectioned>
                    <Card.Section>
                      <TextContainer>
                        <Heading>Change your fulfillment information</Heading>
                        <Checkbox
                          label="I only fulfill orders myself"
                          checked={updatedFulfillmentManual}
                          onChange={setUpdatedFulfillmentManual}
                          helpText={
                            <Link url="" external>
                              What does this mean?
                            </Link>
                          }
                        />
                        <TextContainer>
                          <TextField
                            label="Fulfillment partner name"
                            value={updatedFulfillmentService}
                            onChange={setUpdatedFulfillmentService}
                            autoComplete="off"
                            disabled={updatedFulfillmentManual}
                          />
                          <TextField
                            label="Fulfillment partner phone number"
                            value={updatedFulfillmentPhone}
                            onChange={setUpdatedFulfillmentPhone}
                            autoComplete="off"
                            disabled={updatedFulfillmentManual}
                          />
                          <TextField
                            type="email"
                            label="Fulfillment partner email address"
                            value={updatedFulfillmentEmail}
                            onChange={setUpdatedFulfillmentEmail}
                            autoComplete="off"
                            disabled={updatedFulfillmentManual}
                          />
                        </TextContainer>
                        <Button
                          loading={disableButtons}
                          disabled={
                            !updatedFulfillmentManual &&
                            (!updatedFulfillmentService ||
                              !updatedFulfillmentPhone ||
                              !updatedFulfillmentEmail)
                          }
                          fullWidth
                          size="large"
                          primary
                          onClick={async () => {
                            setDisableButtons(true);
                            const existingValue = privateMetafieldValue
                              ? privateMetafieldValue
                              : {};
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
                                }),
                                valueType: "JSON_STRING",
                              },
                            };
                            await upsertPrivateMetafield({
                              variables: { input: privateMetafieldInput },
                            });
                            setDisableButtons(false);
                          }}
                        >
                          Save changes
                        </Button>
                      </TextContainer>
                    </Card.Section>
                  </Card>
                </Layout.Section>
              </Layout>
            </TextContainer>
          )}
          {tabs[selected].content === "Metrics" && <Metrics></Metrics>}
          {tabs[selected].content === "Plan" && (
            <Plan
              activePlan={activePlan}
              myshopifyDomain={myshopifyDomain}
              fulfillmentManual={fulfillmentManual}
              disableButtons={disableButtons}
              setDisableButtons={setDisableButtons}
            ></Plan>
          )}
          {tabs[selected].content === "Support" && (
            <TextContainer>
              <DisplayText size="large">Support</DisplayText>
              <DisplayText size="small">
                Send us a message, or view answers to common questions.
              </DisplayText>
              <Layout>
                <Layout.Section>
                  <Card sectioned>
                    <Card.Section>
                      <TextContainer>
                        <Heading>Contact support</Heading>
                        <span>Need help? Please send a message to </span>
                        <Link url="" external>
                          support@heythanks.io
                        </Link>
                      </TextContainer>
                    </Card.Section>
                  </Card>
                </Layout.Section>
                <Layout.Section>
                  <Card sectioned>
                    <Card.Section>
                      <TextContainer>
                        <Heading>Read our FAQs</Heading>
                        <span>
                          We've compiled answers to some common questions. View
                          our{" "}
                        </span>
                        <Link url="" external>
                          FAQs
                        </Link>
                      </TextContainer>
                    </Card.Section>
                  </Card>
                </Layout.Section>
              </Layout>
            </TextContainer>
          )}
        </Page>
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
      </div>
    </div>
  );
};

export default Admin;
