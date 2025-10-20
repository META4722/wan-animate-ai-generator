"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { SUBSCRIPTION_TIERS } from "@/config/subscriptions";
import { createCheckoutSession } from "@/app/actions";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function Pricing() {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const paymentsEnabled = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";

  const handleSubscribe = async (productId: string, discountCode?: string) => {
    if (!paymentsEnabled) {
      toast({
        title: "Coming soon",
        description: "Our product is currently in beta testing and payment functionality is still being perfected. We will integrate it as soon as possible. Stay tuned!",
      });
      return;
    }
    if (!user || !user.email) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan",
        variant: "destructive",
      });
      router.push("/sign-in");
      return;
    }

    try {
      const checkoutUrl = await createCheckoutSession(
        productId,
        user.email,
        user.id,
        "subscription",
        0,
        discountCode
      );

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    }
  };



  return (
    <section id="pricing" className="py-8 md:py-12 lg:py-24">
      <div className="container px-4 sm:px-6 lg:px-8 space-y-16 max-w-6xl">
        {/* Subscription Plans */}
        <div>
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-bold text-2xl sm:text-3xl md:text-6xl leading-[1.1]">
              Character Animation Plans
            </h2>
            <p className="max-w-[95%] sm:max-w-[85%] text-sm sm:text-lg leading-normal text-muted-foreground">
              Choose the perfect plan for your character animation needs. All plans include AI-powered motion transfer and high-fidelity animation generation. Cancel anytime with no long-term commitments.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 mt-8 md:mt-12">
            {SUBSCRIPTION_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-2xl border bg-background p-4 sm:p-6 shadow-lg h-full ${tier.featured
                  ? "border-primary shadow-primary/10"
                  : "border-border"
                  }`}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    🔥 Popular
                  </div>
                )}
                <div className="space-y-4">
                  <h3 className="text-xl sm:text-2xl font-bold">{tier.name}</h3>
                  <div className="text-3xl sm:text-4xl font-bold">
                    {tier.priceMonthly}
                    {tier.priceMonthly !== "Custom" && (
                      <span className="text-base font-normal text-muted-foreground">
                        /month
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                  
                </div>
                <div className="mt-6 flex-1 flex flex-col">
                  <ul className="space-y-3 text-sm flex-1">
                    {tier?.features?.map((feature: string) => (
                      <li key={feature} className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-6"
                    variant={tier.featured ? "default" : "outline"}
                    onClick={() =>
                      handleSubscribe(tier.productId, tier.discountCode)
                    }
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credits Pricing Information */}
        <div className="bg-muted/30 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">💎 Credits Usage</h3>
            <p className="text-muted-foreground">
              Credits are consumed based on video resolution and duration. All credits never expire.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-4 bg-background rounded-lg border">
              <div className="text-lg font-semibold mb-2">480p Quality</div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>5 seconds = <span className="font-medium text-foreground">5 credits</span></div>
                <div>10 seconds = <span className="font-medium text-foreground">10 credits</span></div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-background rounded-lg border border-primary/50">
              <div className="text-lg font-semibold mb-2">720p Quality</div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>5 seconds = <span className="font-medium text-foreground">10 credits</span></div>
                <div>10 seconds = <span className="font-medium text-foreground">20 credits</span></div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-background rounded-lg border">
              <div className="text-lg font-semibold mb-2">1080p Quality</div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>5 seconds = <span className="font-medium text-foreground">15 credits</span></div>
                <div>10 seconds = <span className="font-medium text-foreground">30 credits</span></div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-4 text-sm text-muted-foreground">
              <span>✨ No expiration</span>
              <span>🎯 Pay per use</span>
              <span>🔄 Flexible consumption</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
