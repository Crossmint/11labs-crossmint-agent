import * as React from 'react';
import { Section, Img, Text, Heading, Button, Tailwind } from "@react-email/components";

interface EmailTemplateProps {
  title: string;
  ASIN: string;
  img_thumbnail: string;
  apiKey?: string;
  defaultChain?: string;
  defaultCurrency?: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  title,
  ASIN,
  img_thumbnail,
  apiKey = process.env.CROSSMINT_API_KEY,
  defaultChain = "solana",
  defaultCurrency = "usdc"
}) => {
  // Create the product locator for the Amazon product - use the simpler ASIN format
  const productLocator = `amazon:${ASIN}`;
  
  // Create the lineItems parameter
  const lineItems = encodeURIComponent(JSON.stringify([{
    productLocator: productLocator
  }]));
  
  // Create the payment parameter
  const payment = encodeURIComponent(JSON.stringify({
    crypto: {
      enabled: false,
      defaultChain,
      defaultCurrency
    },
    fiat: {
      enabled: true,
      allowedMethods: {
        applePay: false,
        googlePay: false,
      }
    },
    defaultMethod: "fiat"
  }));

  // Construct the full checkout URL
  const checkoutUrl = `https://www.crossmint.com/sdk/2024-03-05/hosted-checkout?apiKey=${apiKey}&lineItems=${lineItems}&payment=${payment}`;
  
  return (
    <Tailwind>
      <Section className="my-[16px]">
        <Img
          alt="Product"
          className="w-full max-h-[200px] rounded-[12px] object-contain"
          height={60}
          src={img_thumbnail}
        />
        <Section className="mt-[32px] text-center">
          <Heading
            as="h1"
            className="text-[36px] font-semibold leading-[40px] tracking-[0.4px] text-gray-900"
          >
            Complete your Morning Routine
          </Heading>
          <Text className="mt-[4px] text-[14px] leading-[20px] text-gray-700">
            {title}
          </Text>
          <Text className="mt-[8px] text-[16px] leading-[24px] text-gray-500">
            Complete your purchase now for fast Saratoga delivery to your doorstep. Don't forget to order 🍌 & 🧊
          </Text>
          <Button
            className="mt-[16px] rounded-[8px] bg-black px-[24px] py-[12px] font-semibold text-white"
            href={checkoutUrl}
          >
            Buy now
          </Button>
          <Text className="mt-[8px] text-[12px] leading-[16px] text-gray-400">
            Powered by Crossmint
          </Text>
        </Section>
      </Section>
    </Tailwind>
  );
};