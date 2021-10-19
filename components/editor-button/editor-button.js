import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { Button } from "@shopify/polaris";
import { ExternalMinor } from "@shopify/polaris-icons";
import styles from "./editor-button.module.css";

const EditorButton = (props) => {
  const { myshopifyDomain } = props;

  const app = useAppBridge();
  const redirect = Redirect.create(app);

  let template = "cart";
  let uuid = "dd482a24-5a49-411f-bf18-24079033010b";
  let handle = "app-block";
  let link = `https://${myshopifyDomain}/admin/themes/current/editor?&template=${template}&activateAppId=${uuid}/${handle}`;

  return (
    <Button
      icon={ExternalMinor}
      size="large"
      onClick={() => redirect.dispatch(Redirect.Action.REMOTE, link)}
    >
      Launch theme editor
    </Button>
  );
};

export default EditorButton;
