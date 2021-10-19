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

import { useCallback, useEffect, useState } from "react";
import Plan from "../plan/plan";
import TipsCard from "../../components/tips-card/tips-card";
import EditorButton from "../../components/editor-button/editor-button";
import Metrics from "../../components/metrics/metrics";

const Admin = (props) => {
  const {
    currentPlan,
    myshopifyDomain,
    manualFulfillment,
    setManualFulfillment,
    fulfillmentServices,
    disableButtons,
    setDisableButtons,
  } = props;

  useEffect(() => {
    const guessManualFulfillment =
      fulfillmentServices.length === 1 &&
      fulfillmentServices.find((service) => service.serviceName === "Manual");
    setManualFulfillment(guessManualFulfillment);
  }, []);

  const [manualConfirmed, setManualConfirmed] = useState(manualFulfillment);

  const getFulfillmentService = () => {
    return fulfillmentServices.find(
      (fulfillmentService) => fulfillmentService.type !== "MANUAL"
    );
  };

  const [fulfillmentService, setFulfillmentService] = useState(
    getFulfillmentService()
  );

  const [fulfillmentServiceName, setFulfillmentServiceName] = useState(
    fulfillmentService?.serviceName || ""
  );
  const [fulfillmentServicePhone, setFulfillmentServicePhone] = useState(
    fulfillmentService?.location?.address.phone || ""
  );
  const [fulfillmentServiceEmail, setFulfillmentServiceEmail] = useState("");

  const [selected, setSelected] = useState(0);

  useEffect(() => {
    setManualFulfillment(manualConfirmed);
  }, [manualConfirmed]);

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
                          checked={manualConfirmed}
                          onChange={setManualConfirmed}
                          helpText={
                            <Link url="" external>
                              What does this mean?
                            </Link>
                          }
                        />
                        <TextContainer>
                          <TextField
                            label="Fulfillment partner name"
                            value={fulfillmentServiceName}
                            onChange={setFulfillmentServiceName}
                            autoComplete="off"
                            disabled={manualConfirmed}
                          />
                          <TextField
                            label="Fulfillment partner phone number"
                            value={fulfillmentServicePhone}
                            onChange={setFulfillmentServicePhone}
                            autoComplete="off"
                            disabled={manualConfirmed}
                          />
                          <TextField
                            type="email"
                            label="Fulfillment partner email address"
                            value={fulfillmentServiceEmail}
                            onChange={setFulfillmentServiceEmail}
                            autoComplete="off"
                            disabled={manualConfirmed}
                          />
                        </TextContainer>
                        <Button
                          size="large"
                          primary
                          onClick={() => {
                            console.log(manualFulfillment);
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
          {tabs[selected].content === "Metrics" && (
            <Metrics></Metrics>
          )}
          {tabs[selected].content === "Plan" && (
            <Plan
              currentPlan={currentPlan}
              myshopifyDomain={myshopifyDomain}
              manualFulfillment={manualFulfillment}
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
      </div>
    </div>
  );
};

export default Admin;
