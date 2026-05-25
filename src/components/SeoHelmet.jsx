import { Helmet } from "react-helmet-async";

export default function SeoHelmet() {
  return (
    <Helmet>
      <title>The Loop</title>
      <meta
        name="description"
        content="Doomscroll - an interactive narrative experience about digital fatigue, doomscrolling, and self-reflection."
      />
      <meta
        name="keywords"
        content="doomscroll, interactive fiction, narrative experience, ghekiere seppe, ghekiereseppe, gekiereseppe, ghekierseppe, seppe ghekiere, ghekiere, ghekieresepe, ghekiersepe"
      />
      <meta name="author" content="Ghekiere Seppe" />
    </Helmet>
  );
}
