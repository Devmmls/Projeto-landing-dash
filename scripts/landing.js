document.addEventListener("DOMContentLoaded", function () {
  const botaoDash = document.getElementById("btn-dash");
  const botaoDash1 = document.getElementById("btn-dash-inicial");
  const botaoDash2 = document.getElementById("btn-dash-acesso");

  if (botaoDash) {
    botaoDash.addEventListener("click", function () {
      window.location.href = "./dashboard/dashboard.html";
    });
  }

  if (botaoDash1) {
    botaoDash1.addEventListener("click", function () {
      window.location.href = "./dashboard/dashboard.html";
    });
  }

  if (botaoDash2) {
    botaoDash2.addEventListener("click", function () {
      window.location.href = "./dashboard/dashboard.html";
    });
  }
});
