import { useQuery } from "@apollo/client";
import {
  Card,
  DatePicker,
  DisplayText,
  Heading,
  Layout,
  TextContainer,
} from "@shopify/polaris";
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
  const { activePlanId } = props;

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
  // Set to end of day to include all data for the day
  const endDate = getLocalIsoString(new Date(selectedDates.end.setHours(23, 59, 59, 999)));
  const query = `created_at:>${startDate} AND created_at:<${endDate}`;

  const { data: ordersData, loading: ordersDataLoading } = useQuery(GET_ORDERS, { variables: { query }, onError: (error) => console.log(error) });

  const handleChange = useCallback(
    async ({ start, end }) => {
      setSelectedDates({ start, end });
    }, []
  );

  const handleMonthChange = useCallback(
    (month, year) => {
      setDate({ month, year })
    },
    []
  );

  const orders = ordersData?.orders?.edges?.length ? ordersData.orders.edges.map(edge => {
    const order = edge.node;
    const { id, name, createdAt } = order;
    const lineItems = order.lineItems.edges.map(edge => {
      const lineItem = edge.node;
      const { title, quantity, originalUnitPrice } = lineItem;
      const price = originalUnitPrice;
      const cost = quantity * parseFloat(price);
      return {
        title,
        quantity,
        price,
        cost
      }
    });
    return {
      id,
      name,
      createdAt,
      lineItems
    }
  }) : [];

  const totalAmount = orders.reduce((acc, curr) => {
    return acc + curr.lineItems.reduce((acc, curr) => {
      return acc + curr.cost;
    }, 0);
  }, 0);

  const totalTipsAmount = orders.reduce((acc, curr) => {
    return acc + curr.lineItems.reduce((acc, curr) => {
      return curr.title.includes("Fulfillment Tip") ? acc + curr.cost : acc;
    }, 0);
  }, 0);

  const totalTipsCount = orders.reduce((acc, curr) => {
    return acc + curr.lineItems.reduce((acc, curr) => {
      return curr.title.includes("Fulfillment Tip") ? acc + 1 : acc;
    }, 0);
  }, 0);

  console.log(totalAmount, totalTipsAmount, totalTipsCount);

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
                <p>${parseFloat(totalTipsAmount).toFixed(2)}</p>
              </TextContainer>
            </Card.Section>
          </Card>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Card sectioned>
            <Card.Section>
              <TextContainer>
                <Heading>Count of tip orders for selected period</Heading>
                <p>{totalTipsAmount} order{totalTipsAmount === 1 ? '' : 's'}</p>
              </TextContainer>
            </Card.Section>
          </Card>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Card sectioned>
            <Card.Section>
              <TextContainer>
                <Heading>AOV of orders with tips for selected period</Heading>
                <p>${parseFloat(totalAmount).toFixed(2)}</p>
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
      </Layout>
    </TextContainer>
  );
};

export default Metrics;
