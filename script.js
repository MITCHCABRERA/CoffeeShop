/* -----------------------------
   Shared site JS for Quán Cà Phê (updated with cart)
   ----------------------------- */

/* Sample menu data (used across pages) */
const MENU = [
  { id:'c1', cat:'coffee', name:'Espresso', price:120, img:'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?q=80&w=800&auto=format&fit=crop', desc:'Rich, intense single shot.' },
  { id:'c2', cat:'coffee', name:'Cappuccino', price:160, img:'https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=800&auto=format&fit=crop', desc:'Espresso with steamed milk & foam.' },
  { id:'c3', cat:'coffee', name:'Iced Latte', price:170, img:'https://images.unsplash.com/photo-1523365280197-f1783db9fe62?q=80&w=800&auto=format&fit=crop', desc:'Chilled milk over espresso.' },
  { id:'t1', cat:'tea', name:'Jasmine Green Tea', price:120, img:'https://images.unsplash.com/photo-1505575972945-2804b0ee9f6f?q=80&w=800&auto=format&fit=crop', desc:'Fragrant, floral finish.' },
  { id:'t2', cat:'tea', name:'Matcha Latte', price:180, img:'https://images.unsplash.com/photo-1474899351970-801db6d67b54?q=80&w=800&auto=format&fit=crop', desc:'Stone-ground matcha with milk.' },
  { id:'p1', cat:'pastries', name:'Butter Croissant', price:95, img:'https://images.unsplash.com/photo-1604908176997-43162fdf6c3b?q=80&w=800&auto=format&fit=crop', desc:'Flaky, baked daily.' },
  { id:'p2', cat:'pastries', name:'Chocolate Cake', price:140, img:'https://images.unsplash.com/photo-1601972599720-b1cf0b2b5c39?q=80&w=800&auto=format&fit=crop', desc:'Moist, cocoa-rich slice.' },
  { id:'o1', cat:'others', name:'Orange Juice', price:110, img:'https://images.unsplash.com/photo-1571076807833-6c1f1b1b1b3d?q=80&w=800&auto=format&fit=crop', desc:'Freshly squeezed.' }
];

/* Local storage keys */
const STORE_ORDERS = 'qcp_orders';
const STORE_RES = 'qcp_reservations';
const STORE_CART = 'qcp_cart';

/* Utility helpers */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const currency = v => `₱${Number(v).toLocaleString('en-PH')}`;

/* -----------------------------
   Menu rendering (menu.html + index snippet)
   ----------------------------- */
function renderMenu(cat = 'all') {
  const grid = $('#menuGrid') || $('#menuList'); // support different page usages
  if (!grid) return;

  const items = MENU.filter(it => (cat === 'all' ? true : it.cat === cat));
  grid.innerHTML = items.map(it => `
    <article class="menu-card" data-id="${it.id}">
      <img src="${it.img}" alt="${it.name}" />
      <h4>${it.name}</h4>
      <p class="muted">${it.desc}</p>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
        <strong style="color:var(--brand)">${currency(it.price)}</strong>
        <button class="btn add-order" data-id="${it.id}">Add</button>
      </div>
    </article>
  `).join('');

  // Add event listeners for Add buttons (menu page quick add)
  $$('.add-order').forEach(btn => {
    btn.removeEventListener('click', menuQuickAddHandler, false);
    btn.addEventListener('click', menuQuickAddHandler, false);
  });
}

function menuQuickAddHandler(e) {
  const id = e.currentTarget.dataset.id;
  const item = MENU.find(x => x.id === id);
  const quick = JSON.parse(localStorage.getItem('qcp_quick') || '[]');
  quick.push({ id: item.id, name: item.name, price: item.price, createdAt: Date.now() });
  localStorage.setItem('qcp_quick', JSON.stringify(quick));
  e.currentTarget.textContent = 'Added ✓';
  setTimeout(() => e.currentTarget.textContent = 'Add', 1200);
}

/* populate order form select (order.html fallback) */
function fillOrderItems() {
  const sel = $('#orderItem');
  if (!sel) return;
  sel.innerHTML = '<option value="">Select an item…</option>' + MENU.map(m =>
    `<option value="${m.id}">${m.name} — ${currency(m.price)}</option>`).join('');
}

/* -----------------------------
   Orders: old legacy form (kept for compatibility)
   ----------------------------- */
function initOrderForm() {
  const form = $('#orderForm');
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#custName').value.trim();
    const phone = $('#custPhone').value.trim();
    const itemId = $('#orderItem').value;
    const qty = parseInt($('#qty').value) || 1;
    const method = $('#method').value;
    const address = $('#address').value.trim();
    const notes = $('#notes').value.trim();
    const out = $('#orderMsg');

    if(!name || !phone || !itemId) {
      out.textContent = 'Please complete required fields.';
      out.style.color = '#b45309';
      return;
    }
    if(method === 'Delivery' && !address) {
      out.textContent = 'Please enter delivery address for delivery orders.';
      out.style.color = '#b45309';
      return;
    }

    const item = MENU.find(m => m.id === itemId);
    const payload = { createdAt: Date.now(), name, phone, itemId, itemName: item.name, qty, method, address, notes };
    const orders = JSON.parse(localStorage.getItem(STORE_ORDERS) || '[]');
    orders.push(payload);
    localStorage.setItem(STORE_ORDERS, JSON.stringify(orders));

    out.textContent = 'Order placed! We will contact you shortly.';
    out.style.color = '#166534';
    form.reset();
    fillOrderItems();
  });
}

/* -----------------------------
   Reservations: handle form (reservation.html)
   ----------------------------- */
function initReservationForm() {
  const form = $('#resForm');
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#rname').value.trim();
    const phone = $('#rphone') ? $('#rphone').value.trim() : '';
    const date = $('#rdate').value;
    const time = $('#rtime').value;
    const party = $('#party').value;
    const requests = $('#requests').value.trim();
    const out = $('#resMsg');

    if(!name || !date || !time || !party) {
      out.textContent = 'Please fill out required fields.';
      out.style.color = '#b45309';
      return;
    }
    // date validation: selected date >= today
    const selDate = new Date(date + 'T00:00:00');
    const today = new Date(); today.setHours(0,0,0,0);
    if(selDate < today) {
      out.textContent = 'Please select today or a future date.';
      out.style.color = '#b45309';
      return;
    }

    const payload = { createdAt: Date.now(), name, phone, date, time, party, requests };
    const res = JSON.parse(localStorage.getItem(STORE_RES) || '[]');
    res.push(payload);
    localStorage.setItem(STORE_RES, JSON.stringify(res));

    out.textContent = 'Reservation confirmed! See you soon.';
    out.style.color = '#166534';
    form.reset();
  });
}

/* -----------------------------
   Admin utilities (admin.html)
   ----------------------------- */
function viewData() {
  const out = $('#adminOutput');
  if(!out) return;
  const orders = JSON.parse(localStorage.getItem(STORE_ORDERS) || '[]');
  const reservations = JSON.parse(localStorage.getItem(STORE_RES) || '[]');
  out.textContent = `Orders:\n${JSON.stringify(orders, null, 2)}\n\nReservations:\n${JSON.stringify(reservations, null, 2)}`;
}

function exportData() {
  const data = {
    orders: JSON.parse(localStorage.getItem(STORE_ORDERS) || '[]'),
    reservations: JSON.parse(localStorage.getItem(STORE_RES) || '[]')
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'quancaphe-data.json';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function clearAllData() {
  localStorage.removeItem(STORE_ORDERS);
  localStorage.removeItem(STORE_RES);
  localStorage.removeItem('qcp_quick');
  localStorage.removeItem(STORE_CART);
  const out = $('#adminOutput');
  if(out) out.textContent = 'All data cleared.';
}

/* -----------------------------
   CART: add/remove/checkout (order.html)
   ----------------------------- */
let CART = JSON.parse(localStorage.getItem(STORE_CART) || '[]');

function saveCart() {
  localStorage.setItem(STORE_CART, JSON.stringify(CART));
}

function addToCart(itemId) {
  const item = MENU.find(x => x.id === itemId);
  if(!item) return;
  // check if already in cart
  const found = CART.find(c => c.id === itemId);
  if(found) {
    found.qty += 1;
  } else {
    CART.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
  }
  saveCart();
  renderCart();
}

function removeFromCart(index) {
  CART.splice(index, 1);
  saveCart();
  renderCart();
}

function changeQty(index, newQty) {
  if(newQty <= 0) {
    removeFromCart(index);
    return;
  }
  CART[index].qty = newQty;
  saveCart();
  renderCart();
}

function renderOrderItems() {
  const container = $('#orderMenu');
  if(!container) return;
  container.innerHTML = MENU.map(it => `
    <article class="item-card" data-id="${it.id}">
      <img src="${it.img}" alt="${it.name}">
      <h4>${it.name}</h4>
      <p class="muted">${it.desc}</p>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
        <div class="price">${currency(it.price)}</div>
        <button class="add-to-cart" data-id="${it.id}">Add to Cart</button>
      </div>
    </article>
  `).join('');

  // wire add-to-cart buttons
  $$('.add-to-cart').forEach(btn => {
    btn.removeEventListener('click', addToCartClickHandler, false);
    btn.addEventListener('click', addToCartClickHandler, false);
  });
}

function addToCartClickHandler(e) {
  const id = e.currentTarget.dataset.id;
  addToCart(id);
  // small UI feedback
  const el = e.currentTarget;
  el.textContent = 'Added ✓';
  setTimeout(() => el.textContent = 'Add to Cart', 900);
}

function renderCart() {
  const list = $('#cartList');
  const totalEl = $('#cartTotal');
  const msg = $('#cartMsg');
  if(!list || !totalEl) return;

  list.innerHTML = '';
  let total = 0;
  if(CART.length === 0) {
    list.innerHTML = '<p class="muted">Your cart is empty. Add some treats ☕</p>';
    totalEl.textContent = '₱0';
    return;
  }

  CART.forEach((it, idx) => {
    const itemTotal = it.price * it.qty;
    total += itemTotal;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="meta">
        <strong>${it.name}</strong>
        <small class="muted">${currency(it.price)} each</small>
      </div>
      <div class="controls">
        <button aria-label="decrease" class="qty-btn" data-idx="${idx}" data-delta="-1">−</button>
        <span>${it.qty}</span>
        <button aria-label="increase" class="qty-btn" data-idx="${idx}" data-delta="1">+</button>
        <button aria-label="remove" class="remove-btn" data-idx="${idx}">✕</button>
      </div>
    `;
    list.appendChild(div);
  });

  totalEl.textContent = currency(total);

  // wire qty & remove buttons
  $$('.qty-btn').forEach(b => {
    b.onclick = (e) => {
      const idx = Number(b.dataset.idx);
      const delta = Number(b.dataset.delta);
      changeQty(idx, CART[idx].qty + delta);
    };
  });
  $$('.remove-btn').forEach(b => {
    b.onclick = () => removeFromCart(Number(b.dataset.idx));
  });
}

function initCartCheckout() {
  const confirmBtn = $('#confirmCart');
  const clearBtn = $('#clearCart');
  if(confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const out = $('#cartMsg');
      const name = $('#cartName').value.trim();
      const phone = $('#cartPhone').value.trim();
      const method = $('#cartMethod').value;
      const address = $('#cartAddress').value.trim();
      const payment = $('#cartPayment').value;

      if(out) { out.textContent = ''; out.style.color = ''; }

      if(CART.length === 0) {
        out.textContent = '⚠️ Your cart is empty.';
        out.style.color = '#b45309';
        return;
      }
      if(!name || !phone) {
        out.textContent = '⚠️ Please enter your full name and phone number.';
        out.style.color = '#b45309';
        return;
      }
      if(method === 'Delivery' && !address) {
        out.textContent = '⚠️ Delivery address is required for delivery orders.';
        out.style.color = '#b45309';
        return;
      }
      if(!payment) {
        out.textContent = '⚠️ Please select a payment method.';
        out.style.color = '#b45309';
        return;
      }

      // Build order payload
      const items = CART.map(i => ({ id:i.id, name:i.name, price:i.price, qty:i.qty }));
      const total = items.reduce((s,it) => s + it.price*it.qty, 0);
      const payload = {
        createdAt: Date.now(),
        items,
        total,
        customer: { name, phone, method, address, payment },
        status: 'new'
      };

      // Save to local storage
      const orders = JSON.parse(localStorage.getItem(STORE_ORDERS) || '[]');
      orders.push(payload);
      localStorage.setItem(STORE_ORDERS, JSON.stringify(orders));

      CART = [];
      saveCart();
      renderCart();

      out.textContent = `✅ Thank you, ${name}! Your ${method.toLowerCase()} order has been placed using ${payment}.`;
      out.style.color = '#166534';

      $('#cartName').value = '';
      $('#cartPhone').value = '';
      $('#cartAddress').value = '';
      $('#cartMethod').value = 'Pickup';
      $('#cartPayment').value = '';
    });
  }
  // ... clearBtn stays same
}


/* -----------------------------
   Initialization for pages
   ----------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // render menu elements if on menu page or index featured snippet
  renderMenu('all');

  // fill order item select on order page (legacy)
  fillOrderItems();

  // wire forms
  initOrderForm();
  initReservationForm();

  // admin buttons
  const viewBtn = $('#viewBtn');
  if(viewBtn) viewBtn.addEventListener('click', viewData);
  const exportBtn = $('#exportBtn');
  if(exportBtn) exportBtn.addEventListener('click', exportData);
  const clearBtn = $('#clearBtn');
  if(clearBtn) clearBtn.addEventListener('click', () => {
    if(confirm('Clear all orders and reservations?')) clearAllData();
  });

  // CART: if order page present, render order items and cart
  if($('#orderMenu')) {
    renderOrderItems();
    // if a stored cart exists, restore it
    CART = JSON.parse(localStorage.getItem(STORE_CART) || '[]');
    renderCart();
    initCartCheckout();
  }
});

// ... existing cart/order code in script.js ...

function handleCartPaymentChange() {
  const payment = document.getElementById("cartPayment").value;
  const requirements = document.getElementById("paymentRequirements");
  const account = document.getElementById("cartAccount");
  const ref = document.getElementById("cartRef");

  if (payment === "GCash" || payment === "PayMaya" || payment === "Bank Transfer") {
    requirements.style.display = "block";
    account.required = true;
    ref.required = true;
  } else {
    requirements.style.display = "none";
    account.required = false;
    ref.required = false;
    account.value = "";
    ref.value = "";
  }
}
