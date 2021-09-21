import { Page, Card, TextContainer, Layout, DisplayText, Button } from "@shopify/polaris";
import StepsProgress from "../components/steps-progress/steps-progress";
import React, { useState } from "react";
import styles from "./index.module.css";
import onboardingImg from '../images/onboarding.svg';

const steps = [
  "Pick plan",
  "Customize UI",
  "Confirm fulfillment",
  "Preview and finalize"
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  return (
    <div>
      <header className={styles.progress__header}>
        <StepsProgress currentStep={currentStep} steps={steps}></StepsProgress>
      </header>
      <Page>
        <section className={styles.welcome__section}>
          <Card sectioned>
            <TextContainer>
              <DisplayText size="extraLarge">Welcome to HeyThanks!</DisplayText>
              <img src={onboardingImg} alt="HeyThanks onboarding picture" width="100%" />
              <DisplayText size="large">The easiest way to embed social responsibility into your brand.</DisplayText>
              <p>You are 60 seconds (really!) away from enabling the future of socially responsible e-commerce.</p>
              <Button primary fullWidth>Let's do it!</Button>
            </TextContainer>
          </Card>
        </section>
        <p style={{ marginTop: "100px", textAlign: "center" }}>
          <button style={{ margin: "5px" }} onClick={() => setCurrentStep(currentStep - 1)}>Back</button>
          <button style={{ margin: "5px" }} onClick={() => setCurrentStep(currentStep + 1)}>Next</button>
        </p>
      </Page>
    </div>
  );
};

export default Index;
