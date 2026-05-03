export default function ChoiceList({ choices, onSelect, effects }) {
  const decorImages = [
    '/Option_deco_tl.svg',
    '/Option_deco_tr.svg',
    '/Option_deco_bl.svg',
    '/Option_deco_br.svg',
  ];

  return (
    <div className="choices-grid">
      {choices.map((choice, i) => {
        const hidden =
          effects.choiceInstability && Math.random() < 0.15;

        if (hidden) return null;

        const isLeftChoice = i % 2 === 0;
        const number = i + 1;

        return (
          <button
            key={i}
            onClick={() => onSelect(choice)}
            style={{ backgroundImage: `url(${decorImages[i]})` }}
            className={isLeftChoice ? "choice-number-right" : "choice-number-left"}
          >
            <span className="choice-text">{choice.text}</span>
            <span className="choice-number">{number}</span>
          </button>
        );
      })}
    </div>
  );
}