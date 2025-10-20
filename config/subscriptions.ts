import { ProductTier } from "@/types/subscriptions";

export const SUBSCRIPTION_TIERS: ProductTier[] = [
  {
    name: "Starter",
    id: "tier-starter",
    productId: "prod_4xaHcIcRndFQ9sPXF0Gjnv", // $15 monthly subscription
    priceMonthly: "$15",
    description: "Perfect for content creators and individual animators.",
    features: [
      "100 credits per month",
      "≈10-20 video generations",
      "No expiration date",
      "Basic motion transfer",
      "Commercial Use",
      "No Watermark Output"
    ],
    featured: false,
    discountCode: "", // Optional discount code
  },
  {
    name: "Creator",
    id: "tier-creator",
    productId: "prod_6rOJtTwlyjsH9AVuSzh8aR", // $39 monthly subscription
    priceMonthly: "$39",
    description: "Ideal for professional studios and content production.",
    features: [
      "300 credits per month",
      "≈30-60 video generations",
      "No expiration date",
      "Advanced motion transfer",
      "Priority processing",
      "Commercial Use",
      "No Watermark Output"
    ],
    featured: true,
    discountCode: "", // Optional discount code
  },
  {
    name: "Studio",
    id: "tier-studio",
    productId: "prod_3qPYksZMtk94wQsdkgajrJ", // $99 monthly subscription
    priceMonthly: "$99",
    description: "For studios and enterprises with high-volume needs.",
    features: [
      "800 credits per month",
      "≈80-160 video generations",
      "No expiration date",
      "Advanced AI technology",
      "Priority processing",
      "Commercial Use",
      "No Watermark Output"
    ],
    featured: false,
    discountCode: "", // Optional discount code
  },
];

export const CREDITS_TIERS: ProductTier[] = [
  {
    name: "Trial",
    id: "tier-trial",
    productId: "prod_MqcjVo0Bpx0rbYmHVlrh2", // $10 one-time purchase
    priceMonthly: "$10",
    description: "100 credits for testing and small projects.",
    creditAmount: 100,
    features: [
      "100 credits included",
      "≈10 video generations",
      "No expiration date",
      "Basic motion transfer",
      "Commercial Use",
      "No Watermark Output"
    ],
    featured: false,
    discountCode: "", // Optional discount code
  },
  {
    name: "Base",
    id: "tier-base",
    productId: "prod_4ICkTovEC6o9QY6UuL3aI0", // $27 one-time purchase
    priceMonthly: "$27",
    description: "300 credits for content creators.",
    creditAmount: 300,
    features: [
      "300 credits included",
      "≈30 video generations",
      "No expiration date",
      "Advanced motion transfer",
      "Priority processing",
      "Commercial Use",
      "No Watermark Output"
    ],
    featured: true,
    discountCode: "", // Optional discount code
  },
  {
    name: "Pro",
    id: "tier-pro",
    productId: "prod_3b3oyQtIJA3eaMIHLNjyCc", // $40 one-time purchase
    priceMonthly: "$40",
    description: "500 credits for professional studios.",
    creditAmount: 500,
    features: [
      "500 credits included",
      "≈50 video generations",
      "No expiration date",
      "Advanced AI technology",
      "Priority processing",
      "Commercial Use",
      "No Watermark Output"
    ],
    featured: false,
    discountCode: "", // Optional discount code
  },
];
