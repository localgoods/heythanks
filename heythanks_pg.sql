--
-- PostgreSQL database dump
--

-- Dumped from database version 14.0
-- Dumped by pg_dump version 14.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cart_count; Type: TABLE; Schema: public; Owner: ianherrington
--

CREATE TABLE public.cart_count (
    shop text NOT NULL,
    day text NOT NULL,
    count integer
);


ALTER TABLE public.cart_count OWNER TO ianherrington;

--
-- Name: error; Type: TABLE; Schema: public; Owner: ianherrington
--

CREATE TABLE public.error (
    id text NOT NULL,
    error text,
    shop text,
    created_at text
);


ALTER TABLE public.error OWNER TO ianherrington;

--
-- Name: order_record; Type: TABLE; Schema: public; Owner: ianherrington
--

CREATE TABLE public.order_record (
    order_id text,
    price numeric,
    currency text,
    plan_id text,
    details json,
    id text NOT NULL,
    created_at text,
    paid_by text,
    period_end text,
    shop text
);


ALTER TABLE public.order_record OWNER TO ianherrington;

--
-- Name: shop; Type: TABLE; Schema: public; Owner: ianherrington
--

CREATE TABLE public.shop (
    fulfillment_service text,
    fulfillment_email text,
    fulfillment_phone text,
    fulfillment_manual boolean,
    onboarded boolean,
    active_plan text,
    url text,
    email text,
    id text NOT NULL,
    formatted_address text[],
    plan_name text,
    partner_development boolean,
    shopify_plus boolean,
    name text,
    shop text,
    access_token text,
    installed boolean,
    requires_update boolean,
    cart_sections json,
    created_at text,
    updated_at text,
    fulfillment_bearer_token text,
    fulfillment_refresh_token text
);


ALTER TABLE public.shop OWNER TO ianherrington;


--
-- Name: error error_pkey; Type: CONSTRAINT; Schema: public; Owner: ianherrington
--

ALTER TABLE ONLY public.error
    ADD CONSTRAINT error_pkey PRIMARY KEY (id);


--
-- Name: order_record order_record_pkey; Type: CONSTRAINT; Schema: public; Owner: ianherrington
--

ALTER TABLE ONLY public.order_record
    ADD CONSTRAINT order_record_pkey PRIMARY KEY (id);


--
-- Name: shop shop_pkey; Type: CONSTRAINT; Schema: public; Owner: ianherrington
--

ALTER TABLE ONLY public.shop
    ADD CONSTRAINT shop_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

