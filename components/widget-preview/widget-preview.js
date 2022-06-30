import { useEffect, useState } from "react"
import { useCustomSettings } from "../../state/custom-settings/context"
import { useShop } from "../../state/shop/context"
import localStyles from './widget-preview.module.css'
import globalStyles from '../../pages/index.module.css'
const styles = { ...localStyles, ...globalStyles }
// import Script from "next/script"

const WidgetPreview = () => {

    const [{
        myshopifyDomain,
        fetchCss
    }] = useShop()

    const [{
        firstEmoji,
        secondEmoji,
        backgroundColor,
        selectionColor,
        strokeColor,
        strokeWidth,
        cornerRadius,
        labelText,
        tooltipText,
        displayStatus,
    }] = useCustomSettings()

    const [previewCss, setPreviewCss] = useState(null)

    useEffect(() => {
        const ac = new AbortController()

        /* Mount/remount preview */
        import('../../public/scripts/widget.js').then(() => console.log('Loaded HeyThanks script'))
        const ev = new Event("previewvisible", { bubbles: true, cancelable: true })
        window.dispatchEvent(ev)

        /* Get theme css for preview */
        fetchCss({ shop: myshopifyDomain }).then(response => {
            const css = response.map(({ css }) => css).join('\n')
            setPreviewCss(css)

            /* Push update to css in preview */
            const ev = new Event("cssupdate", { bubbles: true, cancelable: true })
            window.dispatchEvent(ev)
        })
        return ac.abort()
    }, [])

    return (
        <>

            {/* Load HeyThanks widget for preview */}
            {/* <Script src={(import('../../public/scripts/widget.js')).src} strategy="lazyOnload" /> */}

            <div className={styles.widget_box__label}>Widget Preview</div>

            <div className={styles.widget_box}>
                <div id="heythanks-data" data-css={previewCss} data-settings={JSON.stringify({
                    firstEmoji,
                    secondEmoji,
                    backgroundColor,
                    selectionColor,
                    strokeColor,
                    strokeWidth,
                    cornerRadius,
                    labelText,
                    tooltipText,
                    displayStatus
                })}></div>
            </div>
        </>
    )
}

export default WidgetPreview
