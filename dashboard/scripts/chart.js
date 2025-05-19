async function carregarDadosEvasao() {
  try {
    const response = await fetch("/api/evasao"); //substituir pela api
    const data = await response.json();
    const labels = data.map((item) => item.regiao);
    const valores = data.map((item) => item.taxa);
    const dataEvasao = {
      labels: labels,
      datasets: [
        {
          label: "Taxa de Evasão",
          data: valores,
          backgroundColor: "rgba(255, 99, 132, 0.7)",
        },
      ],
    };
    const configEvasao = {
      type: "bar",
      data: dataEvasao,
      options: {
        scales: {
          y: {
            beginAtZero: true,
            max: 20,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: false,
          },
        },
      },
    };
    const graficoEvasaoCanvas = document
      .getElementById("graficoEvasao")
      .getContext("2d");
    new Chart(graficoEvasaoCanvas, configEvasao);
  } catch (error) {
    console.error("Erro ao carregar dados de evasão:", error);
  }
}

async function carregarDadosInternet() {
  try {
    const response = await fetch("/api/internet"); //substituir pela api
    const data = await response.json();
    const labels = ["Janeiro", "Abril", "Agosto", "Dezembro"];
    const datasets = Object.keys(data).map((regiao) => ({
      label: regiao,
      data: [
        data[regiao].janeiro,
        data[regiao].abril,
        data[regiao].agosto,
        data[regiao].dezembro,
      ],
      borderColor: gerarCorAleatoria(),
      fill: false,
    }));
    const dataInternet = {
      labels: labels,
      datasets: datasets,
    };
    const configInternet = {
      type: "line",
      data: dataInternet,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
        plugins: {
          title: {
            display: false,
          },
        },
      },
    };
    const graficoInternetCanvas = document
      .getElementById("graficoInternet")
      .getContext("2d");
    new Chart(graficoInternetCanvas, configInternet);
  } catch (error) {
    console.error("Erro ao carregar dados de internet:", error);
  }
}

function gerarCorAleatoria() {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, 1)`;
}

document.addEventListener("DOMContentLoaded", () => {
  carregarDadosEvasao();
  carregarDadosInternet();
});
