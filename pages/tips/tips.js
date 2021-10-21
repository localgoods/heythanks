import {
  DisplayText,
  Layout,
  TextContainer,
} from "@shopify/polaris";
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
    productDataLoading
  } = props;

  return (
    <TextContainer>
      <DisplayText size="large">Confirm your tip options</DisplayText>
      <DisplayText size="small">
        Please select and confirm the prices for your two tip options. You can
        change these prices whenever and however many times you'd like.
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
