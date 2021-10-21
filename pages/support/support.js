import { Card, DisplayText, Heading, Layout, Link, TextContainer } from "@shopify/polaris";
import styles from "./support.module.css";

const Support = (props) => {

    return (
    <TextContainer>
      <DisplayText size="large">Support</DisplayText>
      <DisplayText size="small">
        Send us a message, or view answers to common questions.
      </DisplayText>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Card.Section>
              <TextContainer>
                <Heading>Contact support</Heading>
                <span>Need help? Please send a message to </span>
                <Link url="mailto:support@heythanks.io" external>
                    support@heythanks.io
                </Link>
              </TextContainer>
            </Card.Section>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card sectioned>
            <Card.Section>
              <TextContainer>
                <Heading>Read our FAQs</Heading>
                <span>
                  We've compiled answers to some common questions. View our{" "}
                </span>
                <Link url="https://www.heythanks.io/faq" external>
                  FAQs
                </Link>
              </TextContainer>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </TextContainer>
  );
};

export default Support;
