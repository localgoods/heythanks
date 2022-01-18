import { useQuery } from "@apollo/client";
import {
  Card,
  DatePicker,
  DisplayText,
  Heading,
  Layout,
  TextContainer,
  TextStyle,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import { useShop } from "../../../state/shop/context";

import styles from "./metrics.module.css";

export const getFormattedDate = (dateString) => {
  const date = new Date(dateString);
  let year = date.getFullYear();
  let month = (1 + date.getMonth()).toString().padStart(2, "0");
  let day = date.getDate().toString().padStart(2, "0");

  return month + "/" + day + "/" + year;
};

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
  const timezoneOffsetHours = Math.abs(timezoneOffsetMinutes / 60);
  let offsetHours = parseInt(timezoneOffsetHours);
  let offsetMinutes = Math.abs(timezoneOffsetMinutes % 60);

  if (offsetHours < 10) offsetHours = "0" + offsetHours;

  if (offsetMinutes < 10) offsetMinutes = "0" + offsetMinutes;

  if (timezoneOffsetMinutes < 0) return "+" + offsetHours + ":" + offsetMinutes;
  else if (timezoneOffsetMinutes > 0)
    return "-" + offsetHours + ":" + offsetMinutes;
  else return "Z";
};

const Metrics = () => {
  const [{ fetchCartCounts, fetchOrderRecords, myshopifyDomain }] = useShop();

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

  const [cartCounts, setCartCounts] = useState([]);
  const [orderRecords, setOrderRecords] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalTipsAmount, setTotalTipsAmount] = useState(0);
  const [totalTipsCount, setTotalTipsCount] = useState(0);
  const [totalTipsToCartsCount, setTotalTipsToCartsCount] = useState(0);

  useEffect(() => {
    const totalAmount = orderRecords?.reduce(
      (acc, order) =>
        acc +
        order?.details?.line_items?.reduce(
          (acc, lineItem) =>
            acc + parseFloat(lineItem?.price) * lineItem?.quantity,
          0
        ),
      0
    );
    const totalTipsAmount = orderRecords?.reduce(
      (acc, record) => acc + parseFloat(record.price),
      0
    );
    const totalTipsCount = orderRecords?.filter(
      (record) => Math.sign(parseFloat(record.price)) === 1
    ).length;

    const totalCartsCount = cartCounts?.reduce(
      (acc, cartCount) => acc + cartCount.count,
      0
    );

    const totalTipsToCartsCount =
      totalCartsCount > 0 ? totalTipsCount / totalCartsCount : 0;
    setTotalAmount(totalAmount);
    setTotalTipsAmount(totalTipsAmount);
    setTotalTipsCount(totalTipsCount);
    setTotalTipsToCartsCount(totalTipsToCartsCount);
  }, [cartCounts, orderRecords]);

  const startDate = selectedDates.start.toISOString();
  // Set to end of day to include all data for the day
  const endDate = new Date(
    selectedDates.end.setHours(23, 59, 59, 999)
  ).toISOString();

  useEffect(() => {
    const cartCounts = fetchCartCounts({
      shop: myshopifyDomain,
      startDate,
      endDate,
    });
    setCartCounts(cartCounts);
    const orderRecords = fetchOrderRecords({
      shop: myshopifyDomain,
      startDate,
      endDate,
    });
    setOrderRecords(orderRecords);
  }, [selectedDates]);

  const handleChange = useCallback(async ({ start, end }) => {
    setSelectedDates({ start, end });
  }, []);

  const handleMonthChange = useCallback((month, year) => {
    setDate({ month, year });
  }, []);

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
                <Heading>
                  Selected period:{" "}
                  <TextStyle variation="subdued">
                    {getFormattedDate(startDate)} to {getFormattedDate(endDate)}
                  </TextStyle>
                </Heading>
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
                <DisplayText size="small">
                  ${parseFloat(totalTipsAmount).toFixed(2)}
                </DisplayText>
              </TextContainer>
            </Card.Section>
          </Card>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Card sectioned>
            <Card.Section>
              <TextContainer>
                <Heading>Count of tip orders for selected period</Heading>
                <DisplayText size="small">
                  {totalTipsCount} order{totalTipsCount === 1 ? "" : "s"}
                </DisplayText>
              </TextContainer>
            </Card.Section>
          </Card>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Card sectioned>
            <Card.Section>
              <TextContainer>
                <Heading>AOV of orders with tips for selected period</Heading>
                <DisplayText size="small">
                  ${parseFloat(totalAmount).toFixed(2)}
                </DisplayText>
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
                <DisplayText size="small">
                  {(totalTipsToCartsCount * 100).toFixed(0)}%
                </DisplayText>
              </TextContainer>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </TextContainer>
  );
};

export default Metrics;
