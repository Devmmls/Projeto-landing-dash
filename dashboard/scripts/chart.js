let evasaoChart = null;
let internetChart = null;

function displayChartMessage(ctx, message, isError = false) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.font = "14px Arial";
  ctx.fillStyle = isError ? "red" : "blue";
  ctx.textAlign = "center";
  ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2);
}

function getTerritoryIdForCenso(cidadeId, estadoId) {
  if (cidadeId && cidadeId !== "0" && cidadeId !== "Todas") {
    return cidadeId;
  }
  if (estadoId && estadoId !== "0" && estadoId !== "Todos") {
    return estadoId;
  }
  return "21";
}

function getTerritoryIdForIdeb(cidadeId, estadoId) {
  if (cidadeId && cidadeId !== "0" && cidadeId !== "Todas") {
    return cidadeId;
  }
  if (estadoId && estadoId !== "0" && estadoId !== "Todos") {
    return estadoId;
  }
  return "BR";
}

async function carregarDadosEvasao(QEDU_API_TOKEN, ano, cidadeId, estadoId) {
  const canvas = document.getElementById("graficoEvasao");
  const ctx = canvas.getContext("2d");

  if (evasaoChart) {
    evasaoChart.destroy();
    evasaoChart = null;
  }
  displayChartMessage(ctx, "Carregando dados de evasão...");

  try {
    const territoryId = getTerritoryIdForIdeb(cidadeId, estadoId);
    const url = `https://api.qedu.org.br/v1/ideb/aprovacoes?id=${territoryId}&ano=${ano}&ciclo_id=EM`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${QEDU_API_TOKEN}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Erro na requisição de evasão da API QEdu: ${response.status} ${
          response.statusText
        } - ${errorData.message || "Sem detalhes"}`
      );
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.data)) {
      displayChartMessage(
        ctx,
        "Estrutura de dados de evasão inesperada.",
        true
      );
      return;
    }

    const dadosEvasaoFiltro = data.data.find(
      (item) => item.ano === parseInt(ano)
    );

    let taxaAbandono = 0;
    if (
      dadosEvasaoFiltro &&
      dadosEvasaoFiltro.taxa_aprovacao !== undefined &&
      dadosEvasaoFiltro.taxa_aprovacao !== null
    ) {
      taxaAbandono = 100 - dadosEvasaoFiltro.taxa_aprovacao;
      if (taxaAbandono < 0) taxaAbandono = 0;
    } else {
      displayChartMessage(
        ctx,
        "Dados de evasão não disponíveis ou incompletos.",
        true
      );
      return;
    }

    const taxaPermanencia = 100 - taxaAbandono;

    const chartData = {
      labels: ["Taxa de Evasão (%)", "Taxa de Permanência (%)"],
      datasets: [
        {
          data: [taxaAbandono, taxaPermanencia],
          backgroundColor: ["#FF6384", "#36A2EB"],
          hoverBackgroundColor: ["#FF6384", "#36A2EB"],
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.label || "";
              if (label) {
                label += ": ";
              }
              if (context.raw !== null) {
                label += context.raw.toFixed(2) + "%";
              }
              return label;
            },
          },
        },
      },
    };

    evasaoChart = new Chart(ctx, {
      type: "pie",
      data: chartData,
      options: chartOptions,
    });
  } catch (error) {
    console.error("Erro ao carregar dados de evasão:", error);
    if (evasaoChart) {
      evasaoChart.destroy();
      evasaoChart = null;
    }
    displayChartMessage(ctx, "Erro ao carregar dados de evasão.", true);
  }
}

async function carregarDadosInternet(QEDU_API_TOKEN, ano, cidadeId, estadoId) {
  const canvas = document.getElementById("graficoInternet");
  const ctx = canvas.getContext("2d");

  if (internetChart) {
    internetChart.destroy();
    internetChart = null;
  }
  displayChartMessage(ctx, "Carregando dados de internet...");

  try {
    const territoryId = getTerritoryIdForCenso(cidadeId, estadoId);
    const url = `https://api.qedu.org.br/v1/censo/territorio/${territoryId}/estrutura?ano=${ano}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${QEDU_API_TOKEN}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Erro na requisição de internet da API QEdu: ${response.status} ${
          response.statusText
        } - ${errorData.message || "Sem detalhes"}`
      );
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.data)) {
      displayChartMessage(
        ctx,
        "Estrutura de dados de internet inesperada.",
        true
      );
      return;
    }

    const dadosFiltro = data.data.find((item) => item.ano === parseInt(ano));

    if (
      !dadosFiltro ||
      dadosFiltro.qtd_escolas === undefined ||
      dadosFiltro.qtd_escolas === null ||
      dadosFiltro.tecnologia_internet === undefined ||
      dadosFiltro.tecnologia_internet === null
    ) {
      displayChartMessage(
        ctx,
        "Dados de internet não disponíveis ou incompletos.",
        true
      );
      return;
    }

    const escolasComInternet = dadosFiltro.tecnologia_internet;
    const totalEscolas = dadosFiltro.qtd_escolas;

    let percentualComInternet = 0;
    let percentualSemInternet = 100;

    if (totalEscolas > 0) {
      percentualComInternet = (escolasComInternet / totalEscolas) * 100;
      percentualSemInternet = 100 - percentualComInternet;
    }

    const chartData = {
      labels: ["Escolas com Internet", "Escolas sem Internet"],
      datasets: [
        {
          label: "Percentual",
          data: [percentualComInternet, percentualSemInternet],
          backgroundColor: ["#4CAF50", "#FFC107"],
          borderColor: ["#4CAF50", "#FFC107"],
          borderWidth: 1,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: "Percentual de Escolas (%)",
          },
        },
        x: {
          display: false,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw.toFixed(2)}%`;
            },
          },
        },
      },
    };

    internetChart = new Chart(ctx, {
      type: "bar",
      data: chartData,
      options: chartOptions,
    });
  } catch (error) {
    console.error("Erro ao carregar dados de internet:", error);
    if (internetChart) {
      internetChart.destroy();
      internetChart = null;
    }
    displayChartMessage(ctx, "Erro ao carregar dados de internet.", true);
  }
}
