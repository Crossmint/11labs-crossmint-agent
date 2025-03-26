# Saratoga Store Agent, powered by 11Labs & Crossmint

An AI shopping assistant that helps users find products and sends them a link to complete their purchase. 

## Features

- **Product Search**: Search for products available for sale directly through the assistant
- **Email Notifications**: Receive payment link to complete via email
- **Payment**: Purchase products using fiat or crypto via Crossmint Checkout

This demo implements a voice-based assistant on the browser. To implement it using a phone number use [Twilio](https://elevenlabs.io/docs/conversational-ai/guides/twilio/custom-server).

## Tech Stack

- **Voice**: [11Labs](https://elevenlabs.io/docs/overview)
- **Emails**: [Resend](https://resend.com/docs/introduction)
- **Payments**: [Crossmint](https://docs.crossmint.com/payments/headless/guides/physical-good-purchases)

You will have to create an account with each of these services to get the API keys needed.

## Getting Started

Set up your environment variables by copying the `.env.template` file:

```bash
cp .env.template .env
```

Then, install dependencies and run the development server:

```bash
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start shopping!