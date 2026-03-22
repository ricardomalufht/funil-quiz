import { useState, useEffect, useRef } from "react";

const STEPS = [
  {
    id: "welcome",
    type: "welcome",
  },
  {
    id: "nome",
    type: "text",
    label: "Qual o seu nome completo?",
    placeholder: "Digite seu nome",
    subtitle: "Vamos personalizar sua experiência.",
  },
  {
    id: "empresa",
    type: "text",
    label: "Qual o nome da sua empresa?",
    placeholder: "Nome da empresa",
    subtitle: "Queremos entender seu contexto.",
  },
  {
    id: "cargo",
    type: "select",
    label: "Qual o seu papel na empresa?",
    subtitle: "Isso nos ajuda a calibrar a conversa.",
    options: [
      "Fundador / CEO — criei a empresa",
      "Sócio com participação ativa na gestão",
      "Filho(a) / sucessor(a) do fundador",
      "Diretor Financeiro / CFO",
      "Diretor Geral / COO",
      "Outro cargo de liderança",
    ],
  },
  {
    id: "qtd_socios",
    type: "select",
    label: "Quantos sócios a empresa tem?",
    subtitle: "Incluindo você, se for sócio.",
    options: [
      "Só eu",
      "2 sócios",
      "3 ou mais sócios",
      "Empresa familiar — pais, filhos ou cônjuges na sociedade",
    ],
  },
  {
    id: "quem_decide",
    type: "select",
    label: "Quando a empresa precisa investir em algo estratégico, quem toma a decisão final?",
    subtitle: "Seja direto. Precisamos garantir que as pessoas certas estejam na reunião para que ela seja produtiva.",
    options: [
      "Eu decido sozinho(a)",
      "Eu e meu(s) sócio(s) decidimos juntos",
      "Na prática, quem decide é outro sócio / o fundador",
      "Precisa de aprovação de conselho ou board",
    ],
  },
  {
    id: "decisor_nome",
    type: "text",
    label: "Quem é essa pessoa que toma a decisão final? Qual o nome e o papel dela na empresa?",
    placeholder: "Ex: João Silva, meu pai, fundador da empresa",
    subtitle: "Vamos convidar essa pessoa para a reunião. Sem o decisor presente, a conversa fica incompleta.",
    condition: (answers) => answers.quem_decide && (answers.quem_decide.includes("outro sócio") || answers.quem_decide.includes("conselho")),
  },
  {
    id: "consciencia_socios",
    type: "select",
    label: "Os outros sócios ou decisores sabem que você está buscando uma solução para o financeiro?",
    subtitle: "Isso nos ajuda a entender o nível de alinhamento interno antes da reunião.",
    options: [
      "Sim, estamos todos alinhados e buscando juntos",
      "Sabem por cima, mas não estão engajados ainda",
      "Não sabem — estou explorando por conta própria",
      "Sabem, mas são céticos ou resistentes à mudança",
    ],
    condition: (answers) => answers.qtd_socios && !answers.qtd_socios.includes("Só eu"),
  },
  {
    id: "segmento",
    type: "text",
    label: "Qual o segmento da sua empresa?",
    placeholder: "Ex: Indústria, distribuição, serviços...",
    subtitle: "Cada segmento tem dinâmicas financeiras distintas.",
  },
  {
    id: "faturamento",
    type: "select",
    label: "Qual a faixa de faturamento anual?",
    subtitle: "Essa informação é confidencial e nos ajuda a dimensionar o cenário.",
    options: [
      "Até R$10 milhões",
      "R$10M a R$20M",
      "R$20M a R$50M",
      "R$50M a R$100M",
      "R$100M a R$300M",
      "Acima de R$300M",
    ],
  },
  {
    id: "equipe_financeira",
    type: "select",
    label: "Quantas pessoas cuidam do financeiro na sua empresa hoje?",
    subtitle: "Entender a estrutura nos ajuda a identificar gargalos operacionais.",
    options: [
      "Só eu mesmo",
      "1 a 2 pessoas",
      "3 a 5 pessoas",
      "Mais de 5 pessoas",
    ],
  },
  {
    id: "fluxo_caixa",
    type: "scale",
    label: "De 1 a 5, qual o nível de estruturação do seu fluxo de caixa hoje?",
    subtitle: null,
    contextBox: {
      text: "Para te ajudar a responder:\n\n**Nível 1** — Não existe um fluxo de caixa formal. Você acompanha o saldo bancário e decide no dia a dia com base no que entra e sai.\n\n**Nível 3** — Existe uma planilha ou relatório que é atualizado periodicamente, mas nem sempre é confiável ou usado para tomar decisões importantes.\n\n**Nível 5** — Fluxo de caixa atualizado semanalmente, separado por categorias (operacional, financeiro, investimento), com projeções de curto e médio prazo que guiam decisões estratégicas."
    },
    scaleLabels: ["Inexistente", "Básico", "Razoável", "Estruturado", "Excelente"],
  },
  {
    id: "decisoes",
    type: "select",
    label: "Como são tomadas as decisões financeiras importantes na empresa hoje?",
    subtitle: "A maioria dos empresários de sucesso ainda decide por instinto. A pergunta é: quanto isso está custando?",
    options: [
      "Principalmente por intuição e experiência",
      "Misturo intuição com alguns dados",
      "Baseio em relatórios, mas nem sempre confio neles",
      "Tenho dados confiáveis e processo estruturado",
    ],
  },
  {
    id: "projecao",
    type: "select",
    label: "Você consegue projetar com confiança a posição de caixa da sua empresa nos próximos 3 meses?",
    subtitle: "Essa é uma das perguntas mais reveladoras sobre maturidade financeira.",
    options: [
      "Não, não consigo",
      "Tenho uma ideia geral, mas sem precisão",
      "Consigo com razoável confiança",
      "Sim, com alta precisão",
    ],
  },
  {
    id: "dor_lucro_caixa",
    type: "scale",
    label: "\"Minha empresa é lucrativa no papel, mas o dinheiro não aparece no banco.\"",
    subtitle: "Quanto essa frase se parece com a sua realidade?",
    scaleLabels: ["Não se aplica à minha realidade", "Levemente", "Moderado", "Bastante", "Exatamente isso"],
  },
  {
    id: "endividamento",
    type: "select",
    label: "Qual o nível de endividamento da empresa hoje?",
    subtitle: null,
    contextBox: {
      text: "Para referência:\n\n**Endividamento baixo** — Dívidas pontuais (financiamento de equipamento, capital de giro sazonal). Os juros não pesam no resultado e você dorme tranquilo.\n\n**Endividamento moderado** — Há linhas de crédito ativas e alguma pressão mensal, mas a operação cobre os pagamentos sem sufocar o caixa.\n\n**Endividamento elevado** — Dívidas consomem parte significativa do faturamento. Já renegociou prazos ou trocou dívida cara por barata. Os juros impactam diretamente o resultado.\n\n**Endividamento crítico** — A empresa depende de crédito para operar. Há atrasos, renegociações frequentes ou risco de inadimplência. O caixa é refém das parcelas."
    },
    options: [
      "Baixo — dívidas pontuais, sem pressão",
      "Moderado — tem parcelas e compromissos, mas o caixa não sufoca",
      "Elevado — juros impactam o resultado",
      "Crítico — operação depende de crédito",
    ],
  },
  {
    id: "surpresa_caixa",
    type: "select",
    label: "Nos últimos 3 meses, com que frequência você foi surpreendido por uma situação de caixa que não previu?",
    subtitle: "Imprevistos financeiros recorrentes são um sintoma. Na reunião, vamos falar sobre a causa raiz.",
    options: [
      "Nenhuma vez — tive total controle",
      "Aconteceu uma vez, pontualmente",
      "Acontece pelo menos 1 vez por mês",
      "Acontece quase toda semana",
    ],
  },
  {
    id: "onde_dinheiro",
    type: "textarea",
    label: "Se você pudesse ver exatamente onde cada real da sua empresa foi nos últimos 12 meses, o que você acha que descobriria?",
    placeholder: "Escreva livremente...",
    subtitle: "Essa pergunta é proposital. Guarde sua resposta — vamos revisitar ela na reunião.",
  },
  {
    id: "custo_decisao",
    type: "select",
    label: "Quanto você estima que custou a última decisão financeira errada — ou que demorou demais para ser tomada?",
    subtitle: null,
    contextBox: {
      text: "Exemplos comuns:\n\n• Manter um contrato, fornecedor ou linha de produto que já não dava retorno — e só perceber meses depois.\n• Atrasar uma compra ou investimento e pagar mais caro por urgência ou câmbio.\n• Aceitar condições ruins de crédito por falta de planejamento de caixa.\n• Não demitir ou não contratar no momento certo, gerando custo extra de folha ou perda de receita.\n• Não renegociar prazos com fornecedores quando havia margem para isso."
    },
    options: [
      "Menos de R$50 mil",
      "Entre R$50 mil e R$200 mil",
      "Entre R$200 mil e R$500 mil",
      "Acima de R$500 mil",
      "Não consigo estimar, mas sei que foi significativo",
    ],
  },
  {
    id: "custo_decisao_detalhe",
    type: "textarea",
    label: "O que aconteceu e como você descobriu?",
    placeholder: "Ex: mantivemos um fornecedor caro por 8 meses antes de perceber no extrato, só descobri quando fui comparar orçamentos...",
    subtitle: "Esse tipo de situação é exatamente o que o fluxo de caixa estruturado evita. Vamos usar esse exemplo na reunião.",
    condition: (answers) => answers.custo_decisao && !answers.custo_decisao.includes("Não consigo estimar"),
  },
  {
    id: "tentativas",
    type: "multiselect",
    label: "O que você já tentou para organizar a gestão financeira?",
    subtitle: "Saber o que já foi feito nos ajuda a não repetir caminhos que não funcionaram.",
    options: [
      "Consultoria financeira tradicional",
      "Contratar profissional de finanças (CLT)",
      "Curso ou treinamento financeiro",
      "Tentei estruturar por conta própria",
      "Mentoria ou acompanhamento",
      "Nunca tentei nada específico",
    ],
  },
  {
    id: "resultado_tentativas",
    type: "select",
    label: "Como foi o resultado dessas tentativas?",
    subtitle: "Existe uma razão pela qual a maioria das abordagens tradicionais falha. Vamos explorar isso na reunião.",
    options: [
      "Funcionou parcialmente, mas não sustentou",
      "Não trouxe o resultado esperado",
      "Foi útil, mas falta continuidade",
      "Nunca tentei nada",
    ],
    condition: (answers) => answers.tentativas && !answers.tentativas.includes("Nunca tentei nada específico"),
  },
  {
    id: "perfil_decisao",
    type: "select",
    label: "Quando precisa tomar uma decisão importante no negócio, o que mais pesa pra você?",
    subtitle: "Não tem resposta certa — cada perfil exige uma abordagem diferente. Queremos respeitar o seu.",
    options: [
      "Dados e comparações — preciso ver os números antes de decidir",
      "Confiança e relação — preciso confiar em quem está do outro lado",
      "Resultado e prazo — me mostra o que entrega e em quanto tempo",
      "Prova e referências — preciso ver quem já fez e o resultado que teve",
    ],
  },
  {
    id: "perfil_decisao_decisor",
    type: "select",
    label: "E o principal decisor da empresa — o que mais pesa pra ele(a) na hora de decidir?",
    subtitle: "Se não tiver certeza, escolha o que mais se aproxima. Isso nos ajuda a falar a língua certa na reunião.",
    options: [
      "Dados e comparações — só decide vendo números",
      "Confiança e relação — precisa confiar na pessoa",
      "Resultado e prazo — quer saber o que entrega e quando",
      "Prova e referências — precisa ver quem já fez",
      "Não sei dizer com certeza",
    ],
    condition: (answers) => answers.quem_decide && !answers.quem_decide.includes("sozinho"),
  },
  {
    id: "receio",
    type: "multiselect",
    label: "Se fosse para ter um acompanhamento profissional que guiasse os principais decisores da empresa na organização do fluxo de caixa, o que te preocuparia?",
    subtitle: "Marque com honestidade. Essas respostas são confidenciais e nos ajudam a preparar uma reunião sem rodeios.",
    options: [
      "Já investi em algo parecido e não teve resultado",
      "Medo de depender de uma pessoa externa para o financeiro funcionar",
      "Dúvida se meu time vai conseguir acompanhar",
      "Receio de investir um valor alto e não ver retorno rápido",
      "Não saber se é o momento certo",
      "Nenhuma dessas — estou confiante",
    ],
  },
  {
    id: "receio_decisor",
    type: "textarea",
    label: "E na visão do principal decisor (ou dos outros sócios/familiares), quais seriam as maiores preocupações ou resistências em relação a esse tipo de investimento?",
    placeholder: "Ex: meu pai acha que consultoria não funciona, meu sócio não quer gastar agora, minha mãe é conservadora com investimentos...",
    subtitle: "Entender a visão de cada decisor é fundamental. Quanto mais honesto, mais preparados chegamos na reunião — sem surpresas.",
    condition: (answers) => answers.quem_decide && !answers.quem_decide.includes("sozinho"),
  },
  {
    id: "motivacao_real",
    type: "multiselect",
    label: "Se o financeiro da sua empresa estivesse 100% resolvido amanhã, o que mudaria na prática?",
    subtitle: "Selecione tudo que se aplica. A maioria dos empresários nunca parou pra pensar nisso com clareza.",
    options: [
      "Conseguiria investir em crescimento sem medo de faltar caixa",
      "Pararia de cobrir buraco — sobraria dinheiro de verdade no final do mês",
      "Reduziria juros e renegociaria dívidas em posição de força",
      "Teria segurança pra tirar férias sem o celular na mão",
      "Saberia exatamente quais produtos/serviços valem a pena e quais dão prejuízo",
      "Poderia planejar a saída ou venda da empresa com valor justo",
      "Dormiria melhor — sem a angústia de não saber se fecha o mês",
    ],
  },
  {
    id: "cenario_pratico",
    type: "textarea",
    label: "Imagine que nos próximos 12 meses a empresa tenha total visibilidade do fluxo de caixa e consiga tomar decisões financeiras com segurança. O que muda de concreto?",
    placeholder: "Ex: consigo investir em expansão, reduzo o endividamento em X%, paro de pegar crédito de emergência, sei exatamente quais linhas de produto manter ou cortar...",
    subtitle: "Queremos saber o resultado prático, não o sentimento. Essa resposta vai guiar parte importante da reunião.",
    condition: (answers) => !answers.quem_decide || answers.quem_decide.includes("sozinho"),
  },
  {
    id: "cenario_pratico_decisor",
    type: "textarea",
    label: "Na visão do principal decisor (ou dos sócios em conjunto): se nos próximos 12 meses a empresa tivesse total visibilidade do fluxo de caixa, o que mudaria de concreto?",
    placeholder: "Ex: ele(a) investiria em expansão, reduziria o endividamento, pararia de pegar crédito de emergência, teria clareza sobre quais linhas manter ou cortar...",
    subtitle: "Tente responder pela ótica de quem toma a decisão final. Se não souber, escreva o que você acha — isso já nos ajuda.",
    condition: (answers) => answers.quem_decide && !answers.quem_decide.includes("sozinho"),
  },
  {
    id: "urgencia",
    type: "select",
    label: "O que te fez buscar uma solução agora — e não daqui a 6 meses?",
    subtitle: "Entender o timing nos ajuda a calibrar as prioridades da reunião.",
    options: [
      "Situação crítica — preciso agir agora",
      "Estou em momento de crescimento e preciso de estrutura",
      "Acumulei frustrações e decidi que chega",
      "Alguém me indicou e resolvi explorar",
      "Estou pesquisando, sem urgência definida",
    ],
    condition: (answers) => !answers.quem_decide || answers.quem_decide.includes("sozinho"),
  },
  {
    id: "urgencia_decisor",
    type: "select",
    label: "E o principal decisor — ele também está buscando uma solução para o financeiro ou a iniciativa partiu de você?",
    subtitle: "Essa é uma das perguntas mais importantes do diagnóstico. Seja direto — nos ajuda a preparar a abordagem certa.",
    options: [
      "Ele(a) também está buscando — estamos alinhados",
      "Ele(a) sabe que tem problema, mas ainda não tomou iniciativa",
      "A iniciativa é minha — ele(a) ainda não está convencido(a)",
      "Ele(a) é resistente — acha que não precisa de ajuda externa",
      "Não sei dizer — não conversamos sobre isso diretamente",
    ],
    condition: (answers) => answers.quem_decide && !answers.quem_decide.includes("sozinho"),
  },
  {
    id: "pergunta_reuniao",
    type: "textarea",
    label: "Pensando na realidade da sua empresa hoje, qual decisão financeira você gostaria de tomar nos próximos 30 dias — mas ainda não tem segurança para tomar?",
    placeholder: "Ex: investir em uma nova unidade, trocar de fornecedor, renegociar uma dívida, cortar uma linha de produto...",
    subtitle: "Essa é a pergunta que vai abrir a sua reunião com o Ricardo. Quanto mais específico, mais valor você vai extrair do encontro.",
  },
  {
    id: "final",
    type: "final",
  },
];

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      height: "3px", background: "rgba(255,255,255,0.06)",
    }}>
      <div style={{
        height: "100%", width: `${pct}%`,
        background: "linear-gradient(90deg, #C9A84C, #E8D48B)",
        transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
      }} />
    </div>
  );
}

function ContextBox({ text }) {
  const [open, setOpen] = useState(false);
  
  const renderText = (t) => {
    const parts = t.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ color: "rgba(245,240,232,0.7)", fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div style={{ width: "100%", marginBottom: 4 }}>
      <button onClick={() => setOpen(!open)} style={{
        fontFamily: "'Inter', sans-serif", fontSize: 12,
        color: "#C9A84C", background: "none", border: "none",
        cursor: "pointer", padding: "4px 0", display: "flex",
        alignItems: "center", gap: 6, opacity: 0.7,
        transition: "opacity 0.2s ease",
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = "1"}
        onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}
      >
        <span style={{
          display: "inline-block", transition: "transform 0.2s ease",
          transform: open ? "rotate(90deg)" : "rotate(0deg)", fontSize: 10,
        }}>▶</span>
        {open ? "Fechar referência" : "Como avaliar? Veja exemplos"}
      </button>
      {open && (
        <div style={{
          marginTop: 8, padding: "16px 20px",
          background: "rgba(201,168,76,0.04)",
          border: "1px solid rgba(201,168,76,0.1)",
          borderRadius: 8,
          fontFamily: "'Inter', sans-serif", fontSize: 13,
          color: "rgba(245,240,232,0.45)", lineHeight: 1.75,
          whiteSpace: "pre-line",
        }}>
          {renderText(text)}
        </div>
      )}
    </div>
  );
}

function WelcomeStep({ onNext }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div style={{
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
      transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)",
      display: "flex", flexDirection: "column", alignItems: "center",
      textAlign: "center", maxWidth: 600, margin: "0 auto", padding: "0 24px",
    }}>
      <div style={{
        width: 64, height: 1, background: "linear-gradient(90deg, transparent, #C9A84C, transparent)",
        marginBottom: 40,
      }} />
      <h1 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 400, color: "#F5F0E8",
        lineHeight: 1.2, marginBottom: 20, letterSpacing: "-0.02em",
      }}>
        Diagnóstico<br />Pré-Reunião
      </h1>
      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: "clamp(14px, 2.5vw, 16px)",
        color: "rgba(245,240,232,0.5)", lineHeight: 1.7, marginBottom: 12,
        maxWidth: 460, letterSpacing: "0.01em",
      }}>
        Programa CVE — Criação de Valor Empresarial
      </p>
      <div style={{
        width: 40, height: 1, background: "rgba(201,168,76,0.3)",
        margin: "20px 0 28px",
      }} />
      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: "clamp(13px, 2.2vw, 15px)",
        color: "rgba(245,240,232,0.4)", lineHeight: 1.8, marginBottom: 40,
        maxWidth: 440,
      }}>
        As próximas perguntas vão nos ajudar a preparar uma reunião 100% personalizada para a realidade da sua empresa. Tempo estimado: 5 minutos.
      </p>
      <button onClick={onNext} style={{
        fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500,
        color: "#1A1A1A", background: "linear-gradient(135deg, #C9A84C, #E8D48B)",
        border: "none", borderRadius: 6, padding: "14px 48px",
        cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase",
        transition: "all 0.3s ease",
      }}
        onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
        onMouseLeave={e => e.target.style.transform = "translateY(0)"}
      >
        Iniciar
      </button>
    </div>
  );
}

function AnalyzingStep({ onComplete }) {
  const messages = [
    "Analisando suas respostas...",
    "Encontrando oportunidades de melhoria de caixa...",
    "Mapeando gargalos de lucratividade...",
    "Identificando onde o dinheiro está escapando...",
    "Calculando potencial de crescimento financeiro...",
    "Preparando seu diagnóstico personalizado...",
  ];

  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i >= messages.length) {
        clearInterval(interval);
        setTimeout(onComplete, 1200);
      }
      setVisibleCount(i + 1);
    }, 900);
    setVisibleCount(1);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", textAlign: "center",
      maxWidth: 480, margin: "0 auto", padding: "0 24px",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: "2px solid rgba(201,168,76,0.2)",
        borderTopColor: "#C9A84C",
        animation: "spin 1s linear infinite",
        marginBottom: 40,
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        {messages.map((msg, i) => (
          <p key={i} style={{
            fontFamily: "'Inter', sans-serif", fontSize: 14,
            color: i < visibleCount
              ? "rgba(245,240,232,0.55)"
              : "transparent",
            lineHeight: 1.6,
            transition: "color 0.6s ease, transform 0.6s ease",
            transform: i < visibleCount ? "translateY(0)" : "translateY(8px)",
          }}>
            {msg}
          </p>
        ))}
      </div>
    </div>
  );
}

function FinalStep({ answers }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const nome = answers.nome ? answers.nome.split(" ")[0] : "Empresário";

  const insights = [];
  const fluxo = answers.fluxo_caixa;
  if (fluxo && fluxo <= 2) insights.push("Estruturação do fluxo de caixa será prioridade #1");
  if (fluxo && fluxo >= 3 && fluxo <= 4) insights.push("Elevação do fluxo de caixa para nível estratégico");

  const dor = answers.dor_lucro_caixa;
  if (dor && dor >= 4) insights.push("Investigação do descasamento entre lucro e caixa");

  const dec = answers.decisoes;
  if (dec && (dec.includes("intuição") || dec.includes("Misturo"))) {
    insights.push("Transição de decisão intuitiva para baseada em dados");
  }

  const proj = answers.projecao;
  if (proj && (proj.includes("Não") || proj.includes("geral"))) {
    insights.push("Construção de previsibilidade financeira de curto e médio prazo");
  }

  const endiv = answers.endividamento;
  if (endiv && (endiv.includes("Elevado") || endiv.includes("Crítico"))) {
    insights.push("Estratégia de reestruturação de dívida e acesso a capital inteligente");
  }

  const surp = answers.surpresa_caixa;
  if (surp && (surp.includes("mês") || surp.includes("semana"))) {
    insights.push("Eliminação de imprevistos recorrentes no caixa");
  }

  if (insights.length === 0) {
    insights.push("Análise completa será apresentada na reunião");
  }

  const motivacoes = answers.motivacao_real || [];
  const topMotivacao = motivacoes.length > 0 ? motivacoes[0] : null;

  return (
    <div style={{
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
      transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)",
      display: "flex", flexDirection: "column", alignItems: "center",
      textAlign: "center", maxWidth: 560, margin: "0 auto", padding: "0 24px",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))",
        border: "1px solid rgba(201,168,76,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 32, fontSize: 20,
      }}>✓</div>
      <h2 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 400, color: "#F5F0E8",
        lineHeight: 1.3, marginBottom: 16,
      }}>
        {nome}, diagnóstico recebido.
      </h2>
      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: 14,
        color: "rgba(245,240,232,0.45)", lineHeight: 1.7, marginBottom: 32,
        maxWidth: 420,
      }}>
        Suas respostas já estão sendo analisadas para preparar uma reunião sob medida.
      </p>

      <div style={{
        width: "100%", background: "rgba(201,168,76,0.04)",
        border: "1px solid rgba(201,168,76,0.12)", borderRadius: 10,
        padding: "28px 24px", textAlign: "left", marginBottom: 24,
      }}>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11,
          color: "#C9A84C", letterSpacing: "0.12em", textTransform: "uppercase",
          marginBottom: 16, fontWeight: 600,
        }}>
          Pontos que serão abordados na reunião
        </p>
        {insights.map((insight, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            marginBottom: i < insights.length - 1 ? 12 : 0,
          }}>
            <span style={{ color: "#C9A84C", fontSize: 8, marginTop: 6 }}>◆</span>
            <span style={{
              fontFamily: "'Inter', sans-serif", fontSize: 14,
              color: "rgba(245,240,232,0.65)", lineHeight: 1.5,
            }}>{insight}</span>
          </div>
        ))}
      </div>

      {topMotivacao && (
        <div style={{
          width: "100%", background: "rgba(245,240,232,0.02)",
          border: "1px solid rgba(245,240,232,0.06)", borderRadius: 8,
          padding: "18px 24px", textAlign: "left", marginBottom: 24,
        }}>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: 11,
            color: "rgba(245,240,232,0.3)", letterSpacing: "0.08em",
            textTransform: "uppercase", marginBottom: 8,
          }}>
            Seu objetivo principal
          </p>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: 14,
            color: "rgba(245,240,232,0.55)", lineHeight: 1.5,
          }}>
            {topMotivacao}
          </p>
        </div>
      )}

      <div style={{
        background: "rgba(245,240,232,0.03)", borderRadius: 8,
        padding: "20px 24px", width: "100%",
        border: "1px solid rgba(245,240,232,0.06)",
      }}>
        <p style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 15, color: "rgba(245,240,232,0.55)", fontStyle: "italic",
          lineHeight: 1.6,
        }}>
          "Onde foi parar o dinheiro?" — essa será a primeira pergunta que vamos responder juntos.
        </p>
      </div>
    </div>
  );
}

function TextInput({ step, value, onChange }) {
  const isTextarea = step.type === "textarea";
  const shared = {
    fontFamily: "'Inter', sans-serif", fontSize: 16, color: "#F5F0E8",
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(245,240,232,0.1)",
    borderRadius: 8, padding: "14px 18px", width: "100%", boxSizing: "border-box",
    outline: "none", transition: "border-color 0.3s ease",
    letterSpacing: "0.01em",
  };

  const handleFocus = e => e.target.style.borderColor = "rgba(201,168,76,0.4)";
  const handleBlur = e => e.target.style.borderColor = "rgba(245,240,232,0.1)";

  if (isTextarea) {
    return (
      <textarea
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={step.placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        rows={4}
        style={{ ...shared, resize: "vertical", minHeight: 100, lineHeight: 1.6 }}
      />
    );
  }
  return (
    <input
      type="text"
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={step.placeholder}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={shared}
    />
  );
}

function SelectInput({ step, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      {step.options.map((opt, i) => {
        const selected = value === opt;
        return (
          <button key={i} onClick={() => onChange(opt)} style={{
            fontFamily: "'Inter', sans-serif", fontSize: 14,
            color: selected ? "#1A1A1A" : "rgba(245,240,232,0.6)",
            background: selected
              ? "linear-gradient(135deg, #C9A84C, #E8D48B)"
              : "rgba(255,255,255,0.03)",
            border: `1px solid ${selected ? "transparent" : "rgba(245,240,232,0.08)"}`,
            borderRadius: 8, padding: "14px 18px",
            cursor: "pointer", textAlign: "left",
            transition: "all 0.3s ease",
            fontWeight: selected ? 600 : 400,
            letterSpacing: "0.01em", lineHeight: 1.4,
          }}
            onMouseEnter={e => { if (!selected) e.target.style.borderColor = "rgba(201,168,76,0.25)"; }}
            onMouseLeave={e => { if (!selected) e.target.style.borderColor = "rgba(245,240,232,0.08)"; }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function MultiSelectInput({ step, value, onChange }) {
  const selected = value || [];
  const toggle = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(v => v !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: 12,
        color: "rgba(245,240,232,0.3)", marginBottom: 4,
      }}>Selecione todas que se aplicam</p>
      {step.options.map((opt, i) => {
        const isSelected = selected.includes(opt);
        return (
          <button key={i} onClick={() => toggle(opt)} style={{
            fontFamily: "'Inter', sans-serif", fontSize: 14,
            color: isSelected ? "#1A1A1A" : "rgba(245,240,232,0.6)",
            background: isSelected
              ? "linear-gradient(135deg, #C9A84C, #E8D48B)"
              : "rgba(255,255,255,0.03)",
            border: `1px solid ${isSelected ? "transparent" : "rgba(245,240,232,0.08)"}`,
            borderRadius: 8, padding: "14px 18px",
            cursor: "pointer", textAlign: "left",
            transition: "all 0.3s ease",
            fontWeight: isSelected ? 600 : 400, lineHeight: 1.4,
          }}
            onMouseEnter={e => { if (!isSelected) e.target.style.borderColor = "rgba(201,168,76,0.25)"; }}
            onMouseLeave={e => { if (!isSelected) e.target.style.borderColor = "rgba(245,240,232,0.08)"; }}
          >
            <span style={{ marginRight: 10, opacity: 0.5 }}>{isSelected ? "✓" : "○"}</span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function ScaleInput({ step, value, onChange }) {
  return (
    <div style={{ width: "100%" }}>
      <div style={{
        display: "flex", gap: 8, justifyContent: "center", marginBottom: 12,
      }}>
        {[1, 2, 3, 4, 5].map(n => {
          const selected = value === n;
          return (
            <button key={n} onClick={() => onChange(n)} style={{
              width: 52, height: 52, borderRadius: 10,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 20, fontWeight: 400,
              color: selected ? "#1A1A1A" : "rgba(245,240,232,0.5)",
              background: selected
                ? "linear-gradient(135deg, #C9A84C, #E8D48B)"
                : "rgba(255,255,255,0.03)",
              border: `1px solid ${selected ? "transparent" : "rgba(245,240,232,0.08)"}`,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
              onMouseEnter={e => { if (!selected) e.target.style.borderColor = "rgba(201,168,76,0.25)"; }}
              onMouseLeave={e => { if (!selected) e.target.style.borderColor = "rgba(245,240,232,0.08)"; }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontFamily: "'Inter', sans-serif", fontSize: 11,
        color: "rgba(245,240,232,0.25)", padding: "0 4px",
      }}>
        <span>{step.scaleLabels[0]}</span>
        <span>{step.scaleLabels[4]}</span>
      </div>
    </div>
  );
}

export default function QuizDiagnosticoCVE({ quizId }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const containerRef = useRef(null);

  const activeSteps = STEPS.filter(s => {
    if (s.condition) return s.condition(answers);
    return true;
  });

  const step = activeSteps[currentIndex];
  const questionSteps = activeSteps.filter(s => s.type !== "welcome" && s.type !== "final");
  const questionIndex = questionSteps.indexOf(step);
  const totalQuestions = questionSteps.length;

  const canAdvance = () => {
    if (!step || step.type === "welcome" || step.type === "final") return true;
    const val = answers[step.id];
    if (step.type === "multiselect") return val && val.length > 0;
    if (step.type === "scale") return val !== undefined;
    return val && val.toString().trim().length > 0;
  };

  const goNext = () => {
    if (animating) return;
    if (currentIndex >= activeSteps.length - 1) return;
    const nextIndex = currentIndex + 1;
    const nextStep = activeSteps[nextIndex];
    if (nextStep && nextStep.type === "final") {
      setDirection(1);
      setAnimating(true);
      setTimeout(() => {
        setAnalyzing(true);
        setAnimating(false);
      }, 300);
      return;
    }
    setDirection(1);
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => Math.min(prev + 1, activeSteps.length - 1));
      setAnimating(false);
    }, 300);
  };

  const goPrev = () => {
    if (animating || currentIndex <= 0) return;
    setDirection(-1);
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => Math.max(prev - 1, 0));
      setAnimating(false);
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && canAdvance() && step?.type !== "textarea") {
      e.preventDefault();
      goNext();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, answers, animating]);

  useEffect(() => {
    if (step && (step.type === "select" || step.type === "scale") && answers[step.id]) {
      const timer = setTimeout(goNext, 600);
      return () => clearTimeout(timer);
    }
  }, [answers, step]);

  const updateAnswer = (val) => {
    setAnswers(prev => ({ ...prev, [step.id]: val }));
  };

  const renderInput = () => {
    if (!step) return null;
    switch (step.type) {
      case "text":
      case "textarea":
        return <TextInput step={step} value={answers[step.id]} onChange={updateAnswer} />;
      case "select":
        return <SelectInput step={step} value={answers[step.id]} onChange={updateAnswer} />;
      case "multiselect":
        return <MultiSelectInput step={step} value={answers[step.id]} onChange={updateAnswer} />;
      case "scale":
        return <ScaleInput step={step} value={answers[step.id]} onChange={updateAnswer} />;
      default:
        return null;
    }
  };

  const isQuestion = step && step.type !== "welcome" && step.type !== "final" && !analyzing;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      background: "radial-gradient(ellipse at 30% 20%, rgba(201,168,76,0.03) 0%, transparent 50%), #0D0D0D",
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: "40px 16px",
      position: "relative",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      
      {isQuestion && <ProgressBar current={questionIndex + 1} total={totalQuestions} />}

      {isQuestion && (
        <div style={{
          position: "fixed", top: 20, right: 24,
          fontFamily: "'Inter', sans-serif", fontSize: 12,
          color: "rgba(245,240,232,0.2)", letterSpacing: "0.05em",
        }}>
          {String(questionIndex + 1).padStart(2, "0")} / {String(totalQuestions).padStart(2, "0")}
        </div>
      )}

      <div ref={containerRef} style={{
        width: "100%", maxWidth: 540,
        opacity: animating ? 0 : 1,
        transform: animating
          ? `translateY(${direction * 20}px)`
          : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {step?.type === "welcome" && !analyzing && <WelcomeStep onNext={goNext} />}
        {step?.type === "final" && !analyzing && <FinalStep answers={answers} />}
        {analyzing && <AnalyzingStep onComplete={() => {
          setAnalyzing(false);
          setCurrentIndex(activeSteps.length - 1);
        }} />}

        {isQuestion && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "flex-start",
            gap: 20,
          }}>
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 400,
                color: "#F5F0E8", lineHeight: 1.35,
                marginBottom: 10, letterSpacing: "-0.01em",
              }}>
                {step.label}
              </h2>
              {step.subtitle && (
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "clamp(12px, 2vw, 13px)",
                  color: "rgba(201,168,76,0.5)", lineHeight: 1.6,
                  fontStyle: "italic",
                }}>
                  {step.subtitle}
                </p>
              )}
            </div>

            {step.contextBox && (
              <ContextBox text={step.contextBox.text} />
            )}

            {renderInput()}

            <div style={{
              display: "flex", justifyContent: "space-between",
              width: "100%", marginTop: 12, alignItems: "center",
            }}>
              <button onClick={goPrev} style={{
                fontFamily: "'Inter', sans-serif", fontSize: 13,
                color: "rgba(245,240,232,0.25)",
                background: "none", border: "none", cursor: "pointer",
                padding: "8px 0", transition: "color 0.3s ease",
                visibility: currentIndex > 1 ? "visible" : "hidden",
              }}
                onMouseEnter={e => e.target.style.color = "rgba(245,240,232,0.5)"}
                onMouseLeave={e => e.target.style.color = "rgba(245,240,232,0.25)"}
              >
                ← Voltar
              </button>

              {(step.type === "text" || step.type === "textarea" || step.type === "multiselect") && (
                <button
                  onClick={goNext}
                  disabled={!canAdvance()}
                  style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
                    color: canAdvance() ? "#1A1A1A" : "rgba(245,240,232,0.2)",
                    background: canAdvance()
                      ? "linear-gradient(135deg, #C9A84C, #E8D48B)"
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${canAdvance() ? "transparent" : "rgba(245,240,232,0.06)"}`,
                    borderRadius: 6, padding: "10px 28px",
                    cursor: canAdvance() ? "pointer" : "default",
                    transition: "all 0.3s ease",
                    letterSpacing: "0.05em",
                  }}
                >
                  {currentIndex === activeSteps.length - 2 ? "Finalizar" : "Continuar →"}
                </button>
              )}
            </div>

            {(step.type === "text") && (
              <p style={{
                fontFamily: "'Inter', sans-serif", fontSize: 11,
                color: "rgba(245,240,232,0.15)",
              }}>
                Pressione Enter para continuar
              </p>
            )}
          </div>
        )}
      </div>

      <div style={{
        position: "fixed", bottom: 20,
        fontFamily: "'Inter', sans-serif", fontSize: 10,
        color: "rgba(245,240,232,0.1)", letterSpacing: "0.15em",
        textTransform: "uppercase",
      }}>
        CVE — Criação de Valor Empresarial
      </div>
    </div>
  );
}
