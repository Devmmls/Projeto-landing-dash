document.addEventListener("DOMContentLoaded", async () => {
  const anoSelect = document.getElementById("ano");
  const regiaoSelect = document.getElementById("regiao");
  const estadoSelect = document.getElementById("estado");
  const cidadeSelect = document.getElementById("cidade");

  const idebSpan = document.getElementById("ideb-valor");
  const idebBrasilSpan = document.getElementById("ideb-brasil");
  const descricaoIdebBrasil = document.getElementById("descricao-ideb");
  const descricaoIdebLocal = document.querySelector(
    ".indicadores-grid .indicador:nth-child(2) .indicador-descricao"
  );

  const escolasQuadraSpan = document.getElementById("escolas-quadra");
  const escolasBanheiroSpan = document.getElementById("escolas-banheiro");
  const escolasInternetSpan = document.getElementById("escolas-internet");
  const escolasBibliotecaSpan = document.getElementById("escolas-biblioteca");
  const escolasLabInformaticaSpan = document.getElementById(
    "escolas-lab-informatica"
  );
  const taxaEvasaoSpan = document.getElementById("taxa-evasao");

  const QEDU_API_TOKEN = "iYnB1spKXMnwYCN7wPZ4KoQjeqGuzHRQTiEHL8ej";

  async function popularEstados() {
    try {
      const response = await fetch("https://api.qedu.org.br/v1/estados", {
        headers: { Authorization: `Bearer ${QEDU_API_TOKEN}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data && Array.isArray(data.data)) {
        estadoSelect.innerHTML = '<option value="0">Todos</option>';
        data.data.forEach((estado) => {
          const option = document.createElement("option");
          option.value = estado.id;
          option.textContent = estado.nome;
          estadoSelect.appendChild(option);
        });
      } else {
        console.warn("Estrutura de dados de estados inesperada:", data);
        estadoSelect.innerHTML =
          '<option value="0">Erro ao carregar estados</option>';
      }
    } catch (error) {
      console.error("Erro ao popular estados:", error);
      estadoSelect.innerHTML =
        '<option value="0">Erro ao carregar estados</option>';
    }
  }

  async function popularCidades(estadoId) {
    cidadeSelect.innerHTML = '<option value="0">Todas</option>';
    if (estadoId && estadoId !== "0" && estadoId !== "Todos") {
      try {
        const response = await fetch(
          `https://api.qedu.org.br/v1/estados/${estadoId}/municipios`,
          { headers: { Authorization: `Bearer ${QEDU_API_TOKEN}` } }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data && Array.isArray(data.data)) {
          cidadeSelect.innerHTML = '<option value="0">Todas</option>';
          data.data.forEach((cidade) => {
            const option = document.createElement("option");
            option.value = cidade.id;
            option.textContent = cidade.nome;
            cidadeSelect.appendChild(option);
          });
        } else {
          console.warn("Estrutura de dados de cidades inesperada:", data);
          cidadeSelect.innerHTML =
            '<option value="0">Erro ao carregar cidades</option>';
        }
      } catch (error) {
        console.error("Erro ao popular cidades:", error);
        cidadeSelect.innerHTML =
          '<option value="0">Erro ao carregar cidades</option>';
      }
    }
  }

  async function buscarIdebValores() {
    const ano = anoSelect.value;
    const estadoId = estadoSelect.value;
    const cidadeId = cidadeSelect.value;

    let territoryIdLocal;
    if (cidadeId && cidadeId !== "0" && cidadeId !== "Todas") {
      territoryIdLocal = cidadeId;
    } else if (estadoId && estadoId !== "0" && estadoId !== "Todos") {
      territoryIdLocal = estadoId;
    } else {
      territoryIdLocal = "BR";
    }

    try {
      const responseLocal = await fetch(
        `https://api.qedu.org.br/v1/ideb?id=${territoryIdLocal}&ano=${ano}&dependencia_id=2&ciclo_id=EM`,
        { headers: { Authorization: `Bearer ${QEDU_API_TOKEN}` } }
      );
      if (!responseLocal.ok) {
        throw new Error(`HTTP error! status: ${responseLocal.status}`);
      }
      const dataLocal = await responseLocal.json();

      const idebDataLocal =
        dataLocal && Array.isArray(dataLocal.data) && dataLocal.data.length > 0
          ? dataLocal.data[0]
          : null;

      if (idebDataLocal && idebDataLocal.media_ideb) {
        idebSpan.textContent = idebDataLocal.media_ideb.toFixed(2);
        descricaoIdebLocal.textContent = `IDEB do ${
          territoryIdLocal === "BR"
            ? "Brasil"
            : cidadeId !== "0" && cidadeId !== "Todas"
            ? "Município"
            : "Estado"
        }`;
      } else {
        idebSpan.textContent = "N/A";
        descricaoIdebLocal.textContent = "Dados de IDEB local não disponíveis.";
      }

      const idebBrasilResponse = await fetch(
        `https://api.qedu.org.br/v1/ideb?id=BR&ano=${ano}&dependencia_id=2&ciclo_id=EM`,
        { headers: { Authorization: `Bearer ${QEDU_API_TOKEN}` } }
      );
      if (!idebBrasilResponse.ok) {
        throw new Error(`HTTP error! status: ${idebBrasilResponse.status}`);
      }
      const idebBrasilData = await idebBrasilResponse.json();
      const idebBrasilVal =
        idebBrasilData &&
        Array.isArray(idebBrasilData.data) &&
        idebBrasilData.data.length > 0
          ? idebBrasilData.data[0].media_ideb
          : null;

      if (idebBrasilVal) {
        idebBrasilSpan.textContent = idebBrasilVal.toFixed(2);
        descricaoIdebBrasil.textContent = "IDEB do Brasil";
      } else {
        idebBrasilSpan.textContent = "N/A";
        descricaoIdebBrasil.textContent =
          "Dados de IDEB Brasil não disponíveis.";
      }
    } catch (error) {
      console.error("Erro ao buscar valores de IDEB:", error);
      idebSpan.textContent = "Erro";
      idebBrasilSpan.textContent = "Erro";
      descricaoIdebLocal.textContent = "Erro ao carregar IDEB local.";
      descricaoIdebBrasil.textContent = "Erro ao carregar IDEB Brasil.";
    }
  }

  async function buscarIndicadoresGeraisValores() {
    const ano = anoSelect.value;
    const estadoId = estadoSelect.value;
    const cidadeId = cidadeSelect.value;

    let territoryIdForCenso;
    if (cidadeId && cidadeId !== "0" && cidadeId !== "Todas") {
      territoryIdForCenso = cidadeId;
    } else if (estadoId && estadoId !== "0" && estadoId !== "Todos") {
      territoryIdForCenso = estadoId;
    } else {
      territoryIdForCenso = "21";
    }

    const urlCensoEstrutura = `https://api.qedu.org.br/v1/censo/territorio/${territoryIdForCenso}/estrutura?ano=${ano}`;
    const urlIdebAprovacoes = `https://api.qedu.org.br/v1/ideb/aprovacoes?id=${territoryIdForCenso}&ano=${ano}&ciclo_id=EM`;

    try {
      const [responseCenso, responseAprovacoes] = await Promise.all([
        fetch(urlCensoEstrutura, {
          headers: { Authorization: `Bearer ${QEDU_API_TOKEN}` },
        }),
        fetch(urlIdebAprovacoes, {
          headers: { Authorization: `Bearer ${QEDU_API_TOKEN}` },
        }),
      ]);

      if (!responseCenso.ok) {
        throw new Error(
          `Erro Indicadores Gerais (Censo): ${responseCenso.status} ${responseCenso.statusText}`
        );
      }
      if (!responseAprovacoes.ok) {
        throw new Error(
          `Erro Indicadores Gerais (Aprovacoes): ${responseAprovacoes.status} ${responseAprovacoes.statusText}`
        );
      }

      const dataCenso = await responseCenso.json();
      const dataAprovacoes = await responseAprovacoes.json();

      const dadosCensoFiltro =
        dataCenso && Array.isArray(dataCenso.data)
          ? dataCenso.data.find((item) => item.ano === parseInt(ano))
          : null;
      const dadosAprovacoesFiltro =
        dataAprovacoes && Array.isArray(dataAprovacoes.data)
          ? dataAprovacoes.data.find((item) => item.ano === parseInt(ano))
          : null;

      if (dadosCensoFiltro) {
        escolasQuadraSpan.textContent =
          dadosCensoFiltro.dependencias_quadra_esportes || "N/A";
        escolasBanheiroSpan.textContent =
          dadosCensoFiltro.dependencias_sanitario_dentro_predio || "N/A";
        escolasInternetSpan.textContent =
          dadosCensoFiltro.tecnologia_internet || "N/A";
        escolasBibliotecaSpan.textContent =
          dadosCensoFiltro.dependencias_biblioteca || "N/A";
        escolasLabInformaticaSpan.textContent =
          dadosCensoFiltro.dependencias_lab_informatica || "N/A";
      } else {
        escolasQuadraSpan.textContent = "N/A";
        escolasBanheiroSpan.textContent = "N/A";
        escolasInternetSpan.textContent = "N/A";
        escolasBibliotecaSpan.textContent = "N/A";
        escolasLabInformaticaSpan.textContent = "N/A";
      }

      if (
        dadosAprovacoesFiltro &&
        dadosAprovacoesFiltro.taxa_aprovacao !== undefined &&
        dadosAprovacoesFiltro.taxa_aprovacao !== null
      ) {
        const taxaAbandono = (
          100 - dadosAprovacoesFiltro.taxa_aprovacao
        ).toFixed(2);
        taxaEvasaoSpan.textContent =
          Math.max(0, parseFloat(taxaAbandono)) + "%";
      } else {
        taxaEvasaoSpan.textContent = "N/A";
      }
    } catch (error) {
      console.error("Erro ao buscar indicadores gerais:", error);
      escolasQuadraSpan.textContent = "Erro";
      escolasBanheiroSpan.textContent = "Erro";
      escolasInternetSpan.textContent = "Erro";
      escolasBibliotecaSpan.textContent = "Erro";
      escolasLabInformaticaSpan.textContent = "Erro";
      taxaEvasaoSpan.textContent = "Erro";
    }
  }

  async function atualizarDashboard() {
    const ano = anoSelect.value;
    const estadoId = estadoSelect.value;
    const cidadeId = cidadeSelect.value;

    await buscarIdebValores();
    await buscarIndicadoresGeraisValores();

    if (typeof carregarDadosEvasao === "function") {
      await carregarDadosEvasao(QEDU_API_TOKEN, ano, cidadeId, estadoId);
    }
    if (typeof carregarDadosInternet === "function") {
      await carregarDadosInternet(QEDU_API_TOKEN, ano, cidadeId, estadoId);
    }
  }

  anoSelect.addEventListener("change", atualizarDashboard);

  regiaoSelect.addEventListener("change", async () => {
    await popularEstados();
    estadoSelect.value = "0";
    cidadeSelect.value = "0";
    await atualizarDashboard();
  });

  estadoSelect.addEventListener("change", async () => {
    const estadoId = estadoSelect.value;
    await popularCidades(estadoId);
    await atualizarDashboard();
  });

  cidadeSelect.addEventListener("change", atualizarDashboard);

  await popularEstados();
  estadoSelect.value = "21";
  await popularCidades("21");
  cidadeSelect.value = "2111300";
  await atualizarDashboard();
});
