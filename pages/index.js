import { Heading, Page, TextContainer } from "@shopify/polaris";
import StepsProgress from "../components/steps-progress/steps-progress";
import React, { useState } from "react";
import styles from "./index.module.css";

const steps = [
  "Create Account",
  "Select 3PL Partner",
  "Choose Payout Method",
  "Update Store",
  "Review and Finish",
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  return (
    <Page>
      {/* <header className={styles.welcome__header}>
        <TextContainer>
          <Heading>Welcome to HeyThanks</Heading>
          <p>Get started by completing the steps below</p>
          <br></br>
        </TextContainer>        
      </header> */}
      <StepsProgress currentStep={currentStep} steps={steps}></StepsProgress>
      <p style={{ marginTop: "100px", textAlign: "center" }}>
        <button style={{ margin: "5px" }} onClick={() => setCurrentStep(currentStep - 1)}>Back</button>
        <button style={{ margin: "5px" }} onClick={() => setCurrentStep(currentStep + 1)}>Next</button>
      </p>
    </Page>
  );
};

export default Index;
