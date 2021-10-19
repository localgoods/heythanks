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
    currentPlan,
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
      breadcrumbs={ !currentPlan ? [{ onAction: () => setCurrentStep(currentStep - 1) }] : []}
      title={ !currentPlan ? `Step ${currentStep}` : '' }
    >
      <TextContainer>
        <DisplayText size="large">{ !currentPlan ? 'Please pick a plan' : 'Plan' }</DisplayText>
        <DisplayText size="small">
          { !currentPlan ? 'We only have two plans and you can cancel anytime. If you use professional fulfillment then you will need to use the Pro Plan.' : 'Manage your plan. Change or cancel anytime.' }
        </DisplayText>
        <Layout>
          <Layout.Section oneHalf>
            <div className={styles.plan__selected}>
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
                    primary={ !currentPlan || currentPlan === 'pro' }
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
                    { !currentPlan || currentPlan === 'pro' ? 'Subscribe to Basic' : 'Current plan' }
                  </Button>
                </TextContainer>
              </Card.Section>
            </Card>
            </div>
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
                    primary={ !currentPlan || currentPlan === 'basic' }
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
                    { !currentPlan || currentPlan === 'basic' ? 'Subscribe to Pro' : 'Current plan' }
                  </Button>
                </TextContainer>
              </Card.Section>
            </Card>
          </Layout.Section>
        </Layout>
        { currentPlan && (
          <Button fullWidth outline destructive size="large">Deactivate current plan</Button>
        )}
      </TextContainer>
    </Page>
  );
};

export default Plan;
