// order.js
(function () {
  console.log("order.js: script loaded");

  document.addEventListener("DOMContentLoaded", () => {
    console.log("order.js: DOMContentLoaded");

    const cartList = document.getElementById("cartList") || document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const clearCartBtn = document.getElementById("clearCart") || document.getElementById("clearCartBtn");
    const confirmBtn = document.getElementById("confirmCart") || document.getElementById("checkoutBtn");
    const messageArea = document.getElementById("cartMsg");

    if (!cartList || !cartTotal) {
      console.error("order.js: Required elements (#cartList or #cartTotal) not found in the DOM.");
      return;
    }

    const nameInput = document.getElementById("cartName");
    const phoneInput = document.getElementById("cartPhone");
    const methodSelect = document.getElementById("cartMethod");
    const accountInput = document.getElementById("cartAccount");
    const refInput = document.getElementById("cartRef");
    const addressInput = document.getElementById("cartAddress");

    // ✅ Load cart from localStorage
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Save cart to localStorage
    function saveCart() {
      localStorage.setItem("cart", JSON.stringify(cart));
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function showMessage(html) {
      if (!messageArea) return;
      messageArea.innerHTML = html;
      messageArea.style.opacity = "1";

      setTimeout(() => {
        messageArea.style.transition = "opacity 0.5s ease";
        messageArea.style.opacity = "0";
      }, 4500);
      setTimeout(() => {
        messageArea.innerHTML = "";
        messageArea.style.opacity = "1";
      }, 5000);
    }

    // Add click listeners to menu items (for menu.html)
    const menuItems = document.querySelectorAll(".hot-coffee-1");
    menuItems.forEach(item => {
      item.addEventListener("click", () => {
        const name = item.querySelector("p")?.innerText || "Unknown";
        const priceText = item.querySelector("strong")?.innerText || "0";
        const price = parseFloat(priceText);

        if (!name || isNaN(price)) {
          console.warn("order.js: skipped invalid item", name, price);
          return;
        }

        const existing = cart.find(i => i.name === name);
        if (existing) existing.quantity += 1;
        else cart.push({ name, price, quantity: 1 });

        saveCart(); // ✅ keep it saved
        showMessage(`<div class="alert alert-success">✅ ${name} added to cart!</div>`);
        renderCart();
      });
    });

    // Render cart contents
    function renderCart() {
      cartList.innerHTML = "";
      if (cart.length === 0) {
        cartList.innerHTML = "<p>Your cart is empty.</p>";
        cartTotal.textContent = "₱0.00";
        return;
      }

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
      saveCart();
    }

    // Remove an item
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
        saveCart();
        renderCart();
        showMessage(`<div class="alert alert-secondary">🧹 Cart cleared.</div>`);
      });
    }

    // Confirm order
    if (confirmBtn) {
      confirmBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (cart.length === 0) {
          showMessage(`<div class="alert alert-warning">🛒 Your cart is empty.</div>`);
          return;
        }

        const nameVal = nameInput?.value.trim() || "";
        const phoneVal = phoneInput?.value.trim() || "";
        const methodVal = methodSelect?.value || "";
        const accountVal = accountInput?.value.trim() || "";
        const refVal = refInput?.value.trim() || "";
        const addressVal = addressInput?.value.trim() || "";

        if (!nameVal || !phoneVal || !methodVal || !accountVal || !refVal) {
          showMessage(`<div class="alert alert-warning">⚠️ Please fill out all required fields.</div>`);
          return;
        }

        if (methodVal === "Delivery" && !addressVal) {
          showMessage(`<div class="alert alert-warning">⚠️ Please provide a delivery address.</div>`);
          return;
        }

        const totalAmount = cart.reduce((s, it) => s + it.price * it.quantity, 0);

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

        showMessage(`<div class="alert alert-success">
          ✅ Thank you, <strong>${escapeHtml(nameVal)}</strong>! Your order is confirmed.<br>
          <small>Total: ₱${totalAmount.toFixed(2)}</small>
        </div>`);

        cart = [];
        saveCart();
        renderCart();
      });
    }

    // Initial render (load cart from localStorage)
    renderCart();
  });
})();
