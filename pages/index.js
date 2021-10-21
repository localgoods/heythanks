import { Page, Frame, Loading, Button } from "@shopify/polaris";
import StepsProgress from "../components/steps-progress/steps-progress";
import Welcome from "./welcome/welcome";
import Plan from "./plan/plan";
import Fulfillment from "./fulfillment/fulfillment";
import Completion from "./completion/completion";
import Admin from "./admin/admin";

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
    const privateMetafieldValue = privateMetafield?.value
      ? JSON.parse(privateMetafield.value)
      : undefined;
    const onboarded = privateMetafieldValue?.onboarded;
    const fulfillmentService = privateMetafieldValue?.fulfillmentService;
    const fulfillmentEmail = privateMetafieldValue?.fulfillmentEmail;
    const fulfillmentPhone = privateMetafieldValue?.fulfillmentPhone;
    const fulfillmentManual = privateMetafieldValue?.fulfillmentManual;

    const activeSubscriptions =
      currentSubscriptionData?.appInstallation?.activeSubscriptions;
    const currentSubscription = activeSubscriptions
      ? activeSubscriptions[0]
      : undefined;
    const activePlan = currentSubscription?.name;

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

    const response = await authAxios.post("/api/upsert-shop", data);
    console.log(response);
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

  const [deleteTipProduct] = useMutation(DELETE_TIP_PRODUCT, {
    refetchQueries: ["getProductByHandle"],
  });

  const {
    data: shopData,
    loading: shopDataLoading,
    error: shopDataError,
  } = useQuery(GET_SHOP_INFO, {
    onCompleted: async () => {
      if (
        shopData?.shop &&
        !shopDataError &&
        !shopData?.shop?.privateMetafield
      ) {
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
      if (currentSubscriptionData?.appInstallation?.activeSubscriptions) {
        const activeSubscriptions =
          currentSubscriptionData?.appInstallation?.activeSubscriptions;
        const currentSubscription = activeSubscriptions
          ? activeSubscriptions[0]
          : undefined;
        const status = currentSubscription?.status;
        if (!currentSubscription || status === "CANCELLED") {
          await deleteTipProduct();
        }
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

  const privateMetafieldValue = privateMetafield?.value
    ? JSON.parse(privateMetafield.value)
    : undefined;
  const onboarded = privateMetafieldValue?.onboarded;
  const fulfillmentManual = privateMetafieldValue?.fulfillmentManual;
  const fulfillmentEmail = privateMetafieldValue?.fulfillmentEmail;
  const fulfillmentPhone = privateMetafieldValue?.fulfillmentPhone;
  const fulfillmentService = privateMetafieldValue?.fulfillmentService;

  const activeSubscriptions =
    currentSubscriptionData?.appInstallation?.activeSubscriptions;
  const currentSubscription = activeSubscriptions
    ? activeSubscriptions[0]
    : undefined;
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
                privateMetafieldValue={privateMetafieldValue}
                myshopifyDomain={myshopifyDomain}
                fulfillmentManual={fulfillmentManual}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                disableButtons={disableButtons}
                setDisableButtons={setDisableButtons}
              ></Plan>
            )}
            {currentStep === 3 && (
              <Tips
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
      </div>
    );
  } else {
    return (
      <Admin
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
      ></Admin>
    );
  }
};

export default Index;
