import {
  Button,
  Card,
  DisplayText,
  Heading,
  Layout,
  TextContainer,
  Checkbox,
  TextField,
  Link,
} from "@shopify/polaris";
import { useState } from "react";
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
    fulfillmentService,
    fulfillmentServices,
    currentStep,
    setCurrentStep,
  } = props;

  const [updatedFulfillmentManual, setUpdatedFulfillmentManual] = useState(
    fulfillmentManual ? fulfillmentManual : false
  );

  const getFulfillmentService = () => {
    return fulfillmentServices.find(
      (fulfillmentService) => fulfillmentService.type !== "MANUAL"
    );
  };

  const [updatedFulfillmentService, setUpdatedFulfillmentService] = useState(
    fulfillmentService || getFulfillmentService()?.serviceName || ""
  );
  const [updatedFulfillmentPhone, setUpdatedFulfillmentPhone] = useState(
    fulfillmentPhone || getFulfillmentService()?.location?.address.phone || ""
  );
  const [updatedFulfillmentEmail, setUpdatedFulfillmentEmail] = useState(fulfillmentEmail || "");

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
          <Card sectioned>
            <Card.Section>
              <TextContainer>
                <Heading>Your fulfillment information</Heading>
                <Checkbox
                  label="I fulfill orders manually, without professional assistance (i.e. from your home)"
                  checked={updatedFulfillmentManual}
                  onChange={setUpdatedFulfillmentManual}
                />
                <TextContainer>
                  <TextField
                    label="Fulfillment partner name"
                    value={updatedFulfillmentService}
                    onChange={setUpdatedFulfillmentService}
                    autoComplete="off"
                    helpText="This helps us cross reference against our database of known fulfillment partners. If you manage your own warehouse, please include your business name."
                    disabled={updatedFulfillmentManual}
                  />
                  <TextField
                    label="Fulfillment partner phone number"
                    value={updatedFulfillmentPhone}
                    onChange={setUpdatedFulfillmentPhone}
                    autoComplete="off"
                    helpText="We’ll use this number to connect with and onboard your fulfillment partner. If you manage your own warehouse, please include your own phone number."
                    disabled={updatedFulfillmentManual}
                  />
                  <TextField
                    type="email"
                    label="Fulfillment partner email address"
                    value={updatedFulfillmentEmail}
                    onChange={setUpdatedFulfillmentEmail}
                    autoComplete="off"
                    helpText="We’ll use this address to connect with and onboard your fulfillment partner. If you manage your own warehouse, please include your own email address."
                    disabled={updatedFulfillmentManual}
                  />
                </TextContainer>
                <Button
                  loading={disableButtons}
                  disabled={!updatedFulfillmentManual && (!updatedFulfillmentService || !updatedFulfillmentPhone || !updatedFulfillmentEmail)}
                  fullWidth
                  size="large"
                  primary
                  onClick={async () => {
                    setDisableButtons(true);
                    const existingValue = privateMetafieldValue
                      ? privateMetafieldValue
                      : {};
                    const privateMetafieldInput = {
                      namespace: "heythanks",
                      key: "shop",
                      valueInput: {
                        value: JSON.stringify({
                          ...existingValue,
                          fulfillmentManual: updatedFulfillmentManual,
                          fulfillmentService: updatedFulfillmentService,
                          fulfillmentPhone: updatedFulfillmentPhone,
                          fulfillmentEmail: updatedFulfillmentEmail,
                        }),
                        valueType: "JSON_STRING",
                      },
                    };
                    await upsertPrivateMetafield({
                      variables: { input: privateMetafieldInput },
                    });
                    setCurrentStep(currentStep + 1);
                    setDisableButtons(false);
                  }}
                >
                  Confirm and continue
                </Button>
              </TextContainer>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </TextContainer>
  );
};

export default Fulfillment;
