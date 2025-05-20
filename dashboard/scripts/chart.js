// Variáveis para armazenar as instâncias dos gráficos
let evasaoChart = null;
let internetChart = null;

// Função para gerar cores aleatórias (opcional, se quiser usar cores dinâmicas)
function gerarCorAleatoria() {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r},${g},${b},0.8)`;
}

// Função para obter o ID do território selecionado para a API QEdu
function getTerritoryId(cidadeId, estadoId, regiaoId) {
  if (cidadeId && cidadeId !== "0") {
    return cidadeId;
  }
  if (estadoId && estadoId !== "0") {
    return estadoId;
  }
  // Se nenhum estado ou cidade for selecionado, retorna "brasil"
  return "brasil";
}

/**
 * Carrega e renderiza o gráfico de Taxa de Evasão.
 * @param {string} QEDU_API_TOKEN - Sua chave da API QEdu.
 * @param {string} ano - O ano selecionado.
 * @param {string} cidadeId - O ID da cidade selecionada (pode ser "0").
 * @param {string} estadoId - O ID do estado selecionado (pode ser "0").
 * @param {string} regiaoId - O ID da região selecionada (pode ser "0").
 */
async function carregarDadosEvasao(
  QEDU_API_TOKEN,
  ano,
  cidadeId,
  estadoId,
  regiaoId
) {
  try {
    const id = getTerritoryId(cidadeId, estadoId, regiaoId);
    const urlRendimento = `https://api.qedu.org.br/v1/rendimento?id=${id}&ano=${ano}`;

    const response = await fetch(urlRendimento, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${QEDU_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error(
        `Erro na API QEdu (Evasão): ${response.status} - ${response.statusText}`
      );
      // Exibe mensagem de erro no gráfico
      if (evasaoChart) evasaoChart.destroy();
      const ctx = document.getElementById("graficoEvasao").getContext("2d");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.font = "14px Arial";
      ctx.fillStyle = "red";
      ctx.textAlign = "center";
      ctx.fillText(
        "Erro ao carregar dados de evasão.",
        ctx.canvas.width / 2,
        ctx.canvas.height / 2
      );
      return;
    }

    const data = await response.json();
    const rendimentoData =
      data.data && data.data.length > 0 ? data.data[0] : null;

    let taxaAbandono = 0;
    let labelEvasao = "Taxa de Evasão"; // Default label

    // Verifica se os dados necessários estão presentes e se a taxa de abandono não é indefinida
    if (rendimentoData && rendimentoData.taxa_abandono !== undefined) {
      taxaAbandono = rendimentoData.taxa_abandono;
      // Define o label do gráfico baseado nos filtros
      if (cidadeId !== "0") {
        labelEvasao = `Evasão em ${
          document.getElementById("cidade").options[
            document.getElementById("cidade").selectedIndex
          ].text
        }`;
      } else if (estadoId !== "0") {
        labelEvasao = `Evasão no ${
          document.getElementById("estado").options[
            document.getElementById("estado").selectedIndex
          ].text
        }`;
      } else {
        labelEvasao = `Evasão no Brasil`;
      }
    } else {
      console.warn(
        "Dados de taxa de abandono não encontrados para a seleção atual."
      );
      if (evasaoChart) evasaoChart.destroy();
      const ctx = document.getElementById("graficoEvasao").getContext("2d");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.font = "14px Arial";
      ctx.fillStyle = "gray";
      ctx.textAlign = "center";
      ctx.fillText(
        "Dados de evasão não disponíveis.",
        ctx.canvas.width / 2,
        ctx.canvas.height / 2
      );
      return;
    }

    if (evasaoChart) {
      evasaoChart.destroy();
    }

    const dataEvasao = {
      labels: [labelEvasao],
      datasets: [
        {
          label: "Taxa de Evasão (%)",
          data: [taxaAbandono],
          backgroundColor: "rgba(255, 99, 132, 0.7)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    };

    const configEvasao = {
      type: "bar",
      data: dataEvasao,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 30, // Ajuste o max conforme a expectativa
            title: {
              display: true,
              text: "Taxa de Evasão (%)",
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
                return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
              },
            },
          },
        },
      },
    };

    const graficoEvasaoCanvas = document
      .getElementById("graficoEvasao")
      .getContext("2d");
    evasaoChart = new Chart(graficoEvasaoCanvas, configEvasao);
  } catch (error) {
    console.error("Erro ao carregar dados de evasão:", error);
    if (evasaoChart) evasaoChart.destroy();
    const ctx = document.getElementById("graficoEvasao").getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = "14px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText(
      "Erro ao carregar dados de evasão.",
      ctx.canvas.width / 2,
      ctx.canvas.height / 2
    );
  }
}

/**
 * Carrega e renderiza o gráfico de Acesso à Internet.
 * @param {string} QEDU_API_TOKEN - Sua chave da API QEdu.
 * @param {string} ano - O ano selecionado.
 * @param {string} cidadeId - O ID da cidade selecionada (pode ser "0").
 * @param {string} estadoId - O ID do estado selecionado (pode ser "0").
 * @param {string} regiaoId - O ID da região selecionada (pode ser "0").
 */
async function carregarDadosInternet(
  QEDU_API_TOKEN,
  ano,
  cidadeId,
  estadoId,
  regiaoId
) {
  try {
    const id = getTerritoryId(cidadeId, estadoId, regiaoId);
    const urlCensoTerritorio = `https://api.qedu.org.br/v1/censo/territorio?id=${id}&ano=${ano}`;

    const response = await fetch(urlCensoTerritorio, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${QEDU_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error(
        `Erro na API QEdu (Censo Território - Internet): ${response.status} - ${response.statusText}`
      );
      if (internetChart) internetChart.destroy();
      const ctx = document.getElementById("graficoInternet").getContext("2d");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.font = "14px Arial";
      ctx.fillStyle = "red";
      ctx.textAlign = "center";
      ctx.fillText(
        "Erro ao carregar dados de internet.",
        ctx.canvas.width / 2,
        ctx.canvas.height / 2
      );
      return;
    }

    const data = await response.json();
    const censoData = data.data && data.data.length > 0 ? data.data[0] : null;

    let percentagemInternet = 0;
    let labelInternet = "Acesso à Internet nas Escolas";

    // Verifica se os dados necessários estão presentes e se não são indefinidos
    if (
      censoData &&
      censoData.qtd_escolas !== undefined &&
      censoData.internet_computador_alunos !== undefined
    ) {
      const totalEscolas = censoData.qtd_escolas;
      const escolasComInternet = censoData.internet_computador_alunos;

      if (totalEscolas > 0) {
        percentagemInternet = (
          (escolasComInternet / totalEscolas) *
          100
        ).toFixed(1);
      } else {
        percentagemInternet = 0;
      }

      // Define o label do gráfico baseado nos filtros
      if (cidadeId !== "0") {
        labelInternet = `Internet em ${
          document.getElementById("cidade").options[
            document.getElementById("cidade").selectedIndex
          ].text
        }`;
      } else if (estadoId !== "0") {
        labelInternet = `Internet no ${
          document.getElementById("estado").options[
            document.getElementById("estado").selectedIndex
          ].text
        }`;
      } else {
        labelInternet = `Internet no Brasil`;
      }
    } else {
      console.warn(
        "Dados de internet (qtd_escolas ou internet_computador_alunos) não encontrados para a seleção atual."
      );
      if (internetChart) internetChart.destroy();
      const ctx = document.getElementById("graficoInternet").getContext("2d");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.font = "14px Arial";
      ctx.fillStyle = "gray";
      ctx.textAlign = "center";
      ctx.fillText(
        "Dados de internet não disponíveis.",
        ctx.canvas.width / 2,
        ctx.canvas.height / 2
      );
      return;
    }

    if (internetChart) {
      internetChart.destroy();
    }

    const dataInternet = {
      labels: [labelInternet],
      datasets: [
        {
          label: "Escolas com Internet (%)",
          data: [percentagemInternet],
          backgroundColor: "rgba(75, 192, 192, 0.7)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };

    const configInternet = {
      type: "bar",
      data: dataInternet,
      options: {
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
                return `${context.dataset.label}: ${context.raw}%`;
              },
            },
          },
        },
      },
    };

    const graficoInternetCanvas = document
      .getElementById("graficoInternet")
      .getContext("2d");
    internetChart = new Chart(graficoInternetCanvas, configInternet);
  } catch (error) {
    console.error("Erro ao carregar dados de internet:", error);
    if (internetChart) internetChart.destroy();
    const ctx = document.getElementById("graficoInternet").getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = "14px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText(
      "Erro ao carregar dados de internet.",
      ctx.canvas.width / 2,
      ctx.canvas.height / 2
    );
  }
}
