import { CompetitorIntelligence } from "@/components/admin/CompetitorIntelligence";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Competitor Intelligence | Fashcon Admin",
  description: "Monitor market pricing, SEO share, and competitor social strategies.",
};

export default function IntelligencePage() {
  return (
    <main className="flex-1 overflow-y-auto bg-transparent">
      <div className="container mx-auto">
        <CompetitorIntelligence />
      </div>
    </main>
  );
}
