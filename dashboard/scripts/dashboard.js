document.addEventListener("DOMContentLoaded", async () => {
  // Referências aos elementos HTML
  const anoSelect = document.getElementById("ano");
  const regiaoSelect = document.getElementById("regiao");
  const estadoSelect = document.getElementById("estado");
  const cidadeSelect = document.getElementById("cidade");

  // Elementos para exibir os valores dos indicadores
  const idebSpan = document.getElementById("ideb-valor"); // IDEB Local
  const idebBrasilSpan = document.getElementById("ideb-brasil"); // IDEB Brasil
  const descricaoIdebBrasil = document.getElementById("descricao-ideb"); // Descrição do IDEB Brasil
  const descricaoIdebLocal = document.querySelector(
    ".indicadores-grid .indicador:nth-child(2) .indicador-descricao"
  );

  const taxaEvasaoSpan = document.getElementById("taxa-evasao");
  const escolasQuadraSpan = document.getElementById("escolas-quadra");
  const escolasBanheiroSpan = document.getElementById("escolas-banheiro");
  const escolasInternetSpan = document.getElementById("escolas-internet");
  const escolasBibliotecaSpan = document.getElementById("escolas-biblioteca");
  const escolasLabInformaticaSpan = document.getElementById(
    "escolas-lab-informatica"
  );

  const QEDU_API_TOKEN = "f87d48b2-7341-4ff5-8288-34fe287989e9";

  let dadosCensoMaranhao2019 = null;

  // Carrega os dados de infraestrutura do arquivo JSON local (dadosbrutos.json)
  async function carregarDadosCensoLocal() {
    try {
      const response = await fetch("./dadosbrutos.json");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Erro ao carregar dadosbrutos.json: ${response.status} - ${errorText}`
        );
      }
      const data = await response.json();
      dadosCensoMaranhao2019 =
        data.data && data.data.length > 0 ? data.data[0] : null;

      console.log(
        "Dados do Censo Maranhão 2019 carregados:",
        dadosCensoMaranhao2019
      );
    } catch (error) {
      console.error("Erro ao carregar dados do censo:", error);
      dadosCensoMaranhao2019 = null;
    }
  }

  async function popularEstados() {
    try {
      const response = await fetch(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
      );
      if (!response.ok) throw new Error("Erro ao buscar estados do IBGE");
      const estados = await response.json();

      estadoSelect.innerHTML = '<option value="0">Todos</option>';
      estados.forEach((estado) => {
        const option = document.createElement("option");
        option.value = estado.id;
        option.textContent = estado.nome;
        estadoSelect.appendChild(option);
      });

      estadoSelect.value = "21";
    } catch (error) {
      console.error("Erro ao popular estados:", error);
    }
  }

  async function popularCidades(estadoId) {
    cidadeSelect.innerHTML = '<option value="0">Todas</option>';
    if (estadoId === "0") {
      cidadeSelect.disabled = true;
      return;
    }
    cidadeSelect.disabled = false;

    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios?orderBy=nome`
      );
      if (!response.ok) throw new Error("Erro ao buscar cidades do IBGE");
      const cidades = await response.json();

      cidades.forEach((cidade) => {
        const option = document.createElement("option");
        option.value = cidade.id;
        option.textContent = cidade.nome;
        cidadeSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao popular cidades:", error);
    }
  }

  // Busca e exibe o IDEB (local ou Brasil) usando a API do QEdu
  async function buscarIdeb() {
    const ano = anoSelect.value;
    const cidade = cidadeSelect.value;
    const estado = estadoSelect.value;
    const regiao = regiaoSelect.value;

    let id = "brasil";
    let descricaoLocal = "Nota IDEB Selecionado";

    if (cidade !== "0") {
      id = cidade;
      descricaoLocal = `Nota IDEB ${
        cidadeSelect.options[cidadeSelect.selectedIndex].text
      }`;
    } else if (estado !== "0") {
      id = estado;
      descricaoLocal = `Nota IDEB ${
        estadoSelect.options[estadoSelect.selectedIndex].text
      }`;
    } else if (regiao !== "0") {
      if (idebSpan) idebSpan.textContent = "--";
      if (descricaoIdebLocal)
        descricaoIdebLocal.textContent = "Nota IDEB Região (Não disponível)";
      return;
    } else {
      if (idebSpan) idebSpan.textContent = "--";
      if (descricaoIdebLocal)
        descricaoIdebLocal.textContent = "Nota IDEB Selecionado";
      return;
    }

    const urlQedu = `https://api.qedu.org.br/v1/ideb?id=${id}&ano=${ano}`;

    try {
      const resposta = await fetch(urlQedu, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${QEDU_API_TOKEN}`,
        },
      });

      if (!resposta.ok)
        throw new Error(`Erro na API QEdu IDEB: ${resposta.statusText}`);

      const dados = await resposta.json();

      if (
        dados &&
        dados.data &&
        dados.data.length > 0 &&
        dados.data[0].nota_geral !== undefined
      ) {
        // Usar !== undefined para incluir 0 ou null como valores válidos se API retornar
        if (idebSpan) idebSpan.textContent = dados.data[0].nota_geral;
        if (descricaoIdebLocal) descricaoIdebLocal.textContent = descricaoLocal;
      } else {
        if (idebSpan) idebSpan.textContent = "--";
        if (descricaoIdebLocal)
          descricaoIdebLocal.textContent = "Nota IDEB Selecionado (Não disp.)";
      }
    } catch (erro) {
      if (idebSpan) idebSpan.textContent = "--";
      if (descricaoIdebLocal)
        descricaoIdebLocal.textContent = "Erro IDEB Selecionado";
      console.error("Erro ao buscar dados IDEB:", erro);
    }
  }

  async function buscarIdebBrasil(ano) {
    const urlQeduBrasil = `https://api.qedu.org.br/v1/ideb?id=brasil&ano=${ano}`;

    try {
      const resposta = await fetch(urlQeduBrasil, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${QEDU_API_TOKEN}`,
        },
      });
      if (!resposta.ok)
        throw new Error(
          `Erro ao buscar IDEB do Brasil: ${resposta.statusText}`
        );

      const dados = await resposta.json();

      if (
        dados &&
        dados.data &&
        dados.data.length > 0 &&
        dados.data[0].nota_geral !== undefined
      ) {
        // Usar !== undefined para incluir 0 ou null como valores válidos se API retornar
        if (idebBrasilSpan)
          idebBrasilSpan.textContent = dados.data[0].nota_geral;
        if (descricaoIdebBrasil)
          descricaoIdebBrasil.textContent = `Nota IDEB Brasil ${ano}`;
      } else {
        if (idebBrasilSpan) idebBrasilSpan.textContent = "--";
        if (descricaoIdebBrasil)
          descricaoIdebBrasil.textContent = "IDEB Brasil não disponível";
      }
    } catch (erro) {
      if (idebBrasilSpan) idebBrasilSpan.textContent = "--";
      if (descricaoIdebBrasil)
        descricaoIdebBrasil.textContent = "Erro ao buscar IDEB Brasil";
      console.error("Erro ao buscar IDEB Brasil:", erro);
    }
  }

  // Calcula e exibe as métricas de infraestrutura com base nos dados do censo
  function exibirMetricasInfraestrutura() {
    if (!dadosCensoMaranhao2019) {
      console.warn(
        "Dados do Censo Maranhão 2019 não disponíveis para exibir métricas de infraestrutura."
      );
      taxaEvasaoSpan.textContent = "--";
      escolasQuadraSpan.textContent = "--";
      escolasBanheiroSpan.textContent = "--";
      escolasInternetSpan.textContent = "--";
      escolasBibliotecaSpan.textContent = "--";
      escolasLabInformaticaSpan.textContent = "--";
      return;
    }

    const totalEscolas = dadosCensoMaranhao2019.qtd_escolas || 0;

    // Logs para depuração
    console.log("Dados Censo para Infraestrutura:", dadosCensoMaranhao2019);
    console.log("Total de Escolas (qtd_escolas):", totalEscolas);
    console.log(
      "Escolas com Internet (internet_computador_alunos):",
      dadosCensoMaranhao2019.internet_computador_alunos
    );
    console.log(
      "Escolas com Quadra (dependencias_quadra_esportes):",
      dadosCensoMaranhao2019.dependencias_quadra_esportes
    );
    console.log(
      "Escolas com Banheiro (dependencias_sanitario_dentro_predio):",
      dadosCensoMaranhao2019.dependencias_sanitario_dentro_predio
    );
    console.log(
      "Escolas com Biblioteca (dependencias_biblioteca):",
      dadosCensoMaranhao2019.dependencias_biblioteca
    );
    console.log(
      "Escolas com Lab. Info. (dependencias_lab_informatica):",
      dadosCensoMaranhao2019.dependencias_lab_informatica
    );

    const calcPercent = (count) =>
      totalEscolas > 0
        ? (((count || 0) / totalEscolas) * 100).toFixed(1) + "%"
        : "--";

    // Taxa de evasão: valor mockado
    taxaEvasaoSpan.textContent = "17.8%";

    escolasQuadraSpan.textContent = calcPercent(
      dadosCensoMaranhao2019.dependencias_quadra_esportes
    );
    escolasBanheiroSpan.textContent = calcPercent(
      dadosCensoMaranhao2019.dependencias_sanitario_dentro_predio
    );
    escolasInternetSpan.textContent = calcPercent(
      dadosCensoMaranhao2019.internet_computador_alunos
    );
    escolasBibliotecaSpan.textContent = calcPercent(
      dadosCensoMaranhao2019.dependencias_biblioteca
    );
    escolasLabInformaticaSpan.textContent = calcPercent(
      dadosCensoMaranhao2019.dependencias_lab_informatica
    );
  }

  // Função principal para iniciar o dashboard
  async function inicializarDashboard() {
    await carregarDadosCensoLocal();
    await popularEstados();
    await popularCidades(estadoSelect.value);

    // Buscar e exibir o IDEB Brasil
    await buscarIdebBrasil(anoSelect.value);

    // Buscar e exibir o IDEB Local (Maranhão por padrão inicialmente)
    await buscarIdeb();

    // Exibe métricas de infraestrutura APENAS na inicialização, pois os dados são fixos para Maranhão 2019.
    exibirMetricasInfraestrutura();

    // Chama funções de chart.js para carregar gráficos iniciais

    if (typeof carregarDadosEvasao === "function") {
      await carregarDadosEvasao(
        QEDU_API_TOKEN,
        anoSelect.value,
        cidadeSelect.value,
        estadoSelect.value,
        regiaoSelect.value
      );
    }
    if (typeof carregarDadosInternet === "function") {
      await carregarDadosInternet(
        QEDU_API_TOKEN,
        anoSelect.value,
        cidadeSelect.value,
        estadoSelect.value,
        regiaoSelect.value
      );
    }
  }

  // --- Event Listeners dos Filtros ---

  // Ano
  anoSelect.addEventListener("change", async () => {
    await buscarIdebBrasil(anoSelect.value);
    await buscarIdeb();
    // Atualiza gráficos com os novos filtros
    if (typeof carregarDadosEvasao === "function") {
      await carregarDadosEvasao(
        QEDU_API_TOKEN,
        anoSelect.value,
        cidadeSelect.value,
        estadoSelect.value,
        regiaoSelect.value
      );
    }
    if (typeof carregarDadosInternet === "function") {
      await carregarDadosInternet(
        QEDU_API_TOKEN,
        anoSelect.value,
        cidadeSelect.value,
        estadoSelect.value,
        regiaoSelect.value
      );
    }
  });

  // Região
  regiaoSelect.addEventListener("change", async () => {
    const regiaoId = regiaoSelect.value;
    estadoSelect.innerHTML = '<option value="0">Todos</option>';
    cidadeSelect.innerHTML = '<option value="0">Todas</option>';
    cidadeSelect.disabled = true;

    if (regiaoId !== "0") {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/regioes/${regiaoId}/estados?orderBy=nome`
      );
      if (!response.ok)
        console.error("Erro ao buscar estados por região do IBGE");
      const estados = await response.json();
      estados.forEach((estado) => {
        const option = document.createElement("option");
        option.value = estado.id;
        option.textContent = estado.nome;
        estadoSelect.appendChild(option);
      });
    } else {
      await popularEstados(); // Se "Brasil" (valor 0) for selecionado, popula todos os estados novamente
    }

    await buscarIdeb(); // Atualiza IDEB local com base na nova região/estado/cidade
    // Atualiza gráficos com os novos filtros
    if (typeof carregarDadosEvasao === "function") {
      await carregarDadosEvasao(
        QEDU_API_TOKEN,
        anoSelect.value,
        cidadeSelect.value,
        estadoSelect.value,
        regiaoSelect.value
      );
    }
    if (typeof carregarDadosInternet === "function") {
      await carregarDadosInternet(
        QEDU_API_TOKEN,
        anoSelect.value,
        cidadeSelect.value,
        estadoSelect.value,
        regiaoSelect.value
      );
    }
  });

  // Estado
  estadoSelect.addEventListener("change", async () => {
    const estadoId = estadoSelect.value;
    await popularCidades(estadoId); // Popula cidades
    await buscarIdeb(); // Atualiza IDEB local
    // Atualiza gráficos com os novos filtros
    if (typeof carregarDadosEvasao === "function") {
      await carregarDadosEvasao(
        QEDU_API_TOKEN,
        anoSelect.value,
        cidadeSelect.value,
        estadoSelect.value,
        regiaoSelect.value
      );
    }
    if (typeof carregarDadosInternet === "function") {
      await carregarDadosInternet(
        QEDU_API_TOKEN,
        anoSelect.value,
        cidadeSelect.value,
        estadoSelect.value,
        regiaoSelect.value
      );
    }
  });

  // Cidade
  cidadeSelect.addEventListener("change", async () => {
    await buscarIdeb(); // Atualiza IDEB local
    // Atualiza gráficos com os novos filtros
    if (typeof carregarDadosEvasao === "function") {
      await carregarDadosEvasao(
        QEDU_API_TOKEN,
        anoSelect.value,
        cidadeSelect.value,
        estadoSelect.value,
        regiaoSelect.value
      );
    }
    if (typeof carregarDadosInternet === "function") {
      await carregarDadosInternet(
        QEDU_API_TOKEN,
        anoSelect.value,
        cidadeSelect.value,
        estadoSelect.value,
        regiaoSelect.value
      );
    }
  });

  // Inicia o dashboard quando a página é carregada
  inicializarDashboard();
});
