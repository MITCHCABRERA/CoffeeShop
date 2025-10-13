// order.js
(function () {
  console.log("order.js: script loaded");

  document.addEventListener("DOMContentLoaded", () => {
    console.log("order.js: DOMContentLoaded");

    // Elements
    const cartList = document.getElementById("cartList") || document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const clearCartBtn = document.getElementById("clearCart") || document.getElementById("clearCartBtn");
    const confirmBtn = document.getElementById("confirmCart") || document.getElementById("checkoutBtn");
    const messageArea = document.getElementById("cartMsg");

    if (!cartList || !cartTotal) {
      console.error("order.js: Required elements (#cartList or #cartTotal) not found in the DOM.");
      return;
    }

    // form inputs
    const nameInput = document.getElementById("cartName");
    const phoneInput = document.getElementById("cartPhone");
    const methodSelect = document.getElementById("cartMethod");
    const accountInput = document.getElementById("cartAccount");
    const refInput = document.getElementById("cartRef");
    const addressInput = document.getElementById("cartAddress");

    let cart = [];

    // Helper to escape HTML
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    // Auto-hide after 5 seconds
    function showMessage(html) {
      if (!messageArea) return;

      messageArea.innerHTML = html;
      messageArea.style.opacity = "1";

      // fade out after 5s
      setTimeout(() => {
        messageArea.style.transition = "opacity 0.5s ease";
        messageArea.style.opacity = "0";
      }, 4500);
      setTimeout(() => {
        messageArea.innerHTML = "";
        messageArea.style.opacity = "1";
      }, 5000);
    }

    // Add item click listeners
    const menuItems = document.querySelectorAll(".hot-coffee-1");
    if (!menuItems || menuItems.length === 0) console.warn("order.js: No menu items (.hot-coffee-1) found.");

    menuItems.forEach(item => {
      item.addEventListener("click", () => {
        const name = item.getAttribute("data-name") || item.dataset.name;
        const priceRaw = item.getAttribute("data-price") || item.dataset.price;
        const price = parseFloat(priceRaw);
        if (!name || isNaN(price)) {
          console.warn("order.js: skipped item with invalid data:", name, priceRaw);
          return;
        }

        const existing = cart.find(i => i.name === name);
        if (existing) existing.quantity += 1;
        else cart.push({ name, price, quantity: 1 });

        renderCart();
      });
    });

    // Render cart
    function renderCart() {
      cartList.innerHTML = "";
      let total = 0;

      cart.forEach((item, index) => {
        total += item.price * item.quantity;

        const row = document.createElement("div");
        row.className = "cart-item d-flex justify-content-between align-items-center";
        row.innerHTML = `
          <div>${escapeHtml(item.name)} x${item.quantity}</div>
          <div>
            ₱${(item.price * item.quantity).toFixed(2)}
            <button type="button" class="btn btn-sm btn-outline-danger ms-2 remove-btn" data-index="${index}">×</button>
          </div>
        `;
        cartList.appendChild(row);
      });

      cartTotal.textContent = "₱" + total.toFixed(2);
    }

    // Remove item
    cartList.addEventListener("click", (evt) => {
      const btn = evt.target.closest(".remove-btn");
      if (!btn) return;
      const index = Number(btn.dataset.index);
      if (!Number.isInteger(index)) return;
      cart.splice(index, 1);
      renderCart();
    });

    // Clear cart
    if (clearCartBtn) {
      clearCartBtn.addEventListener("click", () => {
        cart = [];
        renderCart();
        showMessage(`<div class="alert alert-secondary">🧹 Cart cleared.</div>`);
      });
    } else {
      console.warn("order.js: clear cart button not found (id='clearCart').");
    }

    // Confirm order
    if (confirmBtn) {
      confirmBtn.addEventListener("click", (e) => {
        e.preventDefault();

        if (cart.length === 0) {
          showMessage(`<div class="alert alert-warning">🛒 Your cart is empty.</div>`);
          return;
        }

        const nameVal = nameInput ? nameInput.value.trim() : "";
        const phoneVal = phoneInput ? phoneInput.value.trim() : "";
        const methodVal = methodSelect ? methodSelect.value : "";
        const accountVal = accountInput ? accountInput.value.trim() : "";
        const refVal = refInput ? refInput.value.trim() : "";
        const addressVal = addressInput ? addressInput.value.trim() : "";

        if (!nameVal || !phoneVal || !methodVal || !accountVal || !refVal) {
          showMessage(`<div class="alert alert-warning">⚠️ Please fill out all required fields.</div>`);
          return;
        }

        if (methodVal === "Delivery" && !addressVal) {
          showMessage(`<div class="alert alert-warning">⚠️ Please provide a delivery address.</div>`);
          return;
        }

        const totalAmount = cart.reduce((s, it) => s + it.price * it.quantity, 0);

        // Save order to localStorage (for Admin Panel)
        const orderData = {
          name: nameVal,
          phone: phoneVal,
          method: methodVal,
          account: accountVal,
          reference: refVal,
          address: addressVal || "N/A",
          items: cart.map(i => ({ name: i.name, qty: i.quantity, price: i.price })),
          total: totalAmount,
          createdAt: new Date().toLocaleString()
        };

        const orders = JSON.parse(localStorage.getItem("orders") || "[]");
        orders.push(orderData);
        localStorage.setItem("orders", JSON.stringify(orders));

        // success message
        const successHtml = `<div class="alert alert-success">
          ✅ Thank you, <strong>${escapeHtml(nameVal)}</strong>! Your order is confirmed.<br>
          <small>Total: ₱${totalAmount.toFixed(2)}</small>
        </div>`;
        showMessage(successHtml);

        // clear cart and inputs
        cart = [];
        renderCart();
        if (nameInput) nameInput.value = "";
        if (phoneInput) phoneInput.value = "";
        if (accountInput) accountInput.value = "";
        if (refInput) refInput.value = "";
        if (addressInput) addressInput.value = "";
      });
    } else {
      console.warn("order.js: confirm button not found (id='confirmCart').");
    }

    // initial render
    renderCart();
  });
})();
