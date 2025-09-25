import { ProductTier } from "@/types/subscriptions";

export const SUBSCRIPTION_TIERS: ProductTier[] = [
  {
    name: "Creator",
    id: "tier-creator",
    productId: "prod_63JTQmsUcQrlZe94IL76fI", // $15 monthly subscription
    priceMonthly: "$15",
    description: "Perfect for content creators and individual animators.",
    features: [
      "20 animation generations per month",
      "720p HD video output",
      "Basic character animation modes",
      "Standard motion transfer",
      "Community support",
      "Export to MP4 format",
    ],
    featured: false,
    discountCode: "", // Optional discount code
  },
  {
    name: "Professional",
    id: "tier-pro",
    productId: "prod_6rOJtTwlyjsH9AVuSzh8aR", // $39 monthly subscription
    priceMonthly: "$39",
    description: "Ideal for professional studios and content production.",
    features: [
      "Everything in Creator",
      "100 animation generations per month",
      "1080p Full HD video output",
      "Advanced holistic replication",
      "Priority processing queue",
      "Custom lighting adjustment",
      "API access for integration",
      "Email support",
    ],
    featured: true,
    discountCode: "", // Optional discount code
  },
  {
    name: "Enterprise",
    id: "tier-enterprise",
    productId: "prod_3qPYksZMtk94wQsdkgajrJ", // $199 monthly subscription
    priceMonthly: "$199",
    description: "For studios and enterprises with high-volume needs.",
    features: [
      "Everything in Professional",
      "Unlimited animation generations",
      "4K Ultra HD video output",
      "Batch processing capabilities",
      "White-label solutions",
      "Dedicated account manager",
      "Custom model training",
      "24/7 priority support",
      "Service Level Agreement (SLA)",
    ],
    featured: false,
    discountCode: "", // Optional discount code
  },
];

export const CREDITS_TIERS: ProductTier[] = [
  {
    name: "Starter Pack",
    id: "tier-5-animations",
    productId: "prod_MqcjVo0Bpx0rbYmHVlrh2", // $12 one-time purchase
    priceMonthly: "$12",
    description: "5 animation generations for testing and small projects.",
    creditAmount: 5,
    features: [
      "5 character animation generations",
      "720p HD video output",
      "No expiration date",
      "Basic motion transfer",
      "Community support"
    ],
    featured: false,
    discountCode: "", // Optional discount code
  },
  {
    name: "Creator Pack",
    id: "tier-15-animations",
    productId: "prod_4ICkTovEC6o9QY6UuL3aI0", // $29 one-time purchase
    priceMonthly: "$29",
    description: "15 animation generations for content creators.",
    creditAmount: 15,
    features: [
      "15 character animation generations",
      "1080p Full HD video output",
      "No expiration date",
      "Advanced motion transfer",
      "Priority processing",
      "Email support"
    ],
    featured: true,
    discountCode: "", // Optional discount code
  },
  {
    name: "Studio Pack",
    id: "tier-50-animations",
    productId: "prod_3b3oyQtIJA3eaMIHLNjyCc", // $89 one-time purchase
    priceMonthly: "$89",
    description: "50 animation generations for professional studios.",
    creditAmount: 50,
    features: [
      "50 character animation generations",
      "4K Ultra HD video output",
      "No expiration date",
      "Holistic replication technology",
      "Batch processing",
      "Premium support",
      "Custom lighting effects"
    ],
    featured: false,
    discountCode: "", // Optional discount code
  },
];
