import { DisplayText, Layout, TextContainer } from "@shopify/polaris"
import TipsCard from "../tips-card/tips-card"

const Tips = () => {

  return (
    <TextContainer>
      <DisplayText size="large">Confirm your tip options</DisplayText>
      <DisplayText size="small">
        Please select values for the two tip options that will be presented to
        customers on your cart page. These amounts can be changed at any point.
      </DisplayText>
      <Layout>
        <Layout.Section>
          <TipsCard />
        </Layout.Section>
      </Layout>
    </TextContainer>
  )
}

export default Tips
