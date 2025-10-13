document.addEventListener("DOMContentLoaded", () => {
  const resForm = document.getElementById("resForm");
  const resMsg = document.getElementById("resMsg");

  // Form fields
  const nameInput = document.getElementById("rname");
  const dateInput = document.getElementById("rdate");
  const timeInput = document.getElementById("rtime");
  const partyInput = document.getElementById("party");
  const requestsInput = document.getElementById("requests");

  // Utility Functions
  function highlightField(input) {
    input.style.border = "2px solid #ff7b7b"; // soft red
    input.style.boxShadow = "0 0 5px #ff7b7b";
  }

  function clearHighlights() {
    [nameInput, dateInput, timeInput, partyInput].forEach(input => {
      input.style.border = "";
      input.style.boxShadow = "";
    });
  }

  function showMessage(text, type = "warning") {
    resMsg.innerHTML = `<div class="alert alert-${type}" role="alert">${text}</div>`;
    setTimeout(() => {
      resMsg.innerHTML = "";
    }, 5000);
  }

  // Save reservation data to localStorage
  function saveReservation(data) {
    let reservations = JSON.parse(localStorage.getItem("reservations")) || [];
    reservations.push(data);
    localStorage.setItem("reservations", JSON.stringify(reservations));
  }

  // Form Submission
  resForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent default form submission
    clearHighlights();

    let missingFields = [];
    if (nameInput.value.trim() === "") missingFields.push("Full Name");
    if (dateInput.value.trim() === "") missingFields.push("Date");
    if (timeInput.value.trim() === "") missingFields.push("Time Slot");
    if (partyInput.value.trim() === "") missingFields.push("Party Size");

    if (missingFields.length > 0) {
      if (nameInput.value.trim() === "") highlightField(nameInput);
      if (dateInput.value.trim() === "") highlightField(dateInput);
      if (timeInput.value.trim() === "") highlightField(timeInput);
      if (partyInput.value.trim() === "") highlightField(partyInput);

      showMessage(`⚠️ Please fill out the following fields: ${missingFields.join(", ")}`, "warning");
      return;
    }

    // All fields are filled
    const reservationData = {
      name: nameInput.value.trim(),
      date: dateInput.value.trim(),
      time: timeInput.value.trim(),
      partySize: partyInput.value.trim(),
      requests: requestsInput.value.trim() || "None",
      timestamp: new Date().toLocaleString()
    };

    saveReservation(reservationData); // Save to localStorage

    showMessage(
      `✅ Thank you, ${nameInput.value}! Your table is reserved for ${partyInput.value} at ${timeInput.value} on ${dateInput.value}.`,
      "success"
    );

    resForm.reset();
  });
});
