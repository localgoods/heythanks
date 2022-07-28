import { useMutation, useQuery } from "@apollo/client"
import { ShopContext } from "./context"
import { DELETE_PRIVATE_METAFIELD } from "../../graphql/mutations/delete-private-metafield"
import { UPSERT_PRIVATE_METAFIELD } from "../../graphql/mutations/upsert-private-metafield"
import { GET_SHOP_INFO } from "../../graphql/queries/get-shop-info"
import { CREATE_TIP_PRODUCT } from "../../graphql/mutations/create-tip-product"
import { DELETE_TIP_PRODUCT } from "../../graphql/mutations/delete-tip-product"
import { UPDATE_TIP_PRODUCT_VARIANT } from "../../graphql/mutations/update-tip-product-variant"
import { GET_SCRIPT_TAGS } from "../../graphql/queries/get-script-tags"
import { CREATE_SCRIPT_TAG } from "../../graphql/mutations/create-script-tag"
import { UPDATE_SCRIPT_TAG } from "../../graphql/mutations/update-script-tag"
import {
  productDataIsEmpty,
  productDataNeedsDelete,
  shopMetafieldIsEmpty,
} from "../../helpers/conditionals"
import { GET_CURRENT_SUBSCRIPTION } from "../../graphql/queries/get-current-subscription"
import { DELETE_CURRENT_SUBSCRIPTION } from "../../graphql/mutations/delete-current-subscription"
import { GET_PRODUCT_BY_HANDLE } from "../../graphql/queries/get-product-by-handle"
import { getSessionToken } from "@shopify/app-bridge-utils"
import axios from "axios"
import { Frame, Loading } from "@shopify/polaris"
import { camelObjToSnakeObj } from "../../helpers/conversions"

export const ShopProvider = (props) => {
  const { app } = props

  // Create axios instance for authenticated request
  const authAxios = axios.create()

  // Intercept all requests on this axios instance
  authAxios.interceptors.request.use(async (config) => {
    const token = await getSessionToken(app)
    // Append your request headers with an authenticated token
    config.headers["Authorization"] = `Bearer ${token}`
    return config
  })

  const upsertShop = async () => {
    if (!shopData || !shopData?.shop) return
    const billingAddress = shopData?.shop?.billingAddress
    const plan = shopData?.shop?.plan
    const privateMetafield = shopData?.shop?.privateMetafield
    const privateMetafieldValue = privateMetafield
      ? JSON.parse(privateMetafield.value)
      : ""
    const activeSubscriptions =
      currentSubscriptionData?.appInstallation?.activeSubscriptions
    const currentSubscription = activeSubscriptions?.[0]

    const data = {
      id: shopData?.shop?.id,
      name: shopData?.shop?.name,
      url: shopData?.shop?.url,
      email: shopData?.shop?.email,
      formatted_address: billingAddress?.formatted,
      plan_name: plan?.displayName,
      partner_development: plan?.partnerDevelopment,
      shopify_plus: plan?.shopifyPlus,
      onboarded: privateMetafieldValue?.onboarded,
      active_plan:
        currentSubscription?.status === "ACTIVE"
          ? currentSubscription?.name
          : "",
      fulfillment_service: privateMetafieldValue?.fulfillmentService,
      fulfillment_email: privateMetafieldValue?.fulfillmentEmail,
      fulfillment_phone: privateMetafieldValue?.fulfillmentPhone,
      fulfillment_manual: privateMetafieldValue?.fulfillmentManual,
      fulfillment_bearer_token: privateMetafieldValue?.fulfillmentBearerToken,
      fulfillment_refresh_token: privateMetafieldValue?.fulfillmentRefreshToken,
      custom_settings: camelObjToSnakeObj(privateMetafieldValue?.customSettings),
    }

    return await authAxios.post("/api/upsert-shop", data)
  }

  const getProductPrices = (productData) => {
    const productId = productData?.productByHandle?.id
    const prices = {
      first: "1.00",
      second: "5.00",
    }
    if (productId) {
      const { edges } = productData.productByHandle.variants
      const productVariantNodes = edges.map((edge) => edge.node)
      for (let i = 0; i < productVariantNodes.length; i++) {
        const node = productVariantNodes[i]
        console.log("Node", node)
        const { price } = node
        if (i === 0) {
          prices.first = price.toString()
        } else {
          prices.second = price.toString()
        }
      }
    }
    return prices
  }

  const [createTipProduct] = useMutation(CREATE_TIP_PRODUCT, {
    refetchQueries: ["getShopInfo", "getProductByHandle"],
  })

  const [deleteTipProduct] = useMutation(DELETE_TIP_PRODUCT, {
    refetchQueries: ["getShopInfo", "getProductByHandle"],
  })

  const [updateTipProductVariant] = useMutation(UPDATE_TIP_PRODUCT_VARIANT, {
    refetchQueries: ["getShopInfo", "getProductByHandle"],
  })


  let scriptTagDomain
  const scriptTagDomains = [
    "loop-chocolate.myshopify.com",
    "local-goods-dawn-staging.myshopify.com",
    "local-goods-ian-dev.myshopify.com",
    "local-goods-shane-dev.myshopify.com",
    "urban-edc-supply-staging.myshopify.com",
    "spotted-by-humphrey-staging.myshopify.com",
    "urban-edc-supply.myshopify.com",
    "spotted-by-humphrey.myshopify.com"
  ]

  const [createScriptTag] = useMutation(CREATE_SCRIPT_TAG)
  const [updateScriptTag] = useMutation(UPDATE_SCRIPT_TAG)

  const {
    data: scriptTagsData
  } = useQuery(GET_SCRIPT_TAGS)

  const {
    data: shopData,
    loading: shopDataLoading,
    error: shopDataError,
  } = useQuery(GET_SHOP_INFO, {
    onCompleted: async () => {
      if (shopMetafieldIsEmpty({ shopData, shopDataError })) {
        const privateMetafieldInput = {
          namespace: "heythanks",
          key: "shop",
          valueInput: {
            value: JSON.stringify({ onboarded: false }),
            valueType: "JSON_STRING"
          }
        }
        await upsertPrivateMetafield({
          variables: { input: privateMetafieldInput },
        })
      }
      await upsertShop()

      if (!scriptTagDomains.includes(shopData?.shop?.myshopifyDomain)) return

      console.log("You are on a script tag domain")
      const existingScriptTag = scriptTagsData?.scriptTags?.edges?.find(scriptTag => scriptTag.node.src.includes("widget.js"))?.node
      console.log('existingScriptTag', existingScriptTag)
      const scriptTagInput = {
        // eslint-disable-next-line no-undef
        src: `${HOST}/scripts/widget.js`,
        displayScope: "ALL"
      }
      if (!existingScriptTag) {
        await createScriptTag({
          variables: {
            input: scriptTagInput
          }
        })
      } else {
        await updateScriptTag({
          variables: {
            id: existingScriptTag.id,
            input: scriptTagInput
          }
        })
      }

    },
  })

  const [upsertPrivateMetafield] = useMutation(UPSERT_PRIVATE_METAFIELD, {
    refetchQueries: ["getShopInfo"],
  })

  const [deletePrivateMetafield] = useMutation(DELETE_PRIVATE_METAFIELD, {
    refetchQueries: ["getShopInfo"],
  })

  const [deleteCurrentSubscription] = useMutation(DELETE_CURRENT_SUBSCRIPTION, {
    refetchQueries: ["getCurrentSubscription"],
  })

  const { data: productData, loading: productDataLoading } = useQuery(
    GET_PRODUCT_BY_HANDLE,
    {
      variables: { handle: "fulfillment-tip" },
    }
  )

  const {
    data: currentSubscriptionData,
    loading: currentSubscriptionDataLoading,
  } = useQuery(GET_CURRENT_SUBSCRIPTION, {
    onCompleted: async () => {
      const firstPriceString = getProductPrices(productData).first || "1.00"
      const secondPriceString = getProductPrices(productData).second || "5.00"
      const activeSubscriptions =
        currentSubscriptionData?.appInstallation?.activeSubscriptions
      const currentSubscription = activeSubscriptions?.[0]
      const status = currentSubscription?.status
      const subscriptionIsDeactivated =
        !currentSubscription || status === "CANCELLED"
      if (productDataNeedsDelete({ subscriptionIsDeactivated, productData })) {
        const productDeleteInput = { id: productData.productByHandle.id }
        await deleteTipProduct({
          variables: { input: productDeleteInput },
        })
      } else if (productDataIsEmpty(productData)) {
        const productInput = {
          bodyHtml:
            "Tip that goes directly to the fulfillment workers of an order",
          title: "Fulfillment Tip",
          productType: "Tip",
          vendor: "HeyThanks",
          status: "ACTIVE",
          published: true,
          images: [
            {
              src:
                "https://storage.googleapis.com/heythanks-app-images/TipIcon.png",
              altText: "Tip Icon",
            },
          ],
          options: ["Option"], 
          variants: [
            { options: [`$${firstPriceString}`], price: firstPriceString },
            { options: [`$${secondPriceString}`], price: secondPriceString }
          ]
        }
        await createTipProduct({
          variables: { input: productInput }
        })
      }
      await upsertShop()
    },
  })

  const fetchCss = async ({ shop }) => {
    const cssResponse = await authAxios.get(
      `/api/get-css?shop=${shop}`
    )
    console.log(cssResponse)
    return cssResponse?.data
  }

  const fetchCartCounts = async ({ shop, startDate, endDate }) => {
    const cartCountsResponse = await authAxios.get(
      `/api/get-cart-counts?shop=${shop}&startDate=${startDate}&endDate=${endDate}`
    )
    return cartCountsResponse?.data
  }

  const fetchOrderRecords = async ({ shop, startDate, endDate }) => {
    const orderRecordsResponse = await authAxios.get(
      `/api/get-order-records?shop=${shop}&startDate=${startDate}&endDate=${endDate}`
    )
    return orderRecordsResponse?.data
  }

  if (shopDataLoading || currentSubscriptionDataLoading)
    return (
      <div style={{ height: "100px" }}>
        <Frame>
          <Loading></Loading>
        </Frame>
      </div>
    )

  let name, myshopifyDomain, fulfillmentServices, privateMetafield

  if (shopData?.shop) {

    ({
      name,
      myshopifyDomain,
      fulfillmentServices,
      privateMetafield,
    } = shopData.shop)

    scriptTagDomain = scriptTagDomains.includes(myshopifyDomain)

  } else {
    return (
      <div style={{ height: "100px" }}>
        <Frame>
          <Loading></Loading>
        </Frame>
      </div>
    )
  }

  const privateMetafieldValue = privateMetafield
    ? JSON.parse(privateMetafield.value)
    : ""
  const onboarded = privateMetafieldValue?.onboarded
  const fulfillmentManual = privateMetafieldValue?.fulfillmentManual
  const fulfillmentEmail = privateMetafieldValue?.fulfillmentEmail
  const fulfillmentPhone = privateMetafieldValue?.fulfillmentPhone
  const fulfillmentService = privateMetafieldValue?.fulfillmentService
  const fulfillmentBearerToken = privateMetafieldValue?.fulfillmentBearerToken
  const fulfillmentRefreshToken =
    privateMetafieldValue?.fulfillmentRefreshToken
  const activeSubscriptions =
    currentSubscriptionData?.appInstallation?.activeSubscriptions
  const currentSubscription = activeSubscriptions?.[0]
  const activePlanId = currentSubscription?.id
  const activePlan = currentSubscription?.name

  return (
    <ShopContext.Provider
      value={[
        {
          name,
          myshopifyDomain,
          fulfillmentServices,
          privateMetafieldValue,
          onboarded,
          fulfillmentManual,
          fulfillmentEmail,
          fulfillmentPhone,
          fulfillmentService,
          fulfillmentBearerToken,
          fulfillmentRefreshToken,
          activeSubscriptions,
          currentSubscription,
          activePlanId,
          activePlan,
          upsertShop,
          upsertPrivateMetafield,
          deletePrivateMetafield,
          createTipProduct,
          deleteTipProduct,
          updateTipProductVariant,
          currentSubscriptionData,
          currentSubscriptionDataLoading,
          deleteCurrentSubscription,
          productData,
          productDataLoading,
          getProductPrices,
          fetchCss,
          fetchCartCounts,
          fetchOrderRecords,
          scriptTagDomain
        },
      ]}
    >
      {props.children}
    </ShopContext.Provider>
  )
}
