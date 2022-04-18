import { DisplayText, Layout, TextContainer } from "@shopify/polaris";
import styles from "./tips.module.css";
import TipsCard from "../../modules/tips-card/tips-card";
import CustomizeCard from "../../modules/customize-card/customize-card";

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
        <Layout.Section>
          <CustomizeCard />
        </Layout.Section>
      </Layout>
    </TextContainer>
  );
};

export default Tips;
