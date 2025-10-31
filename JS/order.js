const loginForm = document.getElementById('loginForm');
const loginTitle = document.getElementById('loginTitle');
const toggleRole = document.getElementById('toggleRole');

let isAdmin = false;

// Switch between user/admin login
toggleRole.addEventListener('click', () => {
  isAdmin = !isAdmin;

  if (isAdmin) {
    loginTitle.textContent = "Admin Login";
    toggleRole.textContent = "Login as User";
  } else {
    loginTitle.textContent = "User Login";
    toggleRole.textContent = "Login as Admin";
  }
});

// Handle form submit
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (isAdmin) {
    if (username === "admin" && password === "admin123") {
      window.location.href = "admin-panel.html"; // go to admin
    } else {
      alert("Invalid admin credentials!");
    }
  } else {
    if (username === "user" && password === "user123") {
      window.location.href = "user-home.html"; // go to user page
    } else {
      alert("Invalid user credentials!");
    }
  }
});
