import { SettingToggle, FormLayout, TextContainer, TextStyle } from "@shopify/polaris"
import { useCallback } from "react"
import { useShop } from "../../state/shop/context"
import { useCustomSettings } from "../../state/custom-settings/context"
import localStyles from './visibility-toggle.module.css'
import globalStyles from '../../pages/index.module.css'

const styles = { ...localStyles, ...globalStyles }

const VisibilityToggle = () => {

    const [{
        privateMetafieldValue,
        activePlan,
        upsertPrivateMetafield
    }] = useShop()

    const [{
        displayStatus,
        setDisplayStatus,
    }] = useCustomSettings()

    // Display status 
    const handleDisplayStatusChange = useCallback(async () => {
        const newDisplayStatus = !displayStatus
        setDisplayStatus(newDisplayStatus)

        const existingValue = privateMetafieldValue
        ? privateMetafieldValue
        : {}

        const privateMetafieldInput = {
            namespace: "heythanks",
            key: "shop",
            valueInput: {
                value: JSON.stringify({
                    ...existingValue,
                    customSettings: {
                        ...existingValue.customSettings,
                        displayStatus: newDisplayStatus
                    },
                    onboarded: true,
                }),
                valueType: "JSON_STRING"
            }
        }

        const res = await upsertPrivateMetafield({
            variables: { input: privateMetafieldInput }
        })

        console.log('RES', res)
    })

    const contentStatus = displayStatus ? 'Hide' : 'Show'
    const textStatus = displayStatus ? 'visible on your storefront' : 'not visible on your storefront'

    return (
        <TextContainer>
            {!activePlan && (
                <TextStyle variation="negative">
                    Please renew your plan to edit the widget.
                </TextStyle>
            )}
            <FormLayout>

                <div className={styles.spacer}></div>

                <FormLayout.Group>
                    <TextContainer>
                       <SettingToggle
                            action={{
                                content: contentStatus,
                                onAction: handleDisplayStatusChange
                            }}
                            enabled={displayStatus}>
                            The tip widget is <TextStyle variation="strong">{textStatus}</TextStyle>.
                        </SettingToggle>
                    </TextContainer>
                </FormLayout.Group>

                <div className={styles.spacer}></div>

            </FormLayout>

        </TextContainer>
    )
}

export default VisibilityToggle
