document.addEventListener("DOMContentLoaded", () => {
  const viewBtn = document.getElementById("viewBtn");
  const exportBtn = document.getElementById("exportBtn");
  const clearBtn = document.getElementById("clearBtn");
  const output = document.getElementById("adminOutput");

  // --- Format JSON ---
  const pretty = (obj) => JSON.stringify(obj, null, 2);

  // --- Load and display stored data ---
  function viewData() {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const reservations = JSON.parse(localStorage.getItem("reservations") || "[]");

    if (orders.length === 0 && reservations.length === 0) {
      output.textContent = "📭 No stored data found.";
      return;
    }

    let display = "=== KapeRazzo Admin Data ===\n\n";

    if (orders.length > 0) {
      display += `🧾 ORDERS (${orders.length})\n${pretty(orders)}\n\n`;
    } else {
      display += "🧾 No orders found.\n\n";
    }

    if (reservations.length > 0) {
      display += `📅 RESERVATIONS (${reservations.length})\n${pretty(reservations)}\n`;
    } else {
      display += "📅 No reservations found.\n";
    }

    output.textContent = display;
  }

  // --- Export as JSON file ---
  function exportJSON() {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const reservations = JSON.parse(localStorage.getItem("reservations") || "[]");

    const data = { orders, reservations };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "KapeRazzo_AdminData.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  // --- Clear all stored data ---
  function clearAll() {
    if (confirm("⚠️ Are you sure you want to clear all stored data? This cannot be undone.")) {
      localStorage.removeItem("orders");
      localStorage.removeItem("reservations");
      output.textContent = "✅ All data has been cleared.";
    }
  }

  // Attach event listeners 
  viewBtn.addEventListener("click", viewData);
  exportBtn.addEventListener("click", exportJSON);
  clearBtn.addEventListener("click", clearAll);
});
