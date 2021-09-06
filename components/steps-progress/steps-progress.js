import { ProgressBar } from "@shopify/polaris";
import StepsList from "./assets/steps-list";
import styles from './steps-progress.module.css';

const StepsProgress = (props) => {
    const { currentStep, steps } = props;
    return (
        <div className={styles.progress__wrapper}>
            <ProgressBar progress={currentStep === 0 ? 1 : currentStep / (steps.length - 1) * 100} />
            <StepsList steps={steps} />
        </div>
    )
}

export default StepsProgress;
