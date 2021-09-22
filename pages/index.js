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
  TextField,
  ButtonGroup,
} from "@shopify/polaris";
import StepsProgress from "../components/steps-progress/steps-progress";
import React, { useState } from "react";
import styles from "./index.module.css";
import onboardingImg from "../images/onboarding.svg";

const steps = [
  "Pick plan",
  "Customize UI",
  "Confirm fulfillment",
  "Preview and finalize",
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  return (
    <div>
      <header className={styles.progress__header}>
        <StepsProgress currentStep={currentStep - 1} steps={steps}></StepsProgress>
      </header>
      {currentStep === 0 && (
        <div className={styles.welcome__wrapper}>
          <Page>
            {currentStep === 0 && (
              <Card sectioned>
                <TextContainer>
                  <DisplayText size="extraLarge">
                    Welcome to HeyThanks!
                  </DisplayText>
                  <img
                    src={onboardingImg}
                    alt="HeyThanks onboarding picture"
                    width="100%"
                  />
                  <DisplayText size="large">
                    The easiest way to embed social responsibility into your
                    brand.
                  </DisplayText>
                  <DisplayText size="small">
                    You are 60 seconds (really!) away from enabling the future
                    of socially responsible e-commerce.
                  </DisplayText>
                  <Button
                    primary
                    fullWidth
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    Let's do it!
                  </Button>
                </TextContainer>
              </Card>
            )}
          </Page>
        </div>
      )}
      {currentStep > 0 && (
        <div className={styles.step__wrapper}>
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
                  <Layout.Section oneThird>
                    <Card sectioned>
                      <TextContainer>
                        <DisplayText size="large">Basic Plan</DisplayText>
                        <Heading>
                          <TextStyle variation="subdued">
                            Our basic plan is best for stores that self-fulfill.
                          </TextStyle>
                        </Heading>
                        <DisplayText size="large">
                          <TextStyle variation="subdued">$0/month</TextStyle>
                        </DisplayText>
                        <List type="bullet">
                          <List.Item>Access all custom UI features</List.Item>
                          <List.Item>All reporting</List.Item>
                          <List.Item>Support for self-fulfillment</List.Item>
                        </List>
                        <Button
                          primary
                          fullWidth
                          onClick={() => setCurrentStep(currentStep + 1)}
                        >
                          Subscribe to Basic
                        </Button>
                      </TextContainer>
                    </Card>
                  </Layout.Section>
                  <Layout.Section oneThird>
                    <Card sectioned>
                      <TextContainer>
                        <DisplayText size="large">Pro Plan</DisplayText>
                        <Heading>
                          <TextStyle variation="subdued">
                            Our pro plan is best for stores that use a
                            professional fulfillment partner.
                          </TextStyle>
                        </Heading>
                        <DisplayText size="large">
                          <TextStyle variation="subdued">
                            $19.99/month
                          </TextStyle>
                        </DisplayText>
                        <List type="bullet">
                          <List.Item>Access all custom UI features</List.Item>
                          <List.Item>All reporting</List.Item>
                          <List.Item>
                            Support for professional fulfillment
                          </List.Item>
                        </List>
                        <Button
                          primary
                          fullWidth
                          onClick={() => setCurrentStep(currentStep + 1)}
                        >
                          Subscribe to Pro
                        </Button>
                      </TextContainer>
                    </Card>
                  </Layout.Section>
                  <Layout.Section oneThird>
                    <Card sectioned>
                      <TextContainer>
                        <p>
                          Hello Shane,<br></br>
                          <br></br>
                          Thank you for downloading our app! We are a small team
                          from New Hampshire. We started HeyThanks inspired by
                          one of our idols, Benjamin Franklin’s most famous
                          ideas,
                          <br></br>
                          <br></br>
                          “Do well by doing good.”<br></br>
                          <br></br>
                          We believe that we can help generate good in the world
                          by enabling consumers and brands to show that they
                          care about the workers on whom they depend.<br></br>
                          <br></br>
                          We hope you help us carry out that mission!
                        </p>
                      </TextContainer>
                    </Card>
                  </Layout.Section>
                </Layout>
              </TextContainer>
            )}
            {currentStep === 2 && (
              <TextContainer>
                <DisplayText size="large">
                  Now, customize how it looks in your cart
                </DisplayText>
                <DisplayText size="small">
                  The HeyThanks app will be added to your cart page. You may see
                  lower abandoments as your customers see an opportunity to do
                  good!
                </DisplayText>
                <Layout>
                  <Layout.Section oneThird>
                    <Card sectioned>
                      <TextContainer>
                        <Heading>Pick tip amounts</Heading>
                        <TextField
                          label="Tip option 1"
                          type="number"
                          value="1"
                        ></TextField>
                        <TextField
                          label="Tip option 2"
                          type="number"
                          value="1"
                        ></TextField>
                      </TextContainer>
                    </Card>
                    <Card sectioned>
                      <TextContainer>
                        <Heading>Pick emojis</Heading>
                      </TextContainer>
                    </Card>
                    <Card sectioned>
                      <TextContainer>
                        <Heading>Pick stroke</Heading>
                      </TextContainer>
                    </Card>
                    <Card sectioned>
                      <TextContainer>
                        <Heading>Pick background</Heading>
                      </TextContainer>
                    </Card>
                  </Layout.Section>
                  <Layout.Section oneHalf>
                    <Card sectioned>
                      <TextContainer>
                        <Heading>Preview tip card</Heading>
                        <p>By default, the tip cards will inheret the font family of your theme.</p>
                        <ButtonGroup>
                          <Button primary onClick={() => setCurrentStep(currentStep + 1)}>Continue</Button>
                          <Button>Restore Defaults</Button>
                        </ButtonGroup>
                      </TextContainer>
                    </Card>
                  </Layout.Section>
                </Layout>
              </TextContainer>
            )}
            {currentStep === 3 && (
              <TextContainer>
                <DisplayText size="large">
                Onboard your fulfillment partner
                </DisplayText>
                <DisplayText size="small">
                  In order to make payouts to the fulfillment workers who pick, pack, and ship your orders, please confirm your fulfillment partner.
                </DisplayText>
                <Layout>
                  <Layout.Section>
                    <Card sectioned>
                      <TextContainer>
                        <Heading>Fulfillment partner name:</Heading>
                        <p>ABC FulFillment Partners</p>
                        <ButtonGroup>
                          <Button primary onClick={() => setCurrentStep(currentStep + 1)}>Confirm</Button>
                          <Button>Not Correct</Button>
                        </ButtonGroup>
                      </TextContainer>
                    </Card>
                  </Layout.Section>
                </Layout>
              </TextContainer>
            )}
            {currentStep === 4 && (
              <TextContainer>
                <DisplayText size="large">
                  Confirm and finish
                </DisplayText>
                <DisplayText size="small">
                  You made it! Click the complete button below to start changing the world! Once you click confirm, HeyThanks will be visible on your site. You will be able to change any of the settings you just enabled in your admin.
                </DisplayText>
                <Layout>
                  <Layout.Section>
                    <Card sectioned>
                      <Button primary>Confirm</Button>
                    </Card>
                  </Layout.Section>
                </Layout>
              </TextContainer>
            )}
          </Page>
        </div>
      )}
    </div>
  );
};

export default Index;
