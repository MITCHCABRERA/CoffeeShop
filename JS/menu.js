document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".hot-coffee-1");
  const popup = document.getElementById("addedPopup");

  function showPopup(message) {
    if (!popup) return;
    popup.textContent = message;
    popup.classList.add("show");

    setTimeout(() => popup.classList.remove("show"), 2000);
  }

  items.forEach(item => {
    item.addEventListener("click", () => {
      const name = item.querySelector("p")?.textContent.trim();
      const priceText = item.querySelector("strong")?.textContent.trim().replace(/[^\d.]/g, "");
      const price = parseFloat(priceText);

      if (!name || isNaN(price)) {
        console.error("Missing name or invalid price for item:", item);
        return;
      }

      // Get current cart from localStorage
      const cart = JSON.parse(localStorage.getItem("cart")) || [];

      // Check if item already exists in the cart
      const existingItem = cart.find(i => i.name === name);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ name, price, quantity: 1 });
      }

      // Save updated cart
      localStorage.setItem("cart", JSON.stringify(cart));

      // Show popup message
      showPopup(`${name} added to cart ✅`);
      console.log(cart);
    });
  });
});
