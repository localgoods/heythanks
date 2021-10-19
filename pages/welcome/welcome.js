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
              objectFit: "cover",
              objectPosition: "center",
            }}
            src={OnboardingSrc}
          />
          <DisplayText size="large">
            Let's reward the hardest workers in e-commerce
          </DisplayText>
          <p>
            Welcome <b>{name}</b> team,
            <br></br>
            <br></br>
            Thank you for downloading our app! We are a small team from New
            Hampshire. HeyThanks is inspired by one of our idols, Benjamin
            Franklin’s most famous ideas, “Do well by doing good.”
            <br></br>
            <br></br>
            We believe that we can help generate good in the world by enabling
            consumers and brands to show that they care about the workers on
            whom they depend.
            <br></br>
            <br></br>
            We hope you help us carry out that mission!
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
