import { Caption } from '@shopify/polaris';
import styles from './steps-list.module.css';

const StepsList = (props) => {
  const { currentStep, steps } = props;
  const listItems = steps.map((step, index) =>
    <li className={currentStep === index ? styles.selected : ''} style={{ left: `${(index / (steps.length - 1)) * 100}%` }}>
      <Caption>{step}</Caption>
    </li>
  );
  return (
    <div className={styles.list__wrapper}>
      <ul>{listItems}</ul>
    </div>
  );
}

export default StepsList;