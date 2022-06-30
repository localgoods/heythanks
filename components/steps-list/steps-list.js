import { useSettings } from '../../state/settings/context'
import styles from './steps-list.module.css'

const StepsList = () => {
  const [{ currentStep, steps }] = useSettings()
  const listItems = steps.map((step, index) =>
    <li key={index} className={currentStep === index ? styles.selected : ''} style={{ left: `${(index / (steps.length - 1)) * 100}%` }}>
      {step}
    </li>
  )
  return (
    <div className={styles.list__wrapper}>
      <ul>{listItems}</ul>
    </div>
  )
}

export default StepsList