import { Card, DisplayText, Heading, Layout, Link, TextContainer } from "@shopify/polaris"

const Support = () => {

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
                <Link url="mailto:hello@heythanks.io" external>
                    hello@heythanks.io
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
                <Link url="https://www.heythanks.io/faq?utm_source=cart_widget&utm_medium=shopify" external>
                  FAQs
                </Link>
              </TextContainer>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </TextContainer>
  )
}

export default Support
