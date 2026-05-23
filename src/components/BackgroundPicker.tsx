import { useGeometryStore } from "../state/useGeometryStore";

const backgroundPresets = ["#efe3cf", "#f3eee7", "#e5f0ef", "#e9edf7", "#f1e7ef", "#24262b"];

export function BackgroundPicker() {
  const backgroundColor = useGeometryStore((state) => state.backgroundColor);
  const setBackgroundColor = useGeometryStore((state) => state.setBackgroundColor);

  return (
    <section className="background-picker" aria-label="Background color">
      <div className="picker-header">
        <span>Background</span>
        <input
          aria-label="Custom background color"
          type="color"
          value={backgroundColor}
          onChange={(event) => setBackgroundColor(event.target.value)}
        />
      </div>

      <div className="swatch-row" aria-label="Background presets">
        {backgroundPresets.map((color) => (
          <button
            aria-label={`Use background ${color}`}
            className={backgroundColor === color ? "color-swatch active" : "color-swatch"}
            key={color}
            style={{ backgroundColor: color }}
            type="button"
            onClick={() => setBackgroundColor(color)}
          />
        ))}
      </div>
    </section>
  );
}
