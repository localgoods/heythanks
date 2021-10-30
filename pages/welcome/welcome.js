import {
  Button,
  Card,
  DisplayText,
  Page,
  TextContainer,
} from "@shopify/polaris";
import styles from "./welcome.module.css";

import OnboardingSrc from "../../public/images/Onboarding.svg";
import HeyThanksSrc from "../../public/images/HeyThanks.svg";

const Welcome = (props) => {
  const { name, currentStep, setCurrentStep } = props;

  return (
    <Card sectioned>
      <Card.Section>
        <TextContainer>
          <img
            alt=""
            width="100%"
            height="100%"
            style={{
              display: "block",
            }}
            src={OnboardingSrc}
          />
          <DisplayText size="large">
            Let's reward the hardest workers in e-commerce
          </DisplayText> 
          <p>
            Hello <b>{name}</b> team,
            <br></br>
            <br></br>
            Thank you for downloading our app! At HeyThanks, we believe that recognizing and rewarding essential workers is fundamentally the right thing to do, for all businesses. And we know the modern consumer agrees. By treating other humans fairly, your business will attract more loyal and value aligned customers.
            <br></br>
            <br></br>
            With Heythanks, we want to enable every business to combine what is good for business with what is good for humanity. As Benjamin Franklin noted, the ultimate goal of enterprise is to, “Do well by doing good.”
            <br></br>
            <br></br>
            As a small team from New Hampshire, we are grateful that you are joining us to help make the world a better place, one small tip at a time.
            <br></br>
            <br></br>
            Regards,
            <br></br>
            <span className={styles.welcome__signature}>
              The&nbsp;
              <img src={HeyThanksSrc} loading="lazy" />
              &nbsp;team
            </span>
          </p>
          <Button
            fullWidth
            size="large"
            primary
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            Get started with onboarding
          </Button>
        </TextContainer>
      </Card.Section>
    </Card>
  );
};

export default Welcome;
