document.addEventListener("DOMContentLoaded", function () {
  const botaoDash = document.getElementById("btn-dash");
  const botaoDash1 = document.getElementById("btn-dash-inicial");
  const botaoDash2 = document.getElementById("btn-dash-acesso");
  if (botaoDash || botaoDash1 || botaoDash2) {
    botaoDash.addEventListener("click", function () {
      window.location.href = "./cadastro/cadastro.html";
    });
  }
});
