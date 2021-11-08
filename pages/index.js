import { Page, Frame, Loading, Button } from "@shopify/polaris";
import StepsProgress from "../components/steps-progress/steps-progress";
import Welcome from "./welcome/welcome";
import Plan from "./plan/plan";
import Fulfillment from "./fulfillment/fulfillment";
import Completion from "./completion/completion";
import Admin from "../layouts/admin/admin";

import React, { useEffect, useState } from "react";
import styles from "./index.module.css";

import { useMutation, useQuery } from "@apollo/client";

import { GET_SHOP_INFO } from "../graphql/queries/get-shop-info";
import Tips from "./tips/tips";
import { UPSERT_PRIVATE_METAFIELD } from "../graphql/mutations/upsert-private-metafield";
import { DELETE_PRIVATE_METAFIELD } from "../graphql/mutations/delete-private-metafield";
import { GET_CURRENT_SUBSCRIPTION } from "../graphql/queries/get-current-subscription";
import { GET_PRODUCT_BY_HANDLE } from "../graphql/queries/get-product-by-handle";
import { DELETE_TIP_PRODUCT } from "../graphql/mutations/delete-tip-product";
import { CREATE_TIP_PRODUCT } from "../graphql/mutations/create-tip-product";
import { DELETE_CURRENT_SUBSCRIPTION } from "../graphql/mutations/delete-current-subscription";
import {
  productDataIsEmpty,
  productDataNeedsDelete,
  shopMetafieldIsEmpty,
} from "../helpers/conditionals";

const steps = [
  "Confirm fulfillment",
  "Pick plan",
  "Set tips",
  "Update storefront",
];

const Index = (props) => {
  const upsertShop = async () => {
    if (!shopData || !shopData?.shop) return;
    const id = shopData?.shop?.id;
    const name = shopData?.shop?.name;
    const url = shopData?.shop?.url;
    const email = shopData?.shop?.email;
    const billingAddress = shopData?.shop?.billingAddress;
    const plan = shopData?.shop?.plan;
    const privateMetafield = shopData?.shop?.privateMetafield;
    const formattedAddress = billingAddress?.formatted;
    const planName = plan?.displayName;
    const partnerDevelopment = plan?.partnerDevelopment;
    const shopifyPlus = plan?.shopifyPlus;
    const privateMetafieldValue = privateMetafield ? JSON.parse(privateMetafield.value) : "";
    const onboarded = privateMetafieldValue?.onboarded;
    const fulfillmentService = privateMetafieldValue?.fulfillmentService;
    const fulfillmentEmail = privateMetafieldValue?.fulfillmentEmail;
    const fulfillmentPhone = privateMetafieldValue?.fulfillmentPhone;
    const fulfillmentManual = privateMetafieldValue?.fulfillmentManual;

    const activeSubscriptions =
      currentSubscriptionData?.appInstallation?.activeSubscriptions;
    const currentSubscription = activeSubscriptions?.[0];
    const activePlan =
      currentSubscription?.status === "ACTIVE" ? currentSubscription?.name : "";

    const data = {
      id,
      name,
      url,
      email,
      formatted_address: formattedAddress,
      plan_name: planName,
      partner_development: partnerDevelopment,
      shopify_plus: shopifyPlus,
      onboarded,
      active_plan: activePlan,
      fulfillment_service: fulfillmentService,
      fulfillment_email: fulfillmentEmail,
      fulfillment_phone: fulfillmentPhone,
      fulfillment_manual: fulfillmentManual,
    };
    return await authAxios.post("/api/upsert-shop", data);
  };

  const { authAxios } = props;
  const [currentStep, setCurrentStep] = useState(0);
  const [disableButtons, setDisableButtons] = useState(false);

  const [deletePrivateMetafield] = useMutation(DELETE_PRIVATE_METAFIELD, {
    refetchQueries: ["getShopInfo"],
  });

  const [upsertPrivateMetafield] = useMutation(UPSERT_PRIVATE_METAFIELD, {
    refetchQueries: ["getShopInfo"],
  });

  const [createTipProduct] = useMutation(CREATE_TIP_PRODUCT, {
    refetchQueries: ["getProductByHandle"],
  });

  const [deleteTipProduct] = useMutation(DELETE_TIP_PRODUCT, {
    refetchQueries: ["getProductByHandle"],
  });

  const [deleteCurrentSubscription] = useMutation(DELETE_CURRENT_SUBSCRIPTION, {
    refetchQueries: ["getCurrentSubscription"],
  });

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
            valueType: "JSON_STRING",
          },
        };
        await upsertPrivateMetafield({
          variables: { input: privateMetafieldInput },
        });
      }
      await upsertShop();
    },
  });

  const { data: productData, loading: productDataLoading } = useQuery(
    GET_PRODUCT_BY_HANDLE,
    {
      variables: { handle: "fulfillment-tip" },
    }
  );

  const {
    data: currentSubscriptionData,
    loading: currentSubscriptionDataLoading,
    error: currentSubscriptionDataError,
  } = useQuery(GET_CURRENT_SUBSCRIPTION, {
    onCompleted: async () => {
      const activeSubscriptions =
        currentSubscriptionData?.appInstallation?.activeSubscriptions;
      const currentSubscription = activeSubscriptions?.[0];
      const status = currentSubscription?.status;
      const subscriptionIsDeactivated =
        !currentSubscription || status === "CANCELLED";
      if (productDataNeedsDelete({ subscriptionIsDeactivated, productData })) {
        const productDeleteInput = { id: productData.productByHandle.id };
        await deleteTipProduct({
          variables: { input: productDeleteInput },
        });
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
          variants: [
            { options: ["1"], price: "1" },
            { options: ["2"], price: "5" },
          ],
          options: ["Option"],
        };
        await createTipProduct({
          variables: { input: productInput },
        });
      }
      await upsertShop();
    },
  });

  useEffect(() => {
    const searchItems = location.search.split("?")[1]?.split("&");
    const chargeId = searchItems
      .find((item) => item.split("=")[0] === "charge_id")
      ?.split("=")[1];
    if (chargeId && currentStep !== 3) setCurrentStep(3);
  }, []);

  if (shopDataLoading || currentSubscriptionDataLoading)
    return (
      <div style={{ height: "100px" }}>
        <Frame>
          <Loading></Loading>
        </Frame>
      </div>
    );

  if (shopDataError || currentSubscriptionDataError)
    return (
      <div style={{ height: "100px" }}>
        <Frame>
          <p>
            `Error! $
            {shopDataError?.message || currentSubscriptionDataError?.message}`
          </p>
        </Frame>
      </div>
    );

  const {
    name,
    myshopifyDomain,
    fulfillmentServices,
    privateMetafield,
  } = shopData.shop;

  const privateMetafieldValue = privateMetafield ? JSON.parse(privateMetafield.value) : "";
  const onboarded = privateMetafieldValue?.onboarded;
  const fulfillmentManual = privateMetafieldValue?.fulfillmentManual;
  const fulfillmentEmail = privateMetafieldValue?.fulfillmentEmail;
  const fulfillmentPhone = privateMetafieldValue?.fulfillmentPhone;
  const fulfillmentService = privateMetafieldValue?.fulfillmentService;
  const activeSubscriptions =
    currentSubscriptionData?.appInstallation?.activeSubscriptions;
  const currentSubscription = activeSubscriptions?.[0];
  const activePlanId = currentSubscription?.id;
  const activePlan = currentSubscription?.name;

  if (!onboarded) {
    return (
      <div>
        {currentStep > 0 && (
          <header className={styles.progress__header}>
            <StepsProgress
              currentStep={currentStep - 1}
              steps={steps}
            ></StepsProgress>
          </header>
        )}
        <div
          className={
            currentStep !== 0 ? styles.step__wrapper : styles.welcome__wrapper
          }
        >
          <Page
            breadcrumbs={
              currentStep !== 0
                ? [{ onAction: () => setCurrentStep(currentStep - 1) }]
                : ""
            }
            title={currentStep !== 0 ? `Step ${currentStep}` : ""}
          >
            {currentStep === 0 && (
              <Welcome
                name={name}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
              ></Welcome>
            )}
            {currentStep === 1 && (
              <Fulfillment
                privateMetafieldValue={privateMetafieldValue}
                upsertPrivateMetafield={upsertPrivateMetafield}
                fulfillmentServices={fulfillmentServices}
                fulfillmentManual={fulfillmentManual}
                fulfillmentService={fulfillmentService}
                fulfillmentPhone={fulfillmentPhone}
                fulfillmentEmail={fulfillmentEmail}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                disableButtons={disableButtons}
                setDisableButtons={setDisableButtons}
              ></Fulfillment>
            )}
            {currentStep === 2 && (
              <Plan
                onboarded={onboarded}
                activePlan={activePlan}
                activePlanId={activePlanId}
                privateMetafieldValue={privateMetafieldValue}
                myshopifyDomain={myshopifyDomain}
                fulfillmentManual={fulfillmentManual}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                disableButtons={disableButtons}
                setDisableButtons={setDisableButtons}
                deleteCurrentSubscription={deleteCurrentSubscription}
              ></Plan>
            )}
            {currentStep === 3 && (
              <Tips
                activePlan={activePlan}
                productData={productData}
                productDataLoading={productDataLoading}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                disableButtons={disableButtons}
                setDisableButtons={setDisableButtons}
              ></Tips>
            )}
            {currentStep === 4 && (
              <Completion
                privateMetafieldValue={privateMetafieldValue}
                upsertPrivateMetafield={upsertPrivateMetafield}
                myshopifyDomain={myshopifyDomain}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                disableButtons={disableButtons}
                setDisableButtons={setDisableButtons}
              ></Completion>
            )}
          </Page>
        </div>
        {process.env.NODE_ENV !== "production" && (
          <Button
            onClick={() => {
              const privateMetafieldInput = {
                namespace: "heythanks",
                key: "shop",
              };
              deletePrivateMetafield({
                variables: { input: privateMetafieldInput },
              });
            }}
          >
            Reset metafield
          </Button>
        )}
      </div>
    );
  } else {
    return (
      <Admin
        authAxios={authAxios}
        activePlanId={activePlanId}
        privateMetafieldValue={privateMetafieldValue}
        upsertPrivateMetafield={upsertPrivateMetafield}
        productData={productData}
        productDataLoading={productDataLoading}
        onboarded={onboarded}
        activePlan={activePlan}
        myshopifyDomain={myshopifyDomain}
        fulfillmentManual={fulfillmentManual}
        fulfillmentService={fulfillmentService}
        fulfillmentPhone={fulfillmentPhone}
        fulfillmentEmail={fulfillmentEmail}
        fulfillmentServices={fulfillmentServices}
        disableButtons={disableButtons}
        setDisableButtons={setDisableButtons}
        deletePrivateMetafield={deletePrivateMetafield}
        deleteCurrentSubscription={deleteCurrentSubscription}
      ></Admin>
    );
  }
};

export default Index;
