import {
  Button,
  Card,
  DataTable,
  DatePicker,
  DisplayText,
  Heading,
  Layout,
  TextContainer,
} from "@shopify/polaris";
import { ExportMinor } from "@shopify/polaris-icons";
import { useCallback, useState } from "react";
import styles from "./metrics.module.css";

const Metrics = (props) => {
  const date = new Date();
  const end = new Date(date);
  const endMonth = end.getMonth();
  const endYear = end.getFullYear();
  const start = new Date(date.setMonth(endMonth - 1));
  const startMonth = start.getMonth();
  const startYear = start.getFullYear();

  const [{ month, year }, setDate] = useState({
    month: startMonth,
    year: startYear,
  });
  const [selectedDates, setSelectedDates] = useState({
    start,
    end,
  });

  const handleMonthChange = useCallback(
    (month, year) => setDate({ month, year }),
    []
  );

  return (
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
                <Heading>Select metrics period</Heading>
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
                <Heading>Count of tip orders for selected period</Heading>
                <p>100 orders</p>
              </TextContainer>
            </Card.Section>
          </Card>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Card sectioned>
            <Card.Section>
              <TextContainer>
                <Heading>AOV of orders with tips for selected period</Heading>
                <p>$65.00</p>
              </TextContainer>
            </Card.Section>
          </Card>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Card sectioned>
            <Card.Section>
              <TextContainer>
                <Heading>
                  Cart CVR for orders with tips for selected period
                </Heading>
                <p>90%</p>
              </TextContainer>
            </Card.Section>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card sectioned>
            <Card.Section>
              <TextContainer>
                <Heading>Orders for selected period</Heading>
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
                <Button icon={ExportMinor} size="large" primary>
                  Export CSV
                </Button>
              </TextContainer>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </TextContainer>
  );
};

export default Metrics;
