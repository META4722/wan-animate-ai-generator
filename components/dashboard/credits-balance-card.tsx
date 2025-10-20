"use client";

import { Coins } from "lucide-react";
import { CreditTransaction } from "@/types/creem";
import { useDateFormat } from "@/lib/date-utils";

type CreditsBalanceCardProps = {
  credits: number;
  recentHistory: CreditTransaction[];
};

export function CreditsBalanceCard({
  credits,
  recentHistory,
}: CreditsBalanceCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Coins className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Available Credits</p>
          <h3 className="text-2xl font-bold mt-1">{credits}</h3>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <p className="text-sm text-muted-foreground">Recent Activity</p>
        <div className="space-y-2">
          {recentHistory.map((history, index) => {
            const formattedDate = useDateFormat(history.created_at);
            return (
              <div
                key={index}
                className="flex items-start justify-between text-sm gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        history.type === "add" ? "text-primary font-medium" : "text-destructive font-medium"
                      }
                    >
                      {history.type === "add" ? "+" : "-"}
                      {history.amount}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formattedDate}
                    </span>
                  </div>
                  {history.description && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {history.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}