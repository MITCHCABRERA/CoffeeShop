import { menuData } from './product.js';

document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("addedPopup");
  const menuContainer = document.getElementById("menuSections");

  // Show popup message
  function showPopup(message) {
    if (!popup) return;
    popup.textContent = message;
    popup.classList.add("show");
    setTimeout(() => popup.classList.remove("show"), 2000);
  }

  // Render cards dynamically
  menuData.forEach(section => {
    const sectionTitle = document.createElement("h3");
    sectionTitle.textContent = section.section;
    sectionTitle.classList.add("mt-4");
    menuContainer.appendChild(sectionTitle);

    const row = document.createElement("div");
    row.classList.add("row", "row-cols-1", "row-cols-md-3", "g-4", "mb-4");

    section.items.forEach(item => {
      const col = document.createElement("div");
      col.classList.add("col");

      col.innerHTML = `
        <div class="card h-100">
          <img src="${item.img}" class="card-img-top" alt="${item.name}">
          <div class="card-body">
            <h5 class="card-title">${item.name}</h5>
            <p class="card-text">${item.desc}</p>
          </div>
          <div class="card-footer d-flex justify-content-between align-items-center">
            <span class="badge bg-success">&#8369; ${Object.values(item.sizes)[0]}</span>
            <button class="btn btn-sm btn-dark" 
                    data-bs-toggle="modal" 
                    data-bs-target="#coffeeModal" 
                    data-name="${item.name}" 
                    data-img="${item.img}"
                    data-desc="${item.desc}" 
                    data-sizes='${JSON.stringify(item.sizes)}'>
              Details
            </button>
          </div>
        </div>
      `;
      row.appendChild(col);
    });

    menuContainer.appendChild(row);
  });

  // Modal dynamic content
  const coffeeModal = document.getElementById("coffeeModal");
  const addToCartBtn = coffeeModal.querySelector(".btn-primary");
  let currentItem = {};

  coffeeModal.addEventListener("show.bs.modal", event => {
    const button = event.relatedTarget;
    const name = button.getAttribute("data-name");
    const img = button.getAttribute("data-img");
    const desc = button.getAttribute("data-desc");
    const sizes = JSON.parse(button.getAttribute("data-sizes"));

    document.getElementById("modalTitle").textContent = name;
    document.getElementById("modalDescription").textContent = desc;
    document.getElementById("modalImage").src = img;

    const sizeSelect = document.getElementById("modalSize");
    sizeSelect.innerHTML = "";
    for (let size in sizes) {
      const option = document.createElement("option");
      option.value = sizes[size];
      option.textContent = `${size} - ₱${sizes[size]}`;
      sizeSelect.appendChild(option);
    }

    document.getElementById("modalPrice").textContent = parseFloat(Object.values(sizes)[0]).toFixed(2);

    // Store current item
    currentItem = { name, sizes };
  });

  // Update price dynamically
  document.getElementById("modalSize").addEventListener("change", function () {
    document.getElementById("modalPrice").textContent = parseFloat(this.value).toFixed(2);
  });

  // ✅ Add to cart logic (from your old code)
  addToCartBtn.addEventListener("click", () => {
    const selectedOption = document.getElementById("modalSize").selectedOptions[0].textContent;
    const selectedSize = selectedOption.split(" - ")[0];
    const price = parseFloat(document.getElementById("modalPrice").textContent);
    const name = currentItem.name + ` (${selectedSize})`;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find(i => i.name === name);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ name, price, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    showPopup(`${name} added to cart ✅`);

    const modal = bootstrap.Modal.getInstance(coffeeModal);
    modal.hide();
  });
});
