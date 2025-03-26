# Saratoga Store Agent, powered by 11Labs & Crossmint

An AI shopping assistant that helps users find products and sends them a link to complete their purchase. 

## Features

- **Product Search**: Search for products available for sale directly through the assistant
- **Email Notifications**: Receive payment link to complete via email
- **Payment**: Purchase products using fiat or crypto via Crossmint Checkout

This demo implements two voice-based assistants: one on the browser and one on the phone.

## Tech Stack

- **Voice**: [11Labs](https://elevenlabs.io/docs/overview)
- **Phone**: [Twilio](https://elevenlabs.io/docs/conversational-ai/guides/twilio/custom-server)
- **Emails**: [Resend](https://resend.com/docs/introduction)
- **Payments**: [Crossmint](https://docs.crossmint.com/payments/headless/guides/physical-good-purchases)

You will have to create an account with each of these services to get the API keys needed.

## Getting Started

Set up your environment variables by copying the `.env.template` file:

```bash
cp .env.template .env
```

Then, install dependencies and run the development server and the Twilio server (if you want to run this via phone):

```bash
pnpm install
pnpm run dev
pnpm run twilio-server
```

Ensure you use ngrok to expose your localhosts remotely. To run multiple ngrok sessions from a single tunnel with multiple ports, create an `ngrok.yml` in the repo's root directory with your Twilio auth token:

```bash
version: "2"
authtoken: your_twilio_authtoken
tunnels:
  twilio:
    addr: 8000
    proto: http
  nextjs:
    addr: 3001
    proto: http
```

Then, use the following command to run ngrok:

```bash
ngrok start --config=./ngrok.yml --all
```

Pick up the phone to call your agent's number or open [http://localhost:3001](http://localhost:3001) and start shopping!