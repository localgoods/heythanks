import { Frame, Loading } from "@shopify/polaris";
import StepsProgress from "../components/steps-progress/steps-progress";
import Welcome from "./welcome/welcome";
import Plan from "./plan/plan";
import Fulfillment from "./fulfillment/fulfillment";
import Completion from "./completion/completion";

import React, { useEffect, useState } from "react";
import styles from "./index.module.css";

import { useQuery } from "@apollo/client";

import { GET_SHOP_INFO } from "../graphql/queries/get-shop-info";
import Tips from "./tips/tips";

const steps = [
  "Confirm fulfillment",
  "Pick plan",
  "Set tips",
  "Update storefront",
];

const Index = (props) => {
  const { authAxios } = props;
  const [currentStep, setCurrentStep] = useState(0);
  const [disableButtons, setDisableButtons] = useState(false);
  useEffect(() => {
    const chargeId = location.search
      .split("?")[1]
      ?.split("&")
      .find((item) => item.split("=")[0] === "charge_id")
      ?.split("=")[1];
    if (chargeId && currentStep !== 3) setCurrentStep(3);
  }, []);
  const [manualFulfillment, setManualFulfillment] = useState(false);
  const { data: shopData, loading, error } = useQuery(GET_SHOP_INFO);

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

  const { id, name, url, email, billingAddress, plan, myshopifyDomain, fulfillmentServices } = shopData.shop;

  const upsertShop = async () => {
    const { formatted: formattedAddress } = billingAddress;
    const { displayName: planName, partnerDevelopment, shopifyPlus } = plan;
    const data = { id, name, url, email, formattedAddress, planName, partnerDevelopment, shopifyPlus };
    const response = await authAxios.post("/api/upsert-shop", data);
    console.log(response);
  };

  upsertShop();

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
          <Welcome
            name={name}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          ></Welcome>
        )}
        {currentStep === 1 && (
          <Fulfillment
            fulfillmentServices={fulfillmentServices}
            manualFulfillment={manualFulfillment}
            setManualFulfillment={setManualFulfillment}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            disableButtons={disableButtons}
            setDisableButtons={setDisableButtons}
          ></Fulfillment>
        )}
        {currentStep === 2 && (
          <Plan
            myshopifyDomain={myshopifyDomain}
            manualFulfillment={manualFulfillment}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            disableButtons={disableButtons}
            setDisableButtons={setDisableButtons}
          ></Plan>
        )}
        {currentStep === 3 && (
          <Tips
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            disableButtons={disableButtons}
            setDisableButtons={setDisableButtons}
          ></Tips>
        )}
        {currentStep === 4 && (
          <Completion
            myshopifyDomain={myshopifyDomain}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            disableButtons={disableButtons}
            setDisableButtons={setDisableButtons}
          ></Completion>
        )}
      </div>
    </div>
  );
};

export default Index;
