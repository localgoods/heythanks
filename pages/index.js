import {
  Page,
  Card,
  TextContainer,
  DisplayText,
  Button,
  TextStyle,
  Layout,
  Heading,
  List,
  TextField,
  ButtonGroup,
  Select,
  RangeSlider,
  ColorPicker,
  Frame,
  Loading
} from "@shopify/polaris";
import StepsProgress from "../components/steps-progress/steps-progress";
import React, { useState } from "react";
import styles from "./index.module.css";
import { gql, useQuery } from "@apollo/client";

import { Redirect } from '@shopify/app-bridge/actions';

import { useAppBridge } from "@shopify/app-bridge-react";

const GET_SHOP_INFO = gql`
query {
  shop {
    name
    myshopifyDomain
    fulfillmentServices {
      serviceName
    } 
  }
}
`;

const steps = [
  "Pick plan",
  "Customize UI",
  "Confirm fulfillment",
  "Preview and finalize",
];

const emojiOptions1 = [
  {
    value: "None",
    label: "None",
  },
  {
    value: "🙂",
    label: "🙂",
  },
  {
    value: "🏎",
    label: "🏎",
  },
];

const emojiOptions2 = [
  {
    value: "None",
    label: "None",
  },
  {
    value: "🥰",
    label: "🥰",
  },
  {
    value: "🚀",
    label: "🚀",
  },
];

const Index = () => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const { loading, error, data } = useQuery(GET_SHOP_INFO);

  const [currentStep, setCurrentStep] = useState(1);
  const [tipOption1, setTipOption1] = useState("1");
  const [tipOption2, setTipOption2] = useState("5");
  const [emojiOption1, setEmojiOption1] = useState("🙂");
  const [emojiOption2, setEmojiOption2] = useState("🥰");
  const [strokeWidth, setStrokeWidth] = useState("5");
  const [cornerRadius, setCornerRadius] = useState("5");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");

  if (loading) return (
    <div style={{height: '100px'}}>
      <Frame>
        <Loading />
      </Frame>
    </div>
  );

  if (error) return (
    <div style={{height: '100px'}}>
      <Frame>
        <p>`Error! ${error.message}`</p>
      </Frame>
    </div>
  );

  console.log(data);

  const { name, myshopifyDomain, fulfillmentServices } = data.shop;

  const basicRecommended = fulfillmentServices.length === 1 && fulfillmentServices.find(service => service.serviceName === 'Manual');

  let template = 'index';
  let uuid = 'dd482a24-5a49-411f-bf18-24079033010b';
  let handle = 'app-block';
  let link = `https://${myshopifyDomain}/admin/themes/current/editor?&template=${template}&activateAppId=${uuid}/${handle}`;

  return (
    <div>
      <header className={styles.progress__header}>
        <StepsProgress
          currentStep={currentStep - 1}
          steps={steps}
        ></StepsProgress>
      </header>
      <div className={styles.step__wrapper}>
        <Page
          breadcrumbs={
            currentStep !== 1
              ? [{ onAction: () => setCurrentStep(currentStep - 1) }]
              : []
          }
          title={`Step ${currentStep}`}
        >
          {currentStep === 1 && (
            <TextContainer>
              <DisplayText size="large">Please pick a plan</DisplayText>
              <DisplayText size="small">
                We only have two plans and you can cancel anytime. If you use
                professional fulfillment then you will need to use the Pro Plan.
              </DisplayText>
              <Layout>
                <Layout.Section oneThird>
                  <Card sectioned>
                    <TextContainer>
                      <DisplayText size="large">Basic Plan</DisplayText>
                      <div className={styles.plan__heading}>
                        <Heading>
                          <TextStyle variation="subdued">
                            Our basic plan is best for stores that self-fulfill. {basicRecommended && (<TextStyle variation="positive">Recommended based on your shop settings.</TextStyle>)}
                          </TextStyle>
                        </Heading>
                      </div>
                      <DisplayText size="large">
                        <TextStyle variation="subdued">$0/month</TextStyle>
                      </DisplayText>
                      <div className={styles.plan__list}>
                        <List type="bullet">
                          <List.Item>Access all custom UI features</List.Item>
                          <List.Item>All reporting</List.Item>
                          <List.Item>Support for self-fulfillment</List.Item>
                        </List>
                      </div>
                      <Button
                        primary
                        fullWidth
                        onClick={() => setCurrentStep(currentStep + 1)}
                      >
                        Subscribe to Basic
                      </Button>
                    </TextContainer>
                  </Card>
                </Layout.Section>
                <Layout.Section oneThird>
                  <Card sectioned>
                    <TextContainer>
                      <DisplayText size="large">Pro Plan</DisplayText>
                      <div className={styles.plan__heading}>
                        <Heading>
                          <TextStyle variation="subdued">
                            Our pro plan is best for stores that use a
                            professional fulfillment partner. {!basicRecommended && (<TextStyle variation="positive">Recommended based on your shop settings.</TextStyle>)}
                          </TextStyle>
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
                        primary
                        fullWidth
                        onClick={() => setCurrentStep(currentStep + 1)}
                      >
                        Subscribe to Pro
                      </Button>
                    </TextContainer>
                  </Card>
                </Layout.Section>
                <Layout.Section oneThird>
                  <Card sectioned>
                    <TextContainer>
                      <p>
                        Hello { name } team,<br></br>
                        <br></br>
                        Thank you for downloading our app! We are a small team
                        from New Hampshire. We started HeyThanks inspired by one
                        of our idols, Benjamin Franklin’s most famous ideas,
                        <br></br>
                        <br></br>
                        “Do well by doing good.”<br></br>
                        <br></br>
                        We believe that we can help generate good in the world
                        by enabling consumers and brands to show that they care
                        about the workers on whom they depend.<br></br>
                        <br></br>
                        We hope you help us carry out that mission!
                      </p>
                    </TextContainer>
                  </Card>
                </Layout.Section>
              </Layout>
            </TextContainer>
          )}
          {currentStep === 2 && (
            <TextContainer>
              <DisplayText size="large">
                Now, customize how it looks in your cart
              </DisplayText>
              <DisplayText size="small">
                The HeyThanks app will be added to your cart page. You may see
                lower abandoments as your customers see an opportunity to do
                good!
              </DisplayText>
              <Layout>
                <Layout.Section oneThird>
                  <Card sectioned>
                    <TextContainer>
                      <Heading>Pick tip amounts</Heading>
                      <TextField
                        label="Tip option 1"
                        type="number"
                        onChange={setTipOption1}
                        value={tipOption1}
                      ></TextField>
                      <TextField
                        label="Tip option 2"
                        type="number"
                        onChange={setTipOption2}
                        value={tipOption2}
                      ></TextField>
                    </TextContainer>
                  </Card>
                  <Card sectioned>
                    <TextContainer>
                      <Heading>Pick emojis</Heading>
                      <Select
                        label="Emoji option 1"
                        options={emojiOptions1}
                        onChange={setEmojiOption1}
                        value={emojiOption1}
                      />
                      <Select
                        label="Emoji option 2"
                        options={emojiOptions2}
                        onChange={setEmojiOption2}
                        value={emojiOption2}
                      />
                    </TextContainer>
                  </Card>
                  <Card sectioned>
                    <TextContainer>
                      <Heading>Pick stroke options</Heading>
                      <RangeSlider
                        label="Stroke width"
                        value={strokeWidth}
                        onChange={setStrokeWidth}
                        output
                      />
                      <RangeSlider
                        label="Corner radius"
                        value={cornerRadius}
                        onChange={setCornerRadius}
                        output
                      />
                      <ColorPicker
                        label="Stroke color"
                        onChange={setStrokeColor}
                        color={strokeColor}
                        allowAlpha
                      />
                    </TextContainer>
                  </Card>
                  <Card sectioned>
                    <TextContainer>
                      <Heading>Pick background options</Heading>
                      <ColorPicker
                        label="Background color"
                        onChange={setBackgroundColor}
                        color={backgroundColor}
                        allowAlpha
                      />
                    </TextContainer>
                  </Card>
                </Layout.Section>
                <Layout.Section oneHalf>
                  <Card sectioned>
                    <TextContainer>
                      <Heading>Preview tip card</Heading>
                      <p>
                        By default, the tip cards will inheret the font family
                        of your theme.
                      </p>
                      <p
                        style={{
                          height: "500px",
                          borderRadius: "25px",
                          background: "grey",
                        }}
                      ></p>
                      <ButtonGroup>
                        <Button
                          primary
                          onClick={() => setCurrentStep(currentStep + 1)}
                        >
                          Continue
                        </Button>
                        <Button>Restore Defaults</Button>
                      </ButtonGroup>
                    </TextContainer>
                  </Card>
                </Layout.Section>
              </Layout>
            </TextContainer>
          )}
          {currentStep === 3 && (
            <TextContainer>
              <DisplayText size="large">
                Onboard your fulfillment partner
              </DisplayText>
              <DisplayText size="small">
                In order to make payouts to the fulfillment workers who pick,
                pack, and ship your orders, please confirm your fulfillment
                partner.
              </DisplayText>
              <Layout>
                <Layout.Section>
                  <Card sectioned>
                    <TextContainer>
                      <Heading>Fulfillment partner name:</Heading>
                      <p>ABC FulFillment Partners</p>
                      <ButtonGroup>
                        <Button
                          primary
                          onClick={() => setCurrentStep(currentStep + 1)}
                        >
                          Confirm
                        </Button>
                        <Button>Not Correct</Button>
                      </ButtonGroup>
                    </TextContainer>
                  </Card>
                </Layout.Section>
              </Layout>
            </TextContainer>
          )}
          {currentStep === 4 && (
            <TextContainer>
              <DisplayText size="large">Confirm and finish</DisplayText>
              <DisplayText size="small">
                You made it! Click the complete button below to start changing
                the world! Once you click confirm, HeyThanks will be visible on
                your site. You will be able to change any of the settings you
                just enabled in your admin.
              </DisplayText>
              <Layout>
                <Layout.Section>
                  <Card sectioned>
                    <Button primary onClick={() => redirect.dispatch(Redirect.Action.REMOTE, link)}>Confirm</Button>
                  </Card>
                </Layout.Section>
              </Layout>
            </TextContainer>
          )}
        </Page>
      </div>
    </div>
  );
};

export default Index;
