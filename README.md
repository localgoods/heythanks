# HeyThanks

| [![HeyThanks logo](theme-app-extension/assets/HeyThanks.svg)](theme-app-extension/assets/HeyThanks.svg) |
| :--: |
| 💜 Tipping for fulfillment workers |

## About

HeyThanks is the Shopify app the enables in-cart tipping for fulfillment workers. 

Built with Node (server), React (admin) and Vue (widget extension). Served up by Heroku with a Postgres database. 

## Setup

Get started contributing to Casimir.

### Prerequisites

Make sure your development environment has the necessary prerequisites.

1. [Node.js (v16.x)](https://nodejs.org/en/download/) – we use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions.

2. [Shopify CLI](https://shopify.dev/apps/tools/cli) to manage Shopify apps.

3. [VSCode](https://code.visualstudio.com/) – you could also use another editor, but this helps us guarantee linter/formatter features.

4. [Volar VSCode Extension](https://marketplace.visualstudio.com/items?itemName=Vue.volar) – Vue 3 language support (turn off vetur and ts/js language features if you have problems arising from conflicts).

5. [Eslint VSCode Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) – linter and formatter.

### Install

Clone the repository, checkout a new branch from the master copy, and install all dependencies.

```zsh
git clone https://github.com/localgoods/heythanks.git
cd heythanks
git pull
git checkout -b feature/tip-more master
npm install
```

> This will install all workspace dependencies for this monorepo.

### Environment

Create a `.env` in the root directory and add your local Shopify app configuration.

```
SHOPIFY_API_KEY="your-api-key"
SHOPIFY_API_SECRET="your-api-secret"
SHOP=local-goods-"your-member-name"-dev.myshopify.com
SCOPES=write_script_tags,write_products,read_themes,read_fulfillments,read_orders,read_products,read_customers
HOST=https://5298-2603-8080-1303-97e4-c80b-596f-ac46-89f1.ngrok.io
DATABASE_URL=postgres://"your-username"@localhost:5432/"your-username"
```

## 💻 Development

Run the development server for the default application (the admin app) and backend services.

```zsh
npm run serve
```

## Usage

*Todo add usage documentation.*
- Postgres local
- Env vars
- App config
- Store config
- Extension config
- Git workflow

## Notes

Special, free access to full service:
- loop-chocolate.myshopify.com
- local-goods-ian-dev.myshopify.com
- local-goods-dawn-staging.myshopify.com
- spotted-by-humphrey-staging.myshopify.com
- urban-edc-supply-staging.myshopify.com
- urban-edc-supply.myshopify.com
- spotted-by-humphrey.myshopify.com
