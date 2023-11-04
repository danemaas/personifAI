"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Stars } from "lucide-react";
import { useToast } from "./ui/use-toast";
import axios from "axios";

interface SubscriptionBtnProps {
  isPro: boolean;
}
const SubscriptionBtn = ({ isPro }: SubscriptionBtnProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onClick = async () => {
    try {
      setLoading(true);

      const response = await axios.get("/api/stripe");
      window.location.href = response.data.url;
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Oops! Something went wrong. Please try again",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      size="sm"
      variant={isPro ? "default" : "premium"}
    >
      {isPro ? "Manage Subscription" : "Upgrade to Pro"}
      {!isPro && <Stars className="h-4 w-4 ml-2 fill-white" />}
    </Button>
  );
};

export default SubscriptionBtn;
