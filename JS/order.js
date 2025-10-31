(function () {
  console.log("order.js: script loaded");

  document.addEventListener("DOMContentLoaded", () => {
    console.log("order.js: DOMContentLoaded");

    const cartList = document.getElementById("cartList") || document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const clearCartBtn = document.getElementById("clearCart") || document.getElementById("clearCartBtn");
    const confirmBtn = document.getElementById("confirmCart") || document.getElementById("checkoutBtn");
    const messageArea = document.getElementById("cartMsg");

    // ✅ Correct confirmed orders section IDs
    const ordersContainer = document.getElementById("confirmedOrdersList");
    const noOrdersMsg = document.getElementById("noOrdersMsg");

    if (!cartList || !cartTotal) {
      console.error("order.js: Required elements (#cartList or #cartTotal) not found in the DOM.");
      return;
    }

    // Form inputs
    const nameInput = document.getElementById("cartName");
    const phoneInput = document.getElementById("cartPhone");
    const methodSelect = document.getElementById("cartMethod");
    const accountInput = document.getElementById("cartAccount");
    const refInput = document.getElementById("cartRef");
    const addressInput = document.getElementById("cartAddress");

    // ✅ Load cart & confirmed orders
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    function saveCart() {
      localStorage.setItem("cart", JSON.stringify(cart));
    }

    function saveOrders() {
      localStorage.setItem("orders", JSON.stringify(orders));
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
      }, 3500);
      setTimeout(() => {
        messageArea.innerHTML = "";
        messageArea.style.opacity = "1";
      }, 4000);
    }

    // ✅ Render confirmed orders
    function renderOrders() {
      if (!ordersContainer) return;

      ordersContainer.innerHTML = "";
      if (orders.length === 0) {
        if (noOrdersMsg) noOrdersMsg.style.display = "block";
        return;
      }
      if (noOrdersMsg) noOrdersMsg.style.display = "none";

      orders.forEach((order, index) => {
        const div = document.createElement("div");
        div.className = "list-group-item list-group-item-action flex-column align-items-start mb-3 border border-1 rounded p-3 shadow-sm";
        div.innerHTML = `
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">${escapeHtml(order.name)}</h5>
            <small>${escapeHtml(order.createdAt)}</small>
          </div>
          <p class="mb-1">📞 ${escapeHtml(order.phone)} | 💳 ${escapeHtml(order.method)}</p>
          <p class="mb-1">Total: ₱${order.total.toFixed(2)}</p>
          <p class="mb-2">📍 ${escapeHtml(order.address || "N/A")}</p>
          <ul class="mb-2">
            ${order.items
              .map(i => `<li>${escapeHtml(i.name)} x${i.qty} — ₱${(i.price * i.qty).toFixed(2)}</li>`)
              .join("")}
          </ul>
          <button class="btn btn-sm btn-outline-danger cancel-order" data-index="${index}">Cancel Order</button>
        `;
        ordersContainer.appendChild(div);
      });
    }

    // ✅ Cancel confirmed order
    if (ordersContainer) {
      ordersContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".cancel-order");
        if (!btn) return;
        const idx = parseInt(btn.dataset.index);
        if (isNaN(idx)) return;

        if (confirm("Are you sure you want to cancel this order?")) {
          orders.splice(idx, 1);
          saveOrders();
          renderOrders();
          showMessage(`<div class="alert alert-danger">❌ Order canceled successfully.</div>`);
        }
      });
    }

    // ✅ Render cart
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

    // Remove cart item
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

    // ✅ Confirm order
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

        const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

        orders.push(orderData);
        saveOrders();

        // Clear cart and update both sections
        cart = [];
        saveCart();
        renderCart();
        renderOrders();

        showMessage(`<div class="alert alert-success">
          ✅ Order confirmed for <strong>${escapeHtml(nameVal)}</strong>!<br>
          <small>View it in your confirmed orders list.</small>
        </div>`);
      });
    }

    // Initial render
    renderCart();
    renderOrders();
  });
})();
