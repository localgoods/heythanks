import { useEffect, useState } from "react"
import { useCustomSettings } from "../../state/custom-settings/context"
import { useShop } from "../../state/shop/context"
import localStyles from './widget-preview.module.css'
import globalStyles from '../../pages/index.module.css'
const styles = { ...localStyles, ...globalStyles }
import Script from "next/script"

const WidgetPreview = () => {

    const [{
        myshopifyDomain,
        fetchCss,
        productData,
        getProductPrices
    }] = useShop()

    const [{
        backgroundColor,
        selectionColor,
        strokeColor,
        strokeWidth,
        cornerRadius,
        labelText,
        displayStatus,
    }] = useCustomSettings()

    const [previewPrices, setPreviewPrices] = useState(null)
    const [previewCss, setPreviewCss] = useState(null)

    useEffect(() => {
        const ac = new AbortController()

        /* Mount/remount preview */
        const ev = new Event("previewvisible", { bubbles: true, cancelable: true })
        window.dispatchEvent(ev)

        /* Get theme css for preview */
        fetchCss({ shop: myshopifyDomain }).then(css => {

            setPreviewCss(css)

            /* Push update to css in preview */
            const ev = new Event("cssupdate", { bubbles: true, cancelable: true })
            window.dispatchEvent(ev)
        })

        const { first: firstPrice, second: secondPrice } = getProductPrices(productData)
        setPreviewPrices({ firstPrice, secondPrice })

        return ac.abort()
    }, [])

    return (
        <>
            {/* Load HeyThanks widget for preview */}
            <Script src={(import('../../public/scripts/cart-widget.js')).src} strategy="lazyOnload" />

            <div className={styles.widget_box__label}>Widget Preview</div>

            <div id="heythanks-container" className={styles.widget_box}>
                <div id="heythanks-data" data-css={previewCss} data-prices={JSON.stringify(previewPrices)} data-settings={JSON.stringify({
                    backgroundColor,
                    selectionColor,
                    strokeColor,
                    strokeWidth,
                    cornerRadius,
                    labelText,
                    displayStatus
                })}></div>
            </div>
        </>
    )
}

export default WidgetPreview
