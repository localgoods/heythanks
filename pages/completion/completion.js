import {
  Button,
  Card,
  DisplayText,
  Layout,
  Page,
  TextContainer,
} from "@shopify/polaris";
import styles from "./completion.module.css";

import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";

const Completion = (props) => {

    const app = useAppBridge();
    const redirect = Redirect.create(app);
    
  const { myshopifyDomain, currentStep, setCurrentStep } = props;

  let template = "cart";
  let uuid = "dd482a24-5a49-411f-bf18-24079033010b";
  let handle = "app-block";
  let link = `https://${myshopifyDomain}/admin/themes/current/editor?&template=${template}&activateAppId=${uuid}/${handle}`;

  return (
    <Page
      breadcrumbs={[{ onAction: () => setCurrentStep(currentStep - 1) }]}
      title={`Step ${currentStep}`}
    >
      <TextContainer>
        <DisplayText size="large">Add HeyThanks to your cart page</DisplayText>
        <DisplayText size="small">
          You made it! Click the complete button below to start changing the
          world! You'll be taken to the cart in your theme editor to insert,
          customize and deploy HeyThanks to your store.
        </DisplayText>
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <Card.Section>
                <TextContainer>
                  <div className={styles.img__placeholder}>
                    <span>Editor add-section demo GIF</span>
                  </div>
                  <Button
                    fullWidth
                    size="large"
                    primary
                    onClick={() =>
                      redirect.dispatch(Redirect.Action.REMOTE, link)
                    }
                  >
                    Complete in theme editor
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

export default Completion;
