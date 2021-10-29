import { useQuery } from "@apollo/client";
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
import { GET_ORDERS } from "../../graphql/queries/get-orders";
import styles from "./metrics.module.css";

export const getLocalIsoString = (date) => {
  const datetime = getDateTime(date);
  const timezone = getTimezone(date);
  return datetime + timezone;
};

const getDateTime = (date) => {
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  day = day < 10 ? "0" + day : day;
  month = month < 10 ? "0" + month : month;
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return (
    year + "-" + month + "-" + day + "T" + hours + ":" + minutes + ":" + seconds
  );
};

const getTimezone = (date) => {
  const timezoneOffsetMinutes = date.getTimezoneOffset();
  const timezoneOffsetHours = Math.abs(
    timezoneOffsetMinutes / 60
  );
  let offsetHours = parseInt(timezoneOffsetHours);
  let offsetMinutes = Math.abs(timezoneOffsetMinutes % 60);

  if (offsetHours < 10) offsetHours = "0" + offsetHours;

  if (offsetMinutes < 10) offsetMinutes = "0" + offsetMinutes;

  if (timezoneOffsetMinutes < 0) return "+" + offsetHours + ":" + offsetMinutes;
  else if (timezoneOffsetMinutes > 0)
    return "-" + offsetHours + ":" + offsetMinutes;
  else return "Z";
};

const Metrics = (props) => {
  const date = new Date();
  const end = new Date(date);
  const endMonth = end.getMonth();
  const endYear = end.getFullYear();
  const start = new Date(date.setMonth(endMonth - 1));
  const startMonth = start.getMonth();
  const startYear = start.getFullYear();

  // Todo: why is this undefined?? do we need to pass in the query? do we need more scopes?
  
  const [{ month, year }, setDate] = useState({
    month: startMonth,
    year: startYear,
  });

  const [selectedDates, setSelectedDates] = useState({
    start,
    end,
  });

  const startDate = getLocalIsoString(selectedDates.start);
  const endDate = getLocalIsoString(selectedDates.end);
  const query = `created_at:>${startDate} AND created_at:<${endDate}`;

  const { data: ordersData, loading: ordersLoading } = useQuery(GET_ORDERS, { variables: { query } });
  console.log('query on setup: ', query);

  const handleChange = useCallback(
    async ({ start, end }) => {
      setSelectedDates({ start, end });
    }, []
  );

  const handleMonthChange = useCallback(
    (month, year) => {
      console.log(month, year);
      setDate({ month, year })
    },
    []
  );

  console.log(ordersData);

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
                  onChange={handleChange}
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
