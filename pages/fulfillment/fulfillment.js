import {
  Button,
  Card,
  DisplayText,
  Heading,
  Layout,
  Page,
  TextContainer,
  Checkbox,
  TextField,
  Link,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import styles from "./fulfillment.module.css";

const Fulfillment = (props) => {
  const {
    manualFulfillment,
    fulfillmentServices,
    currentStep,
    setCurrentStep,
  } = props;

  const [manualConfirmed, setManualConfirmed] = useState(manualFulfillment);

  const getFulfillmentService = (manualConfirmed) => {
    return fulfillmentServices.find((fulfillmentService) => {
      if (manualConfirmed) return fulfillmentService.type === "MANUAL";
      return fulfillmentService.type !== "MANUAL";
    });
  };

  const [fulfillmentService, setFulfillmentService] = useState(
    getFulfillmentService(manualConfirmed)
  );

  const [fulfillmentServiceName, setFulfillmentServiceName] = useState(
    fulfillmentService?.serviceName || ""
  );
  const [fulfillmentServicePhone, setFulfillmentServicePhone] = useState(
    fulfillmentService?.location?.address.phone || ""
  );
  const [fulfillmentServiceEmail, setFulfillmentServiceEmail] = useState("");

  useEffect(() => {
    setFulfillmentService(getFulfillmentService(manualConfirmed));
  }, [manualConfirmed]);

  useEffect(() => {
    setFulfillmentServiceName(fulfillmentService?.serviceName || "");
    setFulfillmentServicePhone(
      fulfillmentService?.location?.address.phone || ""
    );
    setFulfillmentServiceEmail("");
  }, [fulfillmentService]);

  return (
    <Page
      breadcrumbs={[{ onAction: () => setCurrentStep(currentStep - 1) }]}
      title={`Step ${currentStep}`}
    >
      <TextContainer>
        <DisplayText size="large">
          Confirm your fulfillment information
        </DisplayText>
        <DisplayText size="small">
          In order to make payouts to the fulfillment workers who pick, pack,
          and ship your orders, please confirm the following details about your
          fulfillment.
        </DisplayText>
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <Card.Section>
                <TextContainer>
                  <Heading>Your fulfillment</Heading>
                  <Checkbox
                    label="I only fulfill orders myself"
                    checked={manualConfirmed}
                    onChange={setManualConfirmed}
                    helpText={
                      <Link url="" external>
                        What does this mean?
                      </Link>
                    }
                  />
                  {!manualConfirmed && (
                    <TextContainer>
                      <TextField
                        label="Fulfillment partner name"
                        value={fulfillmentServiceName}
                        onChange={setFulfillmentServiceName}
                        autoComplete="off"
                        helpText="This helps us cross reference against our database of known fulfillment partners"
                      />
                      <TextField
                        label="Fulfillment partner phone number"
                        value={fulfillmentServicePhone}
                        onChange={setFulfillmentServicePhone}
                        autoComplete="off"
                        helpText="We’ll use this number to connect with and onboard your fulfillment partner"
                      />
                      <TextField
                        type="email"
                        label="Fulfillment partner email address"
                        value={fulfillmentServiceEmail}
                        onChange={setFulfillmentServiceEmail}
                        autoComplete="off"
                        helpText="We’ll use this address to connect with and onboard your fulfillment partner"
                      />
                    </TextContainer>
                  )}
                  <Button
                    fullWidth
                    size="large"
                    primary
                    onClick={() => {
                      console.log(manualFulfillment);
                      setCurrentStep(currentStep + 1);
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
    </Page>
  );
};

export default Fulfillment;
