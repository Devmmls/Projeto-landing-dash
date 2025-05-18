 document.addEventListener("DOMContentLoaded", () => {
  const anoSelect = document.getElementById("ano");
  const estadoSelect = document.getElementById("estado");
  const cidadeSelect = document.getElementById("cidade");
  const idebSpan = document.getElementById("ideb-valor");
  const mensagemStatus = document.getElementById("mensagem-status");

  async function buscarIdeb() {
    const ano = anoSelect.value;
    let id = cidadeSelect.value !== "0" ? cidadeSelect.value : estadoSelect.value;

    const url = https://api.qedu.org.br/v1/ideb?id=${id}&ano=${ano};
    mensagemStatus.textContent = "Carregando IDEB...";

    try {
      const resposta = await fetch(url);
      if (!resposta.ok) throw new Error("Erro na resposta da API");

      const dados = await resposta.json();

      if (dados && dados.length > 0 && dados[0].nota_geral) {
        idebSpan.textContent = dados[0].nota_geral;
        mensagemStatus.textContent = Dados carregados para o ano ${ano};
      } else {
        idebSpan.textContent = "--";
        mensagemStatus.textContent = "Dados não encontrados para os filtros selecionados.";
      }
    } catch (erro) {
      idebSpan.textContent = "--";
      mensagemStatus.textContent = "Erro ao carregar dados. Tente novamente mais tarde.";
      console.error("Erro ao buscar dados IDEB:", erro);
    }
  }

  anoSelect.addEventListener("change", buscarIdeb);
  estadoSelect.addEventListener("change", buscarIdeb);
  cidadeSelect.addEventListener("change", buscarIdeb);

  buscarIdeb(); // busca inicial
});