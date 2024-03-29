import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client"
import App from "next/app"
import { AppProvider } from "@shopify/polaris"
import { Provider, useAppBridge } from "@shopify/app-bridge-react"
import { authenticatedFetch } from "@shopify/app-bridge-utils"
import { Redirect } from "@shopify/app-bridge/actions"
import "@shopify/polaris/build/esm/styles.css"
import translations from "@shopify/polaris/locales/en.json"
import { CustomSettingsProvider } from "../state/custom-settings/provider"
import { SettingsProvider } from "../state/settings/provider"
import { ShopProvider } from "../state/shop/provider"

export function userLoggedInFetch(app) {
  const fetchFunction = authenticatedFetch(app)

  return async (uri, options) => {
    const response = await fetchFunction(uri, options)

    if (
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1"
    ) {
      const authUrlHeader = response.headers.get(
        "X-Shopify-API-Request-Failure-Reauthorize-Url"
      )

      const redirect = Redirect.create(app)
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`)
      return null
    }

    return response
  }
}

export function customFetch(app) {
  const fetchFunction = authenticatedFetch(app)

  return async (uri, options) => {
    const response = await fetchFunction(uri, options)

    if (
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1"
    ) {
      const authUrlHeader = response.headers.get(
        "X-Shopify-API-Request-Failure-Reauthorize-Url"
      )

      const redirect = Redirect.create(app)
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`)
      return null
    }

    return response
  }
}

function MyProvider(props) {
  const app = useAppBridge()

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: createHttpLink({
      credentials: "include",
      headers: {
        "Content-Type": "application/graphql",
      },
      fetch: userLoggedInFetch(app),
    }),
  })

  const Component = props.Component

  return (
    <ApolloProvider client={client}>
      <ShopProvider app={app}>
        <CustomSettingsProvider>
          <SettingsProvider>
            <Component {...props} />
          </SettingsProvider>
        </CustomSettingsProvider>
      </ShopProvider>
    </ApolloProvider>
  )
}

class MyApp extends App {
  render() {
    const { Component, pageProps, host } = this.props
    return (
      <AppProvider i18n={translations}>
        <Provider
          config={{
            // eslint-disable-next-line no-undef
            apiKey: API_KEY,
            host: host,
            forceRedirect: true,
          }}
        >
          <MyProvider Component={Component} {...pageProps} />
        </Provider>
      </AppProvider>
    )
  }
}

MyApp.getInitialProps = async ({ ctx }) => {
  return {
    host: ctx.query.host,
  }
}

export default MyApp
