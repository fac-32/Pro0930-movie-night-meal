const changeColorBtn = document.getElementById("change-color-btn");
const colorInput = document.getElementById("color-input");
const root = document.documentElement;

if (changeColorBtn && colorInput) {
  const getBackgroundColor = () =>
    getComputedStyle(root).getPropertyValue("--bg-color").trim();

  const setBackgroundColor = (color) => {
    root.style.setProperty("--bg-color", color);
  };

  const initialColor = getBackgroundColor();
  if (initialColor) {
    colorInput.value = initialColor;
  }

  const applyBackgroundColor = () => setBackgroundColor(colorInput.value);

  changeColorBtn.addEventListener("click", applyBackgroundColor);
  colorInput.addEventListener("input", applyBackgroundColor);
}
