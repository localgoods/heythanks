import { DisplayText, Layout, TextContainer } from "@shopify/polaris"
import FulfillmentCard from "../../modules/fulfillment-card/fulfillment-card"

const Fulfillment = () => {

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
          <FulfillmentCard />
        </Layout.Section>
      </Layout>
    </TextContainer>
  )
}

export default Fulfillment
