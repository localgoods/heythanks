import { DisplayText, Layout, TextContainer } from "@shopify/polaris";
import FulfillmentCard from "../../components/fulfillment-card/fulfillment-card";
import styles from "./fulfillment.module.css";

const Fulfillment = (props) => {
  const {
    privateMetafieldValue,
    upsertPrivateMetafield,
    disableButtons,
    setDisableButtons,
    fulfillmentManual,
    fulfillmentEmail,
    fulfillmentPhone,
    fulfillmentBearerToken,
    fulfillmentRefreshToken,
    fulfillmentService,
    fulfillmentServices,
    currentStep,
    setCurrentStep,
  } = props;

  return (
    <TextContainer>
      <DisplayText size="large">
        Confirm your fulfillment information
      </DisplayText>
      <DisplayText size="small">
        In order to make payouts to the fulfillment workers who pick, pack, and
        ship your orders, please confirm the following details about your
        fulfillment.
      </DisplayText>
      <Layout>
        <Layout.Section>
          <FulfillmentCard
            privateMetafieldValue={privateMetafieldValue}
            upsertPrivateMetafield={upsertPrivateMetafield}
            disableButtons={disableButtons}
            setDisableButtons={setDisableButtons}
            fulfillmentManual={fulfillmentManual}
            fulfillmentEmail={fulfillmentEmail}
            fulfillmentPhone={fulfillmentPhone}
            fulfillmentBearerToken={fulfillmentBearerToken}
            fulfillmentRefreshToken={fulfillmentRefreshToken}
            fulfillmentService={fulfillmentService}
            fulfillmentServices={fulfillmentServices}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          ></FulfillmentCard>
        </Layout.Section>
      </Layout>
    </TextContainer>
  );
};

export default Fulfillment;
