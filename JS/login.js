// JS/login.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("login.js loaded");

  const loginForm = document.getElementById("loginForm");
  const loginTitle = document.getElementById("loginTitle");
  const toggleRole = document.getElementById("toggleRole");
  const errorMessage = document.getElementById("errorMessage");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  if (!loginForm || !toggleRole || !loginTitle) {
    console.error("login.js: Missing required elements");
    return;
  }

  // current mode: false = user, true = admin
  let isAdmin = false;

  // Demo credentials
  const adminCred = { username: "admin", password: "admin123" };
  const userCred  = { username: "user",  password: "user123" };

  // Helper to update UI when switching mode
  function updateModeUI() {
    if (isAdmin) {
      loginTitle.textContent = "Admin Login";
      toggleRole.textContent = "Switch to User Login";
      usernameInput.placeholder = "Username";
      passwordInput.placeholder = "Password";
      usernameInput.value = "";
      passwordInput.value = "";
      errorMessage.textContent = "";
      toggleRole.setAttribute("aria-pressed","true");
    } else {
      loginTitle.textContent = "User Login";
      toggleRole.textContent = "Login as Admin";
      usernameInput.placeholder = "Username";
      passwordInput.placeholder = "Password";
      usernameInput.value = "";
      passwordInput.value = "";
      errorMessage.textContent = "";
      toggleRole.setAttribute("aria-pressed","false");
    }
  }

  // toggle button
  toggleRole.addEventListener("click", () => {
    isAdmin = !isAdmin;
    updateModeUI();
    console.log("login.js: mode changed. isAdmin =", isAdmin);
  });

  // form submit
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    errorMessage.textContent = "";

    const u = usernameInput.value.trim();
    const p = passwordInput.value.trim();
    console.log("login.js: submit", {u,p,isAdmin});

    if (isAdmin) {
      if (u === adminCred.username && p === adminCred.password) {
        console.log("login.js: admin success - redirecting to admin.html");
        sessionStorage.setItem("loggedInUser", "admin"); // save session
        window.location.href = "admin.html";
        return;
      } else {
        errorMessage.textContent = "Invalid admin username or password.";
        return;
      }
    } else {
      if (u === userCred.username && p === userCred.password) {
        console.log("login.js: user success - redirecting to site index");
        sessionStorage.setItem("loggedInUser", "user"); // save session
        window.location.href = "../index.html";
        return;
      } else {
        errorMessage.textContent = "Invalid user username or password.";
        return;
      }
    }
  });

  // set initial placeholders
  updateModeUI();
});
