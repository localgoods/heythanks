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
        <StepsProgress currentStep={currentStep} steps={steps}></StepsProgress>
      </header>
      <Page>
        {currentStep === 0 && (
          <section className={styles.welcome__section}>
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
                  You are 60 seconds (really!) away from enabling the future of
                  socially responsible e-commerce.
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
          </section>
        )}
        {currentStep === 1 && (
          <section className={styles.step__section}>
            <TextContainer>
              <DisplayText size="large">
                <TextStyle variation="subdued">Step 1</TextStyle>
              </DisplayText>
              <DisplayText size="large">Please pick a plan</DisplayText>
              <DisplayText size="small">
                We only have two plans and you can cancel anytime. If you use
                professional fulfillment then you will need to use the Pro Plan.
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
                      <Button primary fullWidth>
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
                        <TextStyle variation="subdued">$19.99/month</TextStyle>
                      </DisplayText>
                      <List type="bullet">
                        <List.Item>Access all custom UI features</List.Item>
                        <List.Item>All reporting</List.Item>
                        <List.Item>
                          Support for professional fulfillment
                        </List.Item>
                      </List>
                      <Button primary fullWidth>
                        Subscribe to Pro
                      </Button>
                    </TextContainer>
                  </Card>
                </Layout.Section>
                <Layout.Section oneThird>
                  <Card sectioned>
                    <TextContainer>
                      <p>
                        Hello Shane,<br></br><br></br>
                        Thank you for downloading our app!
                        We are a small team from New Hampshire. We started
                        HeyThanks inspired by one of our idols, Benjamin
                        Franklin’s most famous ideas,<br></br><br></br>
                        “Do well by doing good.”<br></br><br></br>
                        We believe that we can help generate good in the world
                        by enabling consumers and brands to show that they care
                        about the workers on whom they depend.<br></br><br></br>
                        We hope you help us carry out that mission!
                      </p>
                    </TextContainer>
                  </Card>
                </Layout.Section>
              </Layout>
            </TextContainer>
          </section>
        )}
        {currentStep === 2 && (
          <section className={styles.step__section}>
            <Card sectioned>
              <TextContainer>
                <p>No components yet</p>
              </TextContainer>
            </Card>
          </section>
        )}
        {currentStep === 3 && (
          <section className={styles.step__section}>
            <Card sectioned>
              <TextContainer>
                <p>No components yet</p>
              </TextContainer>
            </Card>
          </section>
        )}
        <p style={{ marginTop: "100px", textAlign: "center" }}>
          <button
            style={{ margin: "5px" }}
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Back
          </button>
          <button
            style={{ margin: "5px" }}
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            Next
          </button>
        </p>
      </Page>
    </div>
  );
};

export default Index;
