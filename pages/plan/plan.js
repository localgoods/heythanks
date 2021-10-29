import {
  Badge,
  Button,
  Card,
  DisplayText,
  Heading,
  Layout,
  List,
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
    onboarded,
    activePlan,
    activePlanId,
    myshopifyDomain,
    fulfillmentManual,
    disableButtons,
    setDisableButtons,
    deleteCurrentSubscription,
    currentStep,
    setCurrentStep
  } = props;

  const app = useAppBridge();
  const redirect = Redirect.create(app);

  const [getBasicSubscriptionUrl] = useMutation(GET_BASIC_SUBSCRIPTION_URL);

  const [getProSubscriptionUrl] = useMutation(GET_PRO_SUBSCRIPTION_URL);

  return (
      <TextContainer>
        <DisplayText size="large">{ !activePlan ? 'Please pick a plan' : 'Plan' }</DisplayText>
        <DisplayText size="small">
          { !activePlan ? 'We only have two plans and you can cancel anytime. If you use professional fulfillment then you will need to use the Pro Plan.' : 'Manage your plan. Change or cancel anytime.' }
        </DisplayText>
        <Layout>
          <Layout.Section oneHalf>
            <div className={styles.plan__selected}>
            <Card sectioned subdued={!fulfillmentManual}>
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
                      {fulfillmentManual && (
                        <Badge status="success" size="medium">
                          Recommended for your shop
                        </Badge>
                      )}
                      {!fulfillmentManual && (
                        <Badge status="danger" size="medium">
                          Recommended for manual fulfillment
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
                    disabled={!fulfillmentManual && activePlan !== 'Basic Plan'}
                    size="large"
                    primary={ !activePlan || activePlan === 'Pro Plan' }
                    fullWidth
                    onClick={async () => {
                      if (activePlan === 'Basic Plan') {
                        if (currentStep) setCurrentStep(currentStep + 1);
                        return;
                      };
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
                    { !activePlan || activePlan === 'Pro Plan' ? 'Subscribe to Basic' : activePlan === 'Basic Plan' && !onboarded ? 'Continue with this plan' : 'Current plan' }
                  </Button>
                </TextContainer>
              </Card.Section>
            </Card>
            </div>
          </Layout.Section>
          <Layout.Section oneHalf>
            <Card sectioned subdued={fulfillmentManual}>
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
                      {!fulfillmentManual && (
                        <Badge status="success" size="medium">
                          Recommended for your shop
                        </Badge>
                      )}
                      {fulfillmentManual && (
                        <Badge status="danger" size="medium">
                          Recommended for partner fulfillment
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
                    disabled={fulfillmentManual && activePlan !== 'Pro Plan'}
                    size="large"
                    primary={ !activePlan || activePlan === 'Basic Plan' }
                    fullWidth
                    onClick={async () => {
                      if (activePlan === 'Pro Plan') {
                        if (currentStep) setCurrentStep(currentStep + 1);
                        return;
                      };
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
                    { !activePlan || activePlan === 'Basic Plan' ? 'Subscribe to Pro' : activePlan === 'Pro Plan' && !onboarded ? 'Continue with this plan' : 'Current plan' }
                  </Button>
                </TextContainer>
              </Card.Section>
            </Card>
          </Layout.Section>
        </Layout>
        { activePlan && onboarded && (
          <Button fullWidth outline destructive size="large" disabled={disableButtons} onClick={async () => {
            setDisableButtons(true);
            await deleteCurrentSubscription({ variables: { id: activePlanId } });
            redirect.dispatch(Redirect.Action.APP, '/');
            setDisableButtons(false);
          }}>Deactivate current plan</Button>
        )}
      </TextContainer>
  );
};

export default Plan;
