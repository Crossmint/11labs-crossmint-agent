# Saratoga Store Agent, powered by 11Labs & Crossmint

An AI shopping assistant that helps users find products and sends them a link to complete their purchase.

## Features

- **AI-Powered Conversations**: Engage with an intelligent shopping assistant that understands natural language
- **Product Search**: Search for products available for sale directly through the assistant
- **Email Notifications**: Receive payment link to complete via email
- **Payments**: Purchase products using fiat or crypto via Crossmint Checkout

## Tech Stack

- **Voice**: [11Labs](https://elevenlabs.io/docs/overview)
- **Emails**: [Resend](https://resend.com/docs/introduction)
- **Payments**: [Crossmint](https://docs.crossmint.com/payments/headless/guides/physical-good-purchases)

## Getting Started

First, set up your environment variables by copying the `.env.template` file:

```bash
cp .env.template .env
```

Then, install dependencies and run the development server:

```bash
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start shopping!

## Learn More

To learn more about 11Labs and Crossmint APIs used in this project follow the links below:

- 
- 