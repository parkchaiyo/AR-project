
const lamp = document.getElementById("lamp");
const sizeSelect = document.getElementById("size");
const message = document.getElementById("message");
const buyButton = document.getElementById("buyButton");

// Change product size
sizeSelect.addEventListener("change", function () {
  lamp.scale = this.value;

  message.textContent =
    "Selected size: " +
    this.options[this.selectedIndex].text;
});

// Purchase interaction
buyButton.addEventListener("click", function () {
  alert(
    "Thank you for choosing LumiGo! " +
    "Your product is ready to order."
  );
});
