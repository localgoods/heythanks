import { Page } from "@shopify/polaris";
import StepsProgress from "../components/steps-progress/steps-progress";
import React, { useState } from "react";

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
      <StepsProgress currentStep={currentStep} steps={steps}></StepsProgress>
      <p style={{ marginTop: "100px", textAlign: "center" }}>
        <button onClick={() => setCurrentStep(currentStep - 1)}>Back</button>
        <button onClick={() => setCurrentStep(currentStep + 1)}>Next</button>
      </p>
    </Page>
  );
};

export default Index;
