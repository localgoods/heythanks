import { useState } from "react";
import { SettingsContext } from "./context";

export const SettingsProvider = (props) => {
  const steps = [
    "Confirm fulfillment",
    "Pick plan",
    "Set tips",
    "Update storefront",
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [disableButtons, setDisableButtons] = useState(false);

  return (
    <SettingsContext.Provider
      value={[
        {
          steps,
          currentStep,
          setCurrentStep,
          disableButtons,
          setDisableButtons,
        },
      ]}
    >
      {props.children}
    </SettingsContext.Provider>
  );
};
