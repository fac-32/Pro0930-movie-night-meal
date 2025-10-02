const changeColorBtn = document.getElementById("change-color-btn");
const colorInput = document.getElementById("color-input");

const applyBgColor = (color) => {
  document.body.style.backgroundColor = color;
};

//add listener for the change color button
changeColorBtn.addEventListener("click", () => {
  document.body.style.backgroundColor = colorInput.value;
});
