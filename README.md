<img width="50px" alt="HeyThanks logo" src="content/logos/heythanks.png">

# HeyThanks

Do well by doing good for fulfillment workers

## About

HeyThanks is the Shopify app the enables in-store tipping for fulfillment workers. Built with Node (server), React (admin) and Vue (cart and order widgets). Served up by Heroku with a Postgres database.

## 💻 Development

Get started contributing to HeyThanks.

### Prerequisites

Make sure your development environment has the necessary prerequisites.

1. [Node.js (v16.x)](https://nodejs.org/en/download/) – we use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions.

2. [Shopify CLI](https://shopify.dev/apps/tools/cli) to manage Shopify apps.

3. [VSCode](https://code.visualstudio.com/) – you could also use another editor, but this helps us guarantee linter/formatter features.

4. [Volar VSCode Extension](https://marketplace.visualstudio.com/items?itemName=Vue.volar) – Vue 3 language support (turn off vetur and ts/js language features if you have problems arising from conflicts).

5. [Eslint VSCode Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) – linter and formatter.

### Setup

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
SHOP="your-shop-url"
SCOPES=write_script_tags,write_products,read_themes,read_fulfillments,read_orders,read_products,read_customers
HOST="your-ngrok-url"
DATABASE_URL="your-postgres-url"
```

### Cart widget

Run the development server for the cart widget.
```zsh
npm run serve:cart-widget
```

### Admin app

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
- local-goods-shane-dev.myshopify.com
- local-goods-dawn-staging.myshopify.com
- spotted-by-humphrey-staging.myshopify.com
- urban-edc-supply-staging.myshopify.com
- shopwayre-staging.myshopify.com
- urban-edc-supply.myshopify.com
- spotted-by-humphrey.myshopify.com
- shopwayre.myshopify.com
