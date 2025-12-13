import { useMemo } from "react";

export function useHomeData() {
  const data = useMemo(
    () => ({
      greeting: {
        title: "Good morning, 4 recommendations for you.",
        updatedAgo: "Updated 2h ago",
      },
      automation: {
        value: 70,
        collaborators: [
          { name: "Niklas", change: "$5,132 → $7,401" },
          { name: "Sophie", change: "$740 → $2,340" },
          { name: "Anna", change: "Audience scaling" },
        ],
      },
      goals: [
        {
          label: "Revenue",
          value: 70000,
          target: 100000,
          trend: "+12%",
        },
        {
          label: "Amount spent",
          value: 30000,
          target: 50000,
          trend: "+4%",
        },
        {
          label: "Blended ROAS",
          value: 2.3,
          target: 2.1,
          trend: "+10%",
          isRatio: true,
        },
      ],
      recommendationsListTitle: "All recommendations",
      recommendations: [
        {
          id: "rec-1",
          title: "Scale acquisition budgets for high-performing assets",
          platform: "Facebook",
          source: "AGI",
          action: "Launch",
          impact: "High impact",
          icon: "chart",
        },
        {
          id: "rec-2",
          title: "20 negative comments need your action",
          platform: "Facebook",
          source: "AGI",
          action: "Resolve",
          impact: "Medium impact",
          icon: "alert",
        },
        {
          id: "rec-3",
          title: "Winner found in your creative testing campaign",
          platform: "Facebook",
          source: "AGI",
          action: "Launch",
          impact: "High impact",
          icon: "trophy",
        },
        {
          id: "rec-4",
          title: "Enable AI bidding on LLA 5% top customers",
          platform: "Facebook",
          source: "AGI",
          action: "Launch",
          impact: "High impact",
          icon: "brain",
        },
      ],
    }),
    []
  );

  return data;
}
