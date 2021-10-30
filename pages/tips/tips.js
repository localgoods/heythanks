import { DisplayText, Layout, TextContainer } from "@shopify/polaris";
import styles from "./tips.module.css";
import TipsCard from "../../components/tips-card/tips-card";

const Tips = (props) => {
  const {
    activePlan,
    currentStep,
    setCurrentStep,
    disableButtons,
    setDisableButtons,
    productData,
    productDataLoading,
  } = props;

  return (
    <TextContainer>
      <DisplayText size="large">Confirm your tip options</DisplayText>
      <DisplayText size="small">
        Please select values for the two tip options that will be presented to
        customers on your cart page. These amounts can be changed at any point.
      </DisplayText>
      <Layout>
        <Layout.Section>
          <TipsCard
            activePlan={activePlan}
            productData={productData}
            productDataLoading={productDataLoading}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            disableButtons={disableButtons}
            setDisableButtons={setDisableButtons}
          ></TipsCard>
        </Layout.Section>
      </Layout>
    </TextContainer>
  );
};

export default Tips;
