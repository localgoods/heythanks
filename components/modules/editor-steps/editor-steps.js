import { Banner, Heading, List, TextContainer } from "@shopify/polaris"
import { useShop } from "../../../state/shop/context"
import styles from "./editor-steps.module.css"

const EditorSteps = () => {
  const [{ onboarded }] = useShop()

  return (
    <TextContainer>
      <Heading>Your HeyThanks Tips Widget</Heading>
      <p>
        Thanks to Shopify's App Blocks technology, its easy to manage your Tips
        Widget in the theme editor and take advantage of maximum flexibility
        along with consistent theme-compatibility.
      </p>
      <Banner status="info" title="What are App Blocks?">
        <p>
          App Blocks transform Shopify application code into Online Store 2.0
          theme-compatible widgets. They can be added to App sections in your
          template using the theme editor. This allows you to easily add app
          functionality exactly where you want to use it in your theme.
        </p>
      </Banner>
      <Heading>
        {!onboarded ? "Steps to add" : "Add"} the Tips Widget to your theme
      </Heading>
      <List type="number">
        <List.Item>
          Launch the theme editor using the <b>Launch theme editor</b> button
          below
        </List.Item>
        <List.Item>
          If your cart is empty, first add a product to your cart
        </List.Item>
        <List.Item>
          In your theme editor side panel, click <b>Add section</b>
        </List.Item>
        <List.Item>
          In the popup menu, scroll down to the <b>APPS</b> section
        </List.Item>
        <List.Item>
          Click on the <b>Tips Widget</b> app
        </List.Item>
        <List.Item>
          In the side panel click the new <b>Apps</b> section, and check{" "}
          <b>Make section margins the same as theme</b>
        </List.Item>
        <List.Item>
          To publish the changes, click the <b>Save</b> button in the top right
          corner of the theme editor
        </List.Item>
      </List>
      <Heading>
        {!onboarded ? "Steps to reposition" : "Reposition"} the Tips Widget in
        your theme
      </Heading>
      <List>
        <List.Item>
          In the side panel, select the drag handle icon and position the{" "}
          <b>Apps</b> section where desired (we recommend just above the{" "}
          <b>Subtotal</b> section)
        </List.Item>
        <List.Item>
          To publish the changes, click the <b>Save</b> button in the top right
          corner of the theme editor
        </List.Item>
      </List>
      <Heading>
        {!onboarded ? "Steps to customize" : "Customize"} the Tips Widget in
        your theme
      </Heading>
      <List type="number">
        <List.Item>
          In the side panel, expand the <b>Apps</b> section and click the{" "}
          <b>Tips Widget</b>
        </List.Item>
        <List.Item>
          In the side panel, your UI customization options will appear
        </List.Item>
        <List.Item>
          To publish the changes, click the <b>Save</b> button in the top right
          corner of the theme editor
        </List.Item>
      </List>
      <Heading>
        {!onboarded ? "Steps to remove" : "Remove"} the Tips Widget from your
        theme
      </Heading>
      <List type="number">
        <List.Item>
          In the side panel, click the <b>Apps</b> section
        </List.Item>
        <List.Item>
          In the side panel, at the bottom, click <b>Remove section</b>
        </List.Item>
        <List.Item>
          To publish the changes, click the <b>Save</b> button in the top right
          corner of the theme editor
        </List.Item>
      </List>
    </TextContainer>
  )
}

export default EditorSteps
