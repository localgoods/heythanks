import { ProgressBar } from "@shopify/polaris"
import { useSettings } from "../../state/settings/context"
import StepsList from "../steps-list/steps-list"
import styles from './steps-progress.module.css'

const StepsProgress = () => {
    const [{ currentStep, steps }] = useSettings()
    return (
        <div className={styles.progress__wrapper}>
            <ProgressBar progress={currentStep / (steps.length - 1) * 100} />
            <StepsList />
        </div>
    )
}

export default StepsProgress
