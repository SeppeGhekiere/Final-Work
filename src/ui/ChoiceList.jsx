export default function ChoiceList({ choices, onSelect, effects }) {
  return (
    <div className="choices-grid">
      {choices.map((choice, i) => {
        const hidden =
          effects.choiceInstability && Math.random() < 0.15;

        if (hidden) return null;

        return (
          <button key={i} onClick={() => onSelect(choice)}>
            {choice.text}
          </button>
        );
      })}
    </div>
  );
}
