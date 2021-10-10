import {
  Badge,
  Button,
  Card,
  DisplayText,
  Heading,
  Layout,
  List,
  Page,
  TextContainer,
  TextStyle,
} from "@shopify/polaris";
import styles from "./plan.module.css";

import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { useMutation } from "@apollo/client";

import { GET_BASIC_SUBSCRIPTION_URL } from "../../graphql/mutations/get-basic-subscription-url";
import { GET_PRO_SUBSCRIPTION_URL } from "../../graphql/mutations/get-pro-subscription-url";

const Plan = (props) => {
  const {
    myshopifyDomain,
    manualFulfillment,
    currentStep,
    setCurrentStep,
  } = props;

  const app = useAppBridge();
  const redirect = Redirect.create(app);

  const [getBasicSubscriptionUrl] = useMutation(GET_BASIC_SUBSCRIPTION_URL);

  const [getProSubscriptionUrl] = useMutation(GET_PRO_SUBSCRIPTION_URL);

  return (
    <Page
      breadcrumbs={[{ onAction: () => setCurrentStep(currentStep - 1) }]}
      title={`Step ${currentStep}`}
    >
      <TextContainer>
        <DisplayText size="large">Please pick a plan</DisplayText>
        <DisplayText size="small">
          We only have two plans and you can cancel anytime. If you use
          professional fulfillment then you will need to use the Pro Plan.
        </DisplayText>
        <Layout>
          <Layout.Section oneHalf>
            <Card sectioned subdued={!manualFulfillment}>
              <Card.Section>
                <TextContainer>
                  <DisplayText size="large">Basic Plan</DisplayText>
                  <div className={styles.plan__heading}>
                    <Heading>
                      <TextStyle variation="subdued">
                        Our basic plan is best for stores that self-fulfill.
                      </TextStyle>
                      <br></br>
                      <br></br>
                      {manualFulfillment && (
                        <Badge status="success" size="medium">
                          Recommended for your shop
                        </Badge>
                      )}
                    </Heading>
                  </div>
                  <DisplayText size="large">
                    <TextStyle variation="subdued">$4.99/month</TextStyle>
                  </DisplayText>
                  <div className={styles.plan__list}>
                    <List type="bullet">
                      <List.Item>Access all custom UI features</List.Item>
                      <List.Item>All reporting</List.Item>
                      <List.Item>Support for self-fulfillment</List.Item>
                    </List>
                  </div>
                  <Button
                    size="large"
                    primary
                    fullWidth
                    onClick={async () => {
                      const url = `https://${myshopifyDomain}/admin/apps/heythanks${
                        process.env.NODE_ENV !== "production" ? "-dev" : ""
                      }`;
                      let response = await getBasicSubscriptionUrl({
                        variables: { url },
                      });
                      const {
                        confirmationUrl,
                      } = response.data.appSubscriptionCreate;
                      redirect.dispatch(
                        Redirect.Action.REMOTE,
                        confirmationUrl
                      );
                    }}
                  >
                    Subscribe to Basic
                  </Button>
                </TextContainer>
              </Card.Section>
            </Card>
          </Layout.Section>
          <Layout.Section oneHalf>
            <Card sectioned subdued={manualFulfillment}>
              <Card.Section>
                <TextContainer>
                  <DisplayText size="large">Pro Plan</DisplayText>
                  <div className={styles.plan__heading}>
                    <Heading>
                      <TextStyle variation="subdued">
                        Our pro plan is best for stores that use a professional
                        fulfillment partner.
                      </TextStyle>
                      <br></br>
                      <br></br>
                      {!manualFulfillment && (
                        <Badge status="success" size="medium">
                          Recommended for your shop
                        </Badge>
                      )}
                    </Heading>
                  </div>
                  <DisplayText size="large">
                    <TextStyle variation="subdued">$19.99/month</TextStyle>
                  </DisplayText>
                  <div className={styles.plan__list}>
                    <List type="bullet">
                      <List.Item>Access all custom UI features</List.Item>
                      <List.Item>All reporting</List.Item>
                      <List.Item>
                        Support for professional fulfillment
                      </List.Item>
                    </List>
                  </div>
                  <Button
                    size="large"
                    primary
                    fullWidth
                    onClick={async () => {
                      const url = `https://${myshopifyDomain}/admin/apps/heythanks${
                        process.env.NODE_ENV !== "production" ? "-dev" : ""
                      }`;
                      let response = await getProSubscriptionUrl({
                        variables: { url },
                      });
                      const {
                        confirmationUrl,
                      } = response.data.appSubscriptionCreate;
                      redirect.dispatch(
                        Redirect.Action.REMOTE,
                        confirmationUrl
                      );
                    }}
                  >
                    Subscribe to Pro
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

export default Plan;
