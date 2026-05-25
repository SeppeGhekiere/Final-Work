export function nextMetaState(current) {
  switch (current) {
    case "personal_stats":
      return "cold_facts";
    case "cold_facts":
      return "final";
    case "final":
      return null;
    default:
      return null;
  }
}
