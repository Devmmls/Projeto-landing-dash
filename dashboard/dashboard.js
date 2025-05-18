 document.addEventListener("DOMContentLoaded", () => {
  const anoSelect = document.getElementById("ano");
  const estadoSelect = document.getElementById("estado");
  const cidadeSelect = document.getElementById("cidade");
  const idebSpan = document.getElementById("ideb-valor"); // Se você tiver essa seção ainda
  const idebBrasilSpan = document.getElementById("ideb-brasil");
  const descricaoIdeb = document.getElementById("descricao-ideb");

  async function buscarIdeb() {
    const ano = anoSelect.value;
    const cidade = cidadeSelect.value;
    const estado = estadoSelect.value;

    // Usa cidade se selecionada, senão estado
    const id = cidade !== "0" ? cidade : estado;

    const url = `https://api.qedu.org.br/v1/ideb?id=${id}&ano=${ano}`;

    try {
      const resposta = await fetch(url);

      if (!resposta.ok) {
        throw new Error("Erro na resposta da API");
      }

      const dados = await resposta.json();

      if (dados && dados.length > 0 && dados[0].nota_geral) {
        if (idebSpan) idebSpan.textContent = dados[0].nota_geral;
        console.log(`IDEB do local selecionado (${id}) para ${ano}:`, dados[0].nota_geral);
      } else {
        if (idebSpan) idebSpan.textContent = "--";
        console.warn("Dados não encontrados para o filtro selecionado.");
      }

    } catch (erro) {
      if (idebSpan) idebSpan.textContent = "--";
      console.error("Erro ao buscar dados IDEB:", erro);
    }
  }

  async function buscarIdebBrasil(ano) {
    const url = `https://api.qedu.org.br/v1/ideb?id=brasil&ano=${ano}`;

    try {
      const resposta = await fetch(url);
      if (!resposta.ok) throw new Error("Erro ao buscar IDEB do Brasil");

      const dados = await resposta.json();
      if (dados && dados.length > 0 && dados[0].nota_geral) {
        idebBrasilSpan.textContent = dados[0].nota_geral;
        descricaoIdeb.textContent = `Nota IDEB Brasil ${ano}`;
      } else {
        idebBrasilSpan.textContent = "--";
        descricaoIdeb.textContent = "IDEB Brasil não disponível";
      }
    } catch (erro) {
      idebBrasilSpan.textContent = "--";
      descricaoIdeb.textContent = "Erro ao buscar IDEB Brasil";
      console.error("Erro ao buscar IDEB Brasil:", erro);
    }
  }

  // Eventos
  anoSelect.addEventListener("change", () => {
    buscarIdeb();
    buscarIdebBrasil(anoSelect.value);
  });

  estadoSelect.addEventListener("change", buscarIdeb);
  cidadeSelect.addEventListener("change", buscarIdeb);

  // Carregamento inicial
  buscarIdeb();
  buscarIdebBrasil(anoSelect.value);
});


