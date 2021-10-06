import {
  Page,
  Card,
  TextContainer,
  DisplayText,
  Button,
  TextStyle,
  Layout,
  Heading,
  List,
  ButtonGroup,
  Frame,
  Loading,
  Badge
} from "@shopify/polaris";
import StepsProgress from "../components/steps-progress/steps-progress";
import React, { useState } from "react";
import styles from "./index.module.css";
import { gql, useQuery } from "@apollo/client";

import { Redirect } from "@shopify/app-bridge/actions";

import { useAppBridge } from "@shopify/app-bridge-react";

const GET_SHOP_INFO = gql`
  query {
    shop {
      name
      myshopifyDomain
      fulfillmentServices {
        serviceName
      }
    }
  }
`;

function getProSubscriptionUrl() {
  // Use authenticated fetch post request to '/get-pro-subscription-url'
}

function getBasicSubscriptionUrl() {
  // Use authenticated fetch post request to '/get-pro-subscription-url'
}

const steps = ["Pick plan", "Confirm fulfillment", "Update storefront"];

const Index = () => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const { loading, error, data } = useQuery(GET_SHOP_INFO);

  const [currentStep, setCurrentStep] = useState(0);

  if (loading)
    return (
      <div style={{ height: "100px" }}>
        <Frame>
          <Loading />
        </Frame>
      </div>
    );

  if (error)
    return (
      <div style={{ height: "100px" }}>
        <Frame>
          <p>`Error! ${error.message}`</p>
        </Frame>
      </div>
    );

  console.log(data);
  const { name, myshopifyDomain, fulfillmentServices } = data.shop;

  const basicRecommended =
    fulfillmentServices.length === 1 &&
    fulfillmentServices.find((service) => service.serviceName === "Manual");

  let template = "cart";
  let uuid = "dd482a24-5a49-411f-bf18-24079033010b";
  let handle = "app-block";
  let link = `https://${myshopifyDomain}/admin/themes/current/editor?&template=${template}&activateAppId=${uuid}/${handle}`;

  return (
    <div>
      {currentStep > 0 && (
        <header className={styles.progress__header}>
          <StepsProgress
            currentStep={currentStep - 1}
            steps={steps}
          ></StepsProgress>
        </header>
      )}
      <div className={styles.step__wrapper}>
        {currentStep === 0 && (
          <Page>
            <div className={styles.welcome__container}>
              <Card sectioned>
                <Card.Section>
                  <TextContainer>
                    <img
                      alt=""
                      width="100%"
                      height="100%"
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                      src={require("../images/Onboarding.svg")}
                    />
                    <DisplayText size="large">
                      Let's reward the hardest workers in e-commerce
                    </DisplayText>
                    <p>
                      Hello <b>{name}</b> team,
                      <br></br>
                      <br></br>
                      Thank you for downloading our app! We are a small team
                      from New Hampshire. We started HeyThanks inspired by one
                      of our idols, Benjamin Franklin’s most famous ideas, “Do
                      well by doing good.”
                      <br></br>
                      <br></br>
                      We believe that we can help generate good in the world by
                      enabling consumers and brands to show that they care about
                      the workers on whom they depend.<br></br>
                      <br></br>
                      We hope you help us carry out that mission!
                      <br></br>
                      <br></br>
                      Regards,
                      <br></br>
                      <span className={styles.welcome__signature}>
                        The&nbsp;
                        <img
                          src={require("../images/HeyThanks.svg")}
                          loading="lazy"
                        />
                        &nbsp;team
                      </span>
                    </p>
                    <Button
                      fullWidth
                      size="large"
                      primary
                      onClick={() => setCurrentStep(currentStep + 1)}
                    >
                      Get started with onboarding
                    </Button>
                  </TextContainer>
                </Card.Section>
              </Card>
            </div>
          </Page>
        )}
        {currentStep > 0 && (
          <Page
            breadcrumbs={[{ onAction: () => setCurrentStep(currentStep - 1) }]}
            title={`Step ${currentStep}`}
          >
            {currentStep === 1 && (
              <TextContainer>
                <DisplayText size="large">Please pick a plan</DisplayText>
                <DisplayText size="small">
                  We only have two plans and you can cancel anytime. If you use
                  professional fulfillment then you will need to use the Pro
                  Plan.
                </DisplayText>
                <Layout>
                  <Layout.Section oneHalf>
                    <Card sectioned subdued={!basicRecommended}>
                      <Card.Section>
                        <TextContainer>
                          <DisplayText size="large">Basic Plan</DisplayText>
                          <div className={styles.plan__heading}>
                            <Heading>
                              <TextStyle variation="subdued">
                                Our basic plan is best for stores that
                                self-fulfill.
                              </TextStyle>
                              <br></br>
                              <br></br>
                              {basicRecommended && (
                                <Badge status="success" size="medium">
                                  Recommended for your shop
                                </Badge>
                              )}
                            </Heading>
                          </div>
                          <DisplayText size="large">
                            <TextStyle variation="subdued">
                              $4.99/month
                            </TextStyle>
                          </DisplayText>
                          <div className={styles.plan__list}>
                            <List type="bullet">
                              <List.Item>
                                Access all custom UI features
                              </List.Item>
                              <List.Item>All reporting</List.Item>
                              <List.Item>
                                Support for self-fulfillment
                              </List.Item>
                            </List>
                          </div>
                          <Button
                            size="large"
                            primary
                            fullWidth
                            onClick={() => setCurrentStep(currentStep + 1)}
                          >
                            Subscribe to Basic
                          </Button>
                        </TextContainer>
                      </Card.Section>
                    </Card>
                  </Layout.Section>
                  <Layout.Section oneHalf>
                    <Card sectioned subdued={basicRecommended}>
                      <Card.Section>
                        <TextContainer>
                          <DisplayText size="large">Pro Plan</DisplayText>
                          <div className={styles.plan__heading}>
                            <Heading>
                              <TextStyle variation="subdued">
                                Our pro plan is best for stores that use a
                                professional fulfillment partner.
                              </TextStyle>
                              <br></br>
                              <br></br>
                              {!basicRecommended && (
                                <Badge status="success" size="medium">
                                  Recommended for your shop
                                </Badge>
                              )}
                            </Heading>
                          </div>
                          <DisplayText size="large">
                            <TextStyle variation="subdued">
                              $19.99/month
                            </TextStyle>
                          </DisplayText>
                          <div className={styles.plan__list}>
                            <List type="bullet">
                              <List.Item>
                                Access all custom UI features
                              </List.Item>
                              <List.Item>All reporting</List.Item>
                              <List.Item>
                                Support for professional fulfillment
                              </List.Item>
                            </List>
                          </div>
                          <Button
                            size="large"
                            primary
                            fullWidth
                            onClick={() => setCurrentStep(currentStep + 1)}
                          >
                            Subscribe to Pro
                          </Button>
                        </TextContainer>
                      </Card.Section>
                    </Card>
                  </Layout.Section>
                </Layout>
              </TextContainer>
            )}
            {currentStep === 2 && (
              <TextContainer>
                <DisplayText size="large">
                  Onboard your fulfillment partner
                </DisplayText>
                <DisplayText size="small">
                  In order to make payouts to the fulfillment workers who pick,
                  pack, and ship your orders, please confirm your fulfillment
                  partner.
                </DisplayText>
                <Layout>
                  <Layout.Section>
                    <Card sectioned>
                      <Card.Section>
                        <TextContainer>
                          <Heading>Fulfillment partner name:</Heading>
                          <p>ABC FulFillment Partners</p>
                          <ButtonGroup fullWidth>
                            <Button fullWidth size="large">
                              Edit
                            </Button>
                            <Button
                              fullWidth
                              size="large"
                              primary
                              onClick={() => setCurrentStep(currentStep + 1)}
                            >
                              Confirm
                            </Button>
                          </ButtonGroup>
                        </TextContainer>
                      </Card.Section>
                    </Card>
                  </Layout.Section>
                </Layout>
              </TextContainer>
            )}
            {currentStep === 3 && (
              <TextContainer>
                <DisplayText size="large">
                  Add HeyThanks to your cart page
                </DisplayText>
                <DisplayText size="small">
                  You made it! Click the complete button below to start changing
                  the world! You'll be taken to the cart in your theme editor to
                  insert, customize and deploy HeyThanks to your store.
                </DisplayText>
                <Layout>
                  <Layout.Section>
                    <Card sectioned>
                      <Card.Section>
                        <TextContainer>
                          {/* <img
                            alt=""
                            width="100%"
                            height="100%"
                            style={{
                              objectFit: "cover",
                              objectPosition: "center",
                            }}
                            src={require("../images/Onboarding.svg")}
                          /> */}
                          <div className={styles.img__placeholder}>
                            <span>Editor add-section demo GIF</span>
                          </div>
                          <Button
                            fullWidth
                            size="large"
                            primary
                            onClick={() =>
                              redirect.dispatch(Redirect.Action.REMOTE, link)
                            }
                          >
                            Complete in theme editor
                          </Button>
                        </TextContainer>
                      </Card.Section>
                    </Card>
                  </Layout.Section>
                </Layout>
              </TextContainer>
            )}
          </Page>
        )}
      </div>
    </div>
  );
};

export default Index;
