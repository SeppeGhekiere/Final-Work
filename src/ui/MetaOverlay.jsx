import ThankYouOverlay from "./meta/ThankYouOverlay";
import RealityCheckOverlay from "./meta/RealityCheckOverlay";
import PersonalStatsOverlay from "./meta/PersonalStatsOverlay";
import ColdFactsOverlay from "./meta/ColdFactsOverlay";

export default function MetaOverlay({ mode, onComplete }) {
  switch (mode) {
    case "thank_you":
      return <ThankYouOverlay onComplete={onComplete} />;
    case "reality_check":
      return <RealityCheckOverlay onComplete={onComplete} />;
    case "personal_stats":
      return <PersonalStatsOverlay onComplete={onComplete} />;
    case "cold_facts":
      return <ColdFactsOverlay onComplete={onComplete} />;
    default:
      return null;
  }
}
