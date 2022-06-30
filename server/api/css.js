import puppeteer from 'puppeteer-core'

export async function getCss(url) {
	const dev = process.env.NODE_ENV !== "production"

	console.log('Fetching css from shop at', url)
	const browserFetcher = puppeteer.createBrowserFetcher()
	const revisionInfo = await browserFetcher.download("1011831")
	const options = { executablePath: revisionInfo.executablePath, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
	const browser = await puppeteer.launch(options)
	const page = await browser.newPage()

	// Set an explicit UserAgent, because the default UserAgent string includes something like
	// `HeadlessChrome/88.0.4298.0` and some websites/CDN's block that with a HTTP 403
	await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.16; rv:85.0) Gecko/20100101 Firefox/85.0')

	// Start CSS coverage. This is the meat and bones of this module
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	await page.coverage.startCSSCoverage()

	let response

	try {
		const gotoOptions = {
			waitUntil: 'networkidle0',
			timeout: 9000
		}

		// We have to login if it's a development store
		if (dev) {
			await page.goto(`${url}/password`, gotoOptions)
			await page.type('input[type="password"]', process.env.SHOP_PW)
			await page.click('button[type="submit"]')
			response = await page.waitForNavigation()
		} else {
			response = await page.goto(url, gotoOptions)
		}
	} catch (error) {
		await browser.close()

		console.error(error.name)
		console.error(error.stack)
		throw new Error(`There was an error retrieving CSS from ${url}. No response received from server.`)
	}

	// Make sure that we only try to extract CSS from valid pages.
	// Bail out if the response is an invalid request (400, 500)
	if (response.status() >= 400) {
		await browser.close()
		throw new Error(
			`There was an error retrieving CSS from ${url}.\n\tHTTP status code: ${response.statusCode} (${response.statusText})`
		)
	}

	// If the response is a CSS file, return that file
	// instead of running our complicated setup
	const headers = response.headers()

	if (headers['content-type'].includes('text/css')) {
		const css = await response.text()
		await browser.close()

		return [{
			type: 'file',
			href: url,
			css
		}]
	}

	// Coverage contains a lot of <style> and <link> CSS,
	// but not all...
	const coverage = await page.coverage.stopCSSCoverage()

	// Get all CSS generated with the CSSStyleSheet API
	// This is primarily for CSS-in-JS solutions
	// See: https://developer.mozilla.org/en-US/docs/Web/API/CSSRule/cssText
	const styleSheetsApiCss = await page.evaluate(() => {
		return Array.from(document.styleSheets)
			// Only take the stylesheets without href (these are <style> tags)
			.filter(stylesheet => stylesheet.href === null)
			.map(stylesheet => {
				return {
					type: stylesheet.ownerNode.tagName.toLowerCase(),
					href: stylesheet.href || document.location.href,
					css: Array.from(stylesheet.cssRules).map(({ cssText }) => cssText).join('\n')
				}
			})
	})

	// Get all inline styles: <element style="">
	// This creates a new CSSRule for every inline style
	// attribute it encounters.
	//
	// Example:
	//
	// ```html
	// <h1 style="color: red;">Text</h1>
	// ```
	//
	// ```css
	// [x-extract-css-inline-style] {
	//   color: red;
	// }
	// ```
	const inlineCssRules = await page.evaluate(() => {
		return Array.from(document.querySelectorAll('[style]'))
			.map(element => element.getAttribute('style'))
			// Filter out empty style="" attributes
			.filter(Boolean)
	})

	await browser.close()

	const inlineCss = inlineCssRules
		.map(rule => `[x-extract-css-inline-style] { ${rule} }`)
		.map(css => ({ type: 'inline', href: url, css }))

	const links = coverage
		// Filter out the <style> tags that were found in the coverage
		// report since we've conducted our own search for them.
		// A coverage CSS item with the same url as the url of the page
		// we requested is an indication that this was a <style> tag
		.filter(entry => entry.url !== url)
		.map(entry => ({
			href: entry.url,
			css: entry.text,
			type: 'link-or-import'
		}))

	const resources = links
		.concat(styleSheetsApiCss)
		.concat(inlineCss)

	return resources
}