export function nextMetaState(current) {
  switch (current) {
    case "personal_stats":
      return "reaction_time";
    case "reaction_time":
      return "comparison";
    case "comparison":
      return "cold_facts";
    case "cold_facts":
      return "final";
    case "final":
      return null;
    default:
      return null;
  }
}
