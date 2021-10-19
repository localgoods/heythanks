import {
  Button,
  Card,
  Checkbox,
  DataTable,
  DatePicker,
  DisplayText,
  Frame,
  Heading,
  Layout,
  Link,
  Loading,
  Page,
  Stack,
  Tabs,
  TextContainer,
  TextField,
} from "@shopify/polaris";
import styles from "./admin.module.css";

import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_TIP_PRODUCT } from "../../graphql/mutations/create-tip-product";
import { UPDATE_TIP_PRODUCT_VARIANT } from "../../graphql/mutations/update-tip-product-variant";
import { GET_PRODUCT_BY_HANDLE } from "../../graphql/queries/get-product-by-handle";
import Plan from "../plan/plan";

const Admin = (props) => {
  const {
    currentPlan,
    myshopifyDomain,
    manualFulfillment,
    setManualFulfillment,
    fulfillmentServices,
    disableButtons,
    setDisableButtons,
  } = props;

  const [firstPrice, setFirstPrice] = useState("1");
  const [secondPrice, setSecondPrice] = useState("5");

  const [createTipProduct] = useMutation(CREATE_TIP_PRODUCT, {
    refetchQueries: ["getProductByHandle"],
  });
  const [updateTipProductVariant] = useMutation(UPDATE_TIP_PRODUCT_VARIANT, {
    refetchQueries: ["getProductByHandle"],
  });
  const { data: existingProductData, loading, error } = useQuery(
    GET_PRODUCT_BY_HANDLE,
    {
      variables: { handle: "fulfillment-tip" },
      onCompleted: (newProductData) => {
        const productId = newProductData?.productByHandle?.id;
        if (productId) {
          const { edges } = newProductData.productByHandle.variants;
          const productVariantNodes = edges.map((edge) => edge.node);
          for (let i = 0; i < productVariantNodes.length; i++) {
            const node = productVariantNodes[i];
            const { price } = node;
            let priceString = price.toString();
            if (priceString.includes(".00")) {
              priceString = priceString.replace(".00", "");
            }
            if (i === 0) {
              setFirstPrice(priceString);
            } else {
              setSecondPrice(priceString);
            }
          }
        }
      },
    }
  );

  const app = useAppBridge();
  const redirect = Redirect.create(app);

  let template = "cart";
  let uuid = "dd482a24-5a49-411f-bf18-24079033010b";
  let handle = "app-block";
  let link = `https://${myshopifyDomain}/admin/themes/current/editor?&template=${template}&activateAppId=${uuid}/${handle}`;

  useEffect(() => {
    const guessManualFulfillment =
      fulfillmentServices.length === 1 &&
      fulfillmentServices.find((service) => service.serviceName === "Manual");
    setManualFulfillment(guessManualFulfillment);
  }, []);

  const [manualConfirmed, setManualConfirmed] = useState(manualFulfillment);

  const getFulfillmentService = () => {
    return fulfillmentServices.find(
      (fulfillmentService) => fulfillmentService.type !== "MANUAL"
    );
  };

  const [fulfillmentService, setFulfillmentService] = useState(
    getFulfillmentService()
  );

  const [fulfillmentServiceName, setFulfillmentServiceName] = useState(
    fulfillmentService?.serviceName || ""
  );
  const [fulfillmentServicePhone, setFulfillmentServicePhone] = useState(
    fulfillmentService?.location?.address.phone || ""
  );
  const [fulfillmentServiceEmail, setFulfillmentServiceEmail] = useState("");

  const [selected, setSelected] = useState(0);

  const [{ month, year }, setDate] = useState({ month: 1, year: 2018 });
  const [selectedDates, setSelectedDates] = useState({
    start: new Date("Wed Feb 07 2018 00:00:00 GMT-0500 (EST)"),
    end: new Date("Mon Mar 12 2018 00:00:00 GMT-0500 (EST)"),
  });

  const handleMonthChange = useCallback(
    (month, year) => setDate({ month, year }),
    []
  );

  useEffect(() => {
    setManualFulfillment(manualConfirmed);
  }, [manualConfirmed]);

  const tabs = [
    {
      id: "settings-1",
      content: "Settings",
    },
    {
      id: "metrics-1",
      content: "Metrics",
    },
    {
      id: "plan-1",
      content: "Plan",
    },
    {
      id: "support-1",
      content: "Support",
    },
  ];

  if (loading)
    return (
      <div style={{ height: "100px" }}>
        <Frame>
          <Loading />
        </Frame>
      </div>
    );

  if (error)
    return (
      <div style={{ height: "100px" }}>
        <Frame>
          <p>`Error! ${error.message}`</p>
        </Frame>
      </div>
    );

  return (
    <div>
      <header className={styles.tabs__wrapper}>
        <Tabs tabs={tabs} selected={selected} onSelect={setSelected}></Tabs>
      </header>
      {tabs[selected].content === "Settings" && (
        <div className={styles.page__wrapper}>
          <Page>
            <TextContainer>
              <DisplayText size="large">Settings</DisplayText>
              <DisplayText size="small">
                Edit the price options for your tips, edit the look in the theme
                editor, and configure fulfillment settings.
              </DisplayText>
              <Layout>
                <Layout.Section>
                  <Card sectioned>
                    <Card.Section>
                      <TextContainer>
                        <Heading>Change your tip options</Heading>
                        <TextContainer>
                          <TextField
                            label="Tip option 1"
                            type="number"
                            value={firstPrice}
                            onChange={setFirstPrice}
                            prefix="$"
                            autoComplete="off"
                            helpText="This should be the smallest tip amount"
                          />
                          <TextField
                            label="Tip option 2"
                            type="number"
                            value={secondPrice}
                            onChange={setSecondPrice}
                            prefix="$"
                            autoComplete="off"
                            helpText="This should be the largest tip amount"
                          />
                        </TextContainer>
                        <Button
                          disabled={disableButtons}
                          size="large"
                          primary
                          onClick={async () => {
                            setDisableButtons(true);
                            const productId =
                              existingProductData.productByHandle?.id;
                            if (productId) {
                              const {
                                edges,
                              } = existingProductData.productByHandle.variants;
                              const productVariantNodes = edges.map(
                                (edge) => edge.node
                              );
                              for (
                                let i = 0;
                                i < productVariantNodes.length;
                                i++
                              ) {
                                const node = productVariantNodes[i];
                                const { id } = node;
                                const price =
                                  i === 0 ? firstPrice : secondPrice;
                                const productVariantInput = { id, price };
                                await updateTipProductVariant({
                                  variables: { input: productVariantInput },
                                });
                              }
                            } else {
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
                                  { options: ["1"], price: firstPrice },
                                  { options: ["2"], price: secondPrice },
                                ],
                                options: ["Option"],
                              };
                              await createTipProduct({
                                variables: { input: productInput },
                              });
                            }
                            setDisableButtons(false);
                          }}
                        >
                          Save changes
                        </Button>
                      </TextContainer>
                    </Card.Section>
                  </Card>
                </Layout.Section>
                <Layout.Section>
                  <Card sectioned>
                    <Card.Section>
                      <TextContainer>
                        <Heading>Change tipping module UI</Heading>
                        <p>
                          Edit the colors and other elements of how the in-cart
                          tipping module looks using the theme editor.
                        </p>
                        <Button
                          size="large"
                          primary
                          onClick={() =>
                            redirect.dispatch(Redirect.Action.REMOTE, link)
                          }
                        >
                          Launch theme editor
                        </Button>
                      </TextContainer>
                    </Card.Section>
                  </Card>
                </Layout.Section>
                <Layout.Section>
                  <Card sectioned>
                    <Card.Section>
                      <TextContainer>
                        <Heading>Change your fulfillment information</Heading>
                        <Checkbox
                          label="I only fulfill orders myself"
                          checked={manualConfirmed}
                          onChange={setManualConfirmed}
                          helpText={
                            <Link url="" external>
                              What does this mean?
                            </Link>
                          }
                        />
                        <TextContainer>
                          <TextField
                            label="Fulfillment partner name"
                            value={fulfillmentServiceName}
                            onChange={setFulfillmentServiceName}
                            autoComplete="off"
                            disabled={manualConfirmed}
                          />
                          <TextField
                            label="Fulfillment partner phone number"
                            value={fulfillmentServicePhone}
                            onChange={setFulfillmentServicePhone}
                            autoComplete="off"
                            disabled={manualConfirmed}
                          />
                          <TextField
                            type="email"
                            label="Fulfillment partner email address"
                            value={fulfillmentServiceEmail}
                            onChange={setFulfillmentServiceEmail}
                            autoComplete="off"
                            disabled={manualConfirmed}
                          />
                        </TextContainer>
                        <Button
                          size="large"
                          primary
                          onClick={() => {
                            console.log(manualFulfillment);
                          }}
                        >
                          Save changes
                        </Button>
                      </TextContainer>
                    </Card.Section>
                  </Card>
                </Layout.Section>
              </Layout>
            </TextContainer>
          </Page>
        </div>
      )}
      {tabs[selected].content === "Metrics" && (
        <div className={styles.page__wrapper}>
          <Page>
            <TextContainer>
              <DisplayText size="large">Metrics</DisplayText>
              <DisplayText size="small">
                See how much love your brand is generating.
              </DisplayText>
              <Layout>
                <Layout.Section>
                  <Card sectioned>
                    <Card.Section>
                      <TextContainer>
                        <Heading>Select metrics date range</Heading>
                        <DatePicker
                          month={month}
                          year={year}
                          onChange={setSelectedDates}
                          onMonthChange={handleMonthChange}
                          selected={selectedDates}
                          multiMonth
                          allowRange
                        />
                      </TextContainer>
                    </Card.Section>
                  </Card>
                </Layout.Section>
              </Layout>
              <Layout>
                <Layout.Section oneHalf>
                  <Card sectioned>
                    <Card.Section>
                      <TextContainer>
                        <Heading>Sum of tips for selected period</Heading>
                        <p>$500.00</p>
                      </TextContainer>
                    </Card.Section>
                  </Card>
                </Layout.Section>
                <Layout.Section oneHalf>
                  <Card sectioned>
                    <Card.Section>
                      <TextContainer>
                        <Heading>
                          Count of tip orders for selected period
                        </Heading>
                        <p>100 orders</p>
                      </TextContainer>
                    </Card.Section>
                  </Card>
                </Layout.Section>
                <Layout.Section oneHalf>
                  <Card sectioned>
                    <Card.Section>
                      <TextContainer>
                        <Heading>AOV of orders with tips</Heading>
                        <p>$65.00</p>
                      </TextContainer>
                    </Card.Section>
                  </Card>
                </Layout.Section>
                <Layout.Section oneHalf>
                  <Card sectioned>
                    <Card.Section>
                      <TextContainer>
                        <Heading>Cart CVR for orders with tips</Heading>
                        <p>90%</p>
                      </TextContainer>
                    </Card.Section>
                  </Card>
                </Layout.Section>
                <Layout.Section>
                  <Card sectioned>
                    <Card.Section>
                      <TextContainer>
                        <Heading>Recent orders</Heading>
                        <DataTable
                          columnContentTypes={[
                            "text",
                            "numeric",
                            "numeric",
                            "numeric",
                            "numeric",
                          ]}
                          headings={[
                            "Product",
                            "Price",
                            "SKU Number",
                            "Net quantity",
                            "Net sales",
                          ]}
                          rows={[
                            [
                              "Emerald Silk Gown",
                              "$875.00",
                              124689,
                              140,
                              "$122,500.00",
                            ],
                            [
                              "Mauve Cashmere Scarf",
                              "$230.00",
                              124533,
                              83,
                              "$19,090.00",
                            ],
                            [
                              "Navy Merino Wool Blazer with khaki chinos and yellow belt",
                              "$445.00",
                              124518,
                              32,
                              "$14,240.00",
                            ],
                          ]}
                          totals={["", "", "", 255, "$155,830.00"]}
                        />
                        <Button size="large" primary>
                          Download CSV
                        </Button>
                      </TextContainer>
                    </Card.Section>
                  </Card>
                </Layout.Section>
              </Layout>
            </TextContainer>
          </Page>
        </div>
      )}
      {tabs[selected].content === "Plan" && (
        <div className={styles.page__wrapper}>
          <Plan
            currentPlan={currentPlan}
            myshopifyDomain={myshopifyDomain}
            manualFulfillment={manualFulfillment}
            disableButtons={disableButtons}
            setDisableButtons={setDisableButtons}
          ></Plan>
        </div>
      )}
      {tabs[selected].content === "Support" && (
        <div className={styles.page__wrapper}>
          <Page>
            <TextContainer>
              <DisplayText size="large">Support</DisplayText>
              <DisplayText size="small">
                Send us a message, or view answers to common questions.
              </DisplayText>
              <Layout>
                <Layout.Section>
                  <Card sectioned>
                    <Card.Section>
                      <TextContainer>
                        <Heading>Contact support</Heading>
                        <span>Need help? Please send a message to </span>
                        <Link url="" external>
                          support@heythanks.io
                        </Link>
                      </TextContainer>
                    </Card.Section>
                  </Card>
                </Layout.Section>
                <Layout.Section>
                  <Card sectioned>
                    <Card.Section>
                      <TextContainer>
                        <Heading>Read our FAQs</Heading>
                        <span>
                          We've compiled answers to some common questions. View
                          our{" "}
                        </span>
                        <Link url="" external>
                          FAQs
                        </Link>
                      </TextContainer>
                    </Card.Section>
                  </Card>
                </Layout.Section>
              </Layout>
            </TextContainer>
          </Page>
        </div>
      )}
    </div>
  );
};

export default Admin;
