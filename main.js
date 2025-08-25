document.addEventListener("DOMContentLoaded", () => {
  renderNavigation();
  renderHome();
});

function renderNavigation() {
  const nav = document.getElementById("main-nav");

  nav.innerHTML = `
    <a href="index.html">🏠 Inicio</a>
    <a href="login.html">🔐 Iniciar Sesión</a>
    <a href="checklists.html">📋 Checklists</a>
    <a href="capacitaciones.html">🎓 Capacitaciones</a>
    <a href="dashboard.html">📊 Dashboard</a>
  `;
}

function renderHome() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <h2>Bienvenido a Cuidado Inteligente Pro</h2>
    <p>Una plataforma avanzada para gestionar seguridad laboral, capacitaciones, y tareas automatizadas.</p>
    <ul>
      <li>✅ Checklists inteligentes</li>
      <li>🎓 Capacitación automatizada</li>
      <li>🔔 Notificaciones y alertas</li>
      <li>📈 KPIs en tiempo real</li>
    </ul>
  `;
}
