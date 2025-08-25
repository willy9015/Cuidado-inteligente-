// auth.js

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      // Simulación de login (futuro reemplazo por backend real)
      if (email === "admin@nestle.com" && password === "123456") {
        alert("Bienvenido, administrador de Nestlé!");
        window.location.href = "index.html";
      } else {
        alert("Credenciales incorrectas. Intenta nuevamente.");
      }
    });
  }
});
