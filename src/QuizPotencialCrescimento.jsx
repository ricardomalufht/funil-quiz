import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";

const QUESTIONS = [
  {
    id: 1,
    dimension: "visao",
    label: "Visão de Futuro",
    question: "Se eu te perguntasse agora: daqui a 6 meses, sua empresa vai ter caixa sobrando ou vai estar apertada? Qual seria sua resposta?",
    options: [
      { text: "Sinceramente, não faço ideia. Vivo o dia a dia e torço pro melhor", score: 1 },
      { text: "Tenho uma intuição, mas não teria como provar com números", score: 2 },
      { text: "Consigo ter uma noção razoável, mas com muitas incertezas", score: 3 },
      { text: "Sei com boa precisão — tenho projeção de caixa atualizada", score: 4 },
    ],
  },
  {
    id: 2,
    dimension: "divida",
    label: "Estrutura de Dívida",
    question: "Você sabe dizer, de cabeça, quanto sua empresa paga por mês em juros, parcelas de empréstimo e antecipações de recebível — somando tudo?",
    options: [
      { text: "Não faço ideia do valor total — nunca somei tudo junto", score: 1 },
      { text: "Tenho uma noção, mas sei que se somar direitinho vou me assustar", score: 2 },
      { text: "Sei mais ou menos, mas não acompanho se esse custo está subindo ou caindo", score: 3 },
      { text: "Sei exatamente quanto pago, acompanho mês a mês e negocio ativamente pra reduzir", score: 4 },
    ],
  },
  {
    id: 3,
    dimension: "giro",
    label: "Ciclo do Capital de Giro",
    question: "Na sua empresa, o que acontece entre a hora que você paga o fornecedor e a hora que o cliente te paga?",
    options: [
      { text: "Eu pago muito antes de receber — e isso sufoca meu caixa todo mês", score: 1 },
      { text: "Tem um descasamento que me obriga a usar banco ou antecipar recebível com frequência", score: 2 },
      { text: "Consigo equilibrar na maioria dos meses, mas às vezes aperta", score: 3 },
      { text: "Tenho os prazos bem negociados — recebo antes ou junto de quando pago", score: 4 },
    ],
  },
  {
    id: 4,
    dimension: "investimento",
    label: "Decisão de Investimento",
    question: "Nos últimos 12 meses, você deixou de fazer algum investimento importante (equipamento, contratação, expansão) por medo de não ter caixa?",
    options: [
      { text: "Sim, várias vezes. Perdi oportunidades boas por não saber se teria dinheiro", score: 1 },
      { text: "Sim, pelo menos uma ou duas vezes, e ainda me arrependo", score: 2 },
      { text: "Talvez uma vez, mas consegui fazer a maioria do que planejei", score: 3 },
      { text: "Não — quando decido investir, já sei de antemão o impacto no caixa", score: 4 },
    ],
  },
  {
    id: 5,
    dimension: "visao",
    label: "Visão de Futuro",
    question: "Sua empresa tem meses do ano que historicamente apertam mais (sazonalidade). Você sabe quais são e se prepara pra eles?",
    options: [
      { text: "Todo mês parece igual — aperto é constante e eu nunca sei quando vai piorar", score: 1 },
      { text: "Sei que alguns meses são piores, mas nunca me preparei financeiramente pra isso", score: 2 },
      { text: "Conheço os meses difíceis, mas nem sempre consigo me preparar a tempo", score: 3 },
      { text: "Mapeo a sazonalidade e reservo caixa com antecedência pros meses apertados", score: 4 },
    ],
  },
  {
    id: 6,
    dimension: "custo",
    label: "Custo do Crescimento",
    question: "Se seu faturamento crescer 30% nos próximos 12 meses, você sabe quanto de caixa vai precisar pra sustentar esse crescimento?",
    options: [
      { text: "Nunca pensei nisso — achava que crescer mais sempre significava mais dinheiro sobrando", score: 1 },
      { text: "Sei que crescer consome caixa, mas não tenho ideia de quanto", score: 2 },
      { text: "Tenho uma noção do impacto, mas não calculei com precisão", score: 3 },
      { text: "Sim — já modelei o custo do crescimento e sei exatamente quanto preciso", score: 4 },
    ],
  },
  {
    id: 7,
    dimension: "divida",
    label: "Estrutura de Dívida",
    question: "Quando sua empresa precisa de crédito ou capital de giro, como isso normalmente acontece?",
    options: [
      { text: "Na emergência — antecipo recebível ou pego empréstimo no susto, com o juro que vier", score: 1 },
      { text: "Negocio com o banco, mas geralmente já estou pressionado e aceito condições ruins", score: 2 },
      { text: "Consigo planejar com alguma antecedência, mas nem sempre pego as melhores taxas", score: 3 },
      { text: "Planejo com antecedência, comparo opções e só tomo crédito quando faz sentido estratégico", score: 4 },
    ],
  },
  {
    id: 8,
    dimension: "giro",
    label: "Ciclo do Capital de Giro",
    question: "Você sabe dizer hoje qual cliente ou linha de produto mais gera caixa versus qual mais consome caixa da sua operação?",
    options: [
      { text: "Não — olho só faturamento e acho que quem fatura mais é quem dá mais dinheiro", score: 1 },
      { text: "Desconfio que tem cliente ou produto que dá prejuízo, mas nunca comprovei", score: 2 },
      { text: "Tenho uma ideia geral, mas não com números precisos", score: 3 },
      { text: "Sim — sei exatamente quem gera caixa e quem consome, e tomo decisões com base nisso", score: 4 },
    ],
  },
  {
    id: 9,
    dimension: "custo",
    label: "Custo do Crescimento",
    question: "Quando você contrata mais gente, compra mais material ou aumenta produção pra crescer, o que acontece com seu caixa nos 3 meses seguintes?",
    options: [
      { text: "Aperta muito — o custo vem antes do retorno e eu sempre me endivido pra cobrir", score: 1 },
      { text: "Fica difícil, preciso do banco pra aguentar o período até o retorno chegar", score: 2 },
      { text: "Consigo segurar, mas fico desconfortável e sem saber se vai dar certo", score: 3 },
      { text: "Já sei exatamente quanto vai custar e quando o retorno vem — planejo tudo antes", score: 4 },
    ],
  },
  {
    id: 10,
    dimension: "investimento",
    label: "Decisão de Investimento",
    question: "Pensando nos próximos 12 meses, qual frase melhor descreve sua situação?",
    options: [
      { text: "Quero crescer, mas tenho medo de me endividar e não conseguir pagar", score: 1 },
      { text: "Sei que preciso investir, mas não sei se vou ter caixa pra isso", score: 2 },
      { text: "Tenho planos de investimento, mas falta uma projeção confiável pra decidir com segurança", score: 3 },
      { text: "Sei exatamente onde investir, quando e com que dinheiro — já está planejado", score: 4 },
    ],
  },
];

const VIDEO_AFTER_Q3 = {
  title: "O erro mais caro do empresário que quer crescer",
  subtitle: "Assista esse vídeo de 3 minutos — ele explica por que crescer sem previsibilidade é o jeito mais rápido de quebrar.",
  placeholder: "VIDEO_URL_1",
  duration: "3:18",
};

const VIDEO_AFTER_Q7 = {
  title: "Como saber se sua empresa aguenta crescer sem se endividar",
  subtitle: "Esse vídeo revela o cálculo que nenhum contador vai te mostrar — e que muda completamente suas decisões de investimento.",
  placeholder: "VIDEO_URL_2",
  duration: "4:05",
};

const dimTo100 = (raw) => Math.round(((raw - 2) / 6) * 100);
const totalTo100 = (raw) => Math.round(((raw - 10) / 30) * 100);

const DIMENSION_INFO = {
  visao: {
    name: "Visão de Futuro",
    icon: "🔭",
    color: "#3B82F6",
    low: {
      diagnosis: "Você está dirigindo na neblina. Sem projeção de caixa para os próximos meses, cada decisão de investimento é uma aposta — e apostas erradas no tamanho da sua empresa custam caro. Empresários nessa situação são os que mais pagam juros desnecessários e perdem oportunidades por medo.",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Pegue uma folha e escreva 3 colunas: 'Próximo mês', 'Daqui 3 meses', 'Daqui 6 meses'. Para cada coluna, anote de cabeça: o que entra de fixo, o que sai de fixo, e o que você ACHA que sobra. Não precisa ser perfeito — o choque de ver no papel já é o primeiro passo." },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "\"Preciso que você me mostre uma previsão simples: quanto a gente tem de compromisso fixo nos próximos 3 meses e quanto a gente espera receber. Quero ver se vai sobrar ou faltar — sem achismo, com número.\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"Se alguém me oferecesse uma oportunidade de R$200 mil amanhã, eu saberia em 5 minutos se posso aceitar ou não? Se a resposta é 'não sei', eu não estou no comando — estou na torcida.\"" },
      ],
    },
    high: {
      diagnosis: "Você já tem visão do futuro financeiro da empresa. O próximo passo é usar essa projeção como arma competitiva — para negociar melhor, investir na hora certa e crescer sem surpresas.",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Olhe sua projeção de caixa dos próximos 6 meses e identifique o mês com menor saldo previsto. Agora pergunte: o que eu posso fazer HOJE pra aumentar esse saldo? Negociar prazo, antecipar uma cobrança, adiar uma compra não urgente?" },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "\"Quero que a gente comece a rodar 3 cenários: otimista, realista e pessimista. Me mostra quanto sobra ou falta em cada um deles pra eu decidir o tamanho do investimento que posso fazer.\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"Estou usando minha projeção de caixa pra tomar decisões ofensivas (quando investir) ou só defensivas (quando segurar)? Se for só defesa, estou desperdiçando o poder da informação.\"" },
      ],
    },
  },
  divida: {
    name: "Estrutura de Dívida",
    icon: "🏦",
    color: "#EF4444",
    low: {
      diagnosis: "Sua empresa está pagando caro por não planejar. Quando você pega crédito na emergência, aceita juros muito maiores do que conseguiria com planejamento. Cada antecipação de recebível no susto, cada cheque especial usado 'só esse mês' — tudo isso come sua margem e trava seu crescimento.",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Abra seu internet banking e some: parcelas de empréstimo + juros de cheque especial + taxas de antecipação de recebível. Anote o total. Agora pense: esse valor por mês, ao longo de 12 meses, seria suficiente pra fazer qual investimento no seu negócio?" },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "\"Me faz uma lista de tudo que a gente paga de juros, parcelas e taxas financeiras por mês. Tudo junto, numa linha só. Quero ver o número real do custo do nosso endividamento.\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"Quantas vezes esse ano eu peguei dinheiro no banco por necessidade, sem tempo pra comparar taxas? Se a resposta for 'toda vez', estou pagando o preço mais alto possível por não planejar.\"" },
      ],
    },
    high: {
      diagnosis: "Você tem dívida estruturada e planejada. Isso já te coloca em vantagem. O próximo passo é usar esse controle para negociar condições ainda melhores e transformar crédito em acelerador de crescimento.",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Liste todas as suas linhas de crédito ativas com as taxas de cada uma. Agora pergunte: consigo trocar a mais cara por uma mais barata? Muitas vezes, só de consolidar duas dívidas em uma com taxa menor, você libera dezenas de milhares por ano." },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "\"Quero uma análise de quanto pagaríamos se renegociássemos nossas 3 maiores dívidas com as condições de hoje. Me mostra a economia mensal e anual que a gente poderia ter.\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"Estou usando dívida como ferramenta de crescimento ou ainda como tapa-buraco? Dívida inteligente é a que paga um investimento que gera mais do que o custo do juro.\"" },
      ],
    },
  },
  giro: {
    name: "Ciclo do Capital de Giro",
    icon: "🔄",
    color: "#8B5CF6",
    low: {
      diagnosis: "Seu dinheiro está preso no ciclo da operação. Você paga antes de receber, e esse descasamento é uma torneira aberta sugando seu caixa. Cada dia de diferença entre pagar e receber tem um custo financeiro real — e na maioria das vezes, esse custo está invisível.",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Anote três números: em quantos dias em média você PAGA seus fornecedores, em quantos dias seus clientes te PAGAM, e quantos dias seu estoque fica parado. Se a soma de estoque + recebimento é muito maior que o prazo de pagamento, esse é o tamanho do buraco que engole seu caixa." },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "\"Me mostra dois números: nosso prazo médio de recebimento e nosso prazo médio de pagamento a fornecedores. Quero entender quantos dias estamos financiando a operação do próprio bolso.\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"Será que meu maior cliente, o que mais fatura, é também o que mais trava meu caixa? E se o prazo dele está me custando mais em juros do que o lucro que ele me dá?\"" },
      ],
    },
    high: {
      diagnosis: "Seu ciclo de capital de giro está razoavelmente equilibrado. Agora é hora de otimizar os detalhes — é nos detalhes que se libera caixa de verdade para investir em crescimento.",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Liste seus 5 maiores fornecedores e os prazos que tem com cada um. Agora pergunte: se eu pedisse 10 dias a mais pra algum deles, qual seria mais provável de aceitar? Cada dia extra de prazo é dinheiro que fica mais tempo no seu caixa." },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "\"Quero um ranking dos nossos top 10 clientes por prazo de pagamento. Me mostra quem paga rápido e quem demora. Vamos ver se a gente consegue melhorar os piores prazos ou dar desconto pra quem pagar mais rápido.\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"Quanto dinheiro eu tenho parado em estoque nesse momento? Se eu vendesse ou devolvesse o que não gira há mais de 90 dias, quanto caixa eu liberava amanhã?\"" },
      ],
    },
  },
  custo: {
    name: "Custo do Crescimento",
    icon: "📐",
    color: "#F59E0B",
    low: {
      diagnosis: "Você quer crescer, mas não sabe quanto isso custa em caixa. Esse é o erro mais perigoso: achar que vender mais automaticamente significa ter mais dinheiro. Na realidade, crescer consome caixa ANTES de gerar retorno — e sem saber isso, você pode quebrar justamente na hora que mais cresce.",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Pense na última vez que cresceu forte (contratou, comprou material, aumentou produção). Quanto tempo levou entre gastar o dinheiro e ver o retorno chegar no caixa? Se foi mais de 60 dias, esse é o 'custo invisível do crescimento' que ninguém te conta." },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "\"Se a gente aumentar nosso faturamento em 20% nos próximos 6 meses, quanto de caixa a mais vamos precisar? Quero saber: vamos ter que pedir dinheiro pro banco ou conseguimos bancar com o que temos?\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"Será que o motivo de eu não conseguir crescer mais não é falta de venda — é que cada vez que vendo mais, o caixa some mais rápido do que volta? Se for isso, o problema não é comercial. É financeiro.\"" },
      ],
    },
    high: {
      diagnosis: "Você entende que crescer custa caixa. Agora o desafio é calcular com precisão quanto, para poder planejar o crescimento na velocidade certa — nem rápido demais (que sufoca) nem devagar demais (que perde mercado).",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Para cada R$1 a mais de faturamento, quanto de capital de giro sua empresa precisa? Faça uma conta simples: pegue seu capital de giro atual e divida pelo faturamento mensal. Esse número te mostra quanto de caixa cada real de crescimento vai consumir." },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "\"Quero uma simulação: se crescermos 30% no ano que vem, qual é a necessidade adicional de capital de giro mês a mês? Me mostra em que mês o caixa vai apertar pra gente se preparar antes.\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"Eu sei qual é a velocidade máxima que minha empresa aguenta crescer sem precisar de dinheiro de fora? Se não sei, estou acelerando sem olhar o velocímetro.\"" },
      ],
    },
  },
  investimento: {
    name: "Decisão de Investimento",
    icon: "🎯",
    color: "#10B981",
    low: {
      diagnosis: "Você está travado. Quer crescer, mas o medo de se endividar paralisa suas decisões. Sem previsibilidade de caixa, toda oportunidade de investimento se transforma em fonte de ansiedade — e a empresa fica presa no mesmo tamanho, ano após ano.",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Anote o investimento que você mais quer fazer hoje (equipamento, contratação, expansão). Agora escreva ao lado: quanto custa, em quanto tempo esperaria o retorno, e se você sabe se terá caixa pra bancar. Se faltou resposta pra qualquer uma, é aí que está o travamento." },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "\"Preciso que você me ajude a responder uma pergunta: se a gente investir R$[valor do investimento desejado] nos próximos 3 meses, o que acontece com nosso caixa? Vai faltar? Quando? Quanto?\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"O que está me custando mais caro: fazer esse investimento ou NÃO fazer? Se meu concorrente está investindo e eu não, quanto de mercado estou perdendo por medo? E se esse medo vem de falta de informação, não de falta de dinheiro?\"" },
      ],
    },
    high: {
      diagnosis: "Você investe com confiança porque sabe os números. Isso é raro e poderoso. O próximo passo é sistematizar esse processo para que cada decisão de investimento tenha uma análise de impacto no caixa — e seu time possa te apoiar nisso.",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Dos investimentos que você fez nos últimos 12 meses, qual deu mais retorno em caixa? Anote o que fez dar certo. Agora pergunte: estou aplicando essa mesma lógica pros próximos investimentos, ou estou diversificando sem critério?" },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "\"Quero que pra todo investimento acima de R$[valor], a gente tenha uma 'ficha de decisão': quanto custa, de onde sai o dinheiro, em quanto tempo volta, e o que acontece se der errado. Sempre essas 4 respostas antes de decidir.\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"Estou investindo no que mais gera retorno ou no que mais me entusiasma? Os dois são a mesma coisa? Se não, talvez eu esteja priorizando desejo em vez de estratégia.\"" },
      ],
    },
  },
};

const LEVELS = [
  { min: 0, max: 23, name: "Crescimento Travado", tag: "ZONA CRÍTICA", tagColor: "#EF4444", color: "#EF4444", description: "Sua empresa quer crescer, mas está travada pela falta de visibilidade financeira. Sem saber quanto caixa vai ter amanhã, você não consegue investir com segurança — e acaba ou perdendo oportunidades por medo, ou se endividando por impulso. Esse é o padrão mais perigoso: a empresa fatura, mas não tem fôlego pra dar o próximo passo.", urgency: "Empresários nessa situação pagam, em média, 2x a 3x mais juros do que pagariam com dívida estruturada e planejada." },
  { min: 24, max: 49, name: "Crescimento no Escuro", tag: "ZONA DE ATENÇÃO", tagColor: "#F59E0B", color: "#F59E0B", description: "Você tem noção dos problemas, mas cresce sem mapa. As decisões de investimento são tomadas com informação incompleta, e o resultado é uma mistura de acertos por instinto e erros por falta de previsão. O caixa oscila mais do que deveria e o custo do crescimento está invisível.", urgency: "Empresas nesse estágio conseguem destravar entre R$100 mil e R$500 mil em caixa nos primeiros 6 meses ao estruturar seu planejamento financeiro." },
  { min: 50, max: 76, name: "Crescimento Consciente", tag: "EM EVOLUÇÃO", tagColor: "#3B82F6", color: "#3B82F6", description: "Você está a poucos ajustes de ter controle total sobre suas decisões de investimento. Já tem consciência dos desafios e alguns processos funcionando, mas faltam as ferramentas e a metodologia para projetar com confiança e crescer com segurança real.", urgency: "Você está a 2-3 ajustes estratégicos de ter previsibilidade total e poder acelerar seu crescimento com segurança." },
  { min: 77, max: 100, name: "Crescimento Acelerado", tag: "NÍVEL AVANÇADO", tagColor: "#10B981", color: "#10B981", description: "Parabéns — você é um dos poucos empresários que sabe exatamente quanto pode crescer, quando investir e como financiar sua expansão. Sua empresa está pronta para acelerar com segurança e consistência.", urgency: "Mesmo nesse nível, um diagnóstico profundo pode revelar oportunidades de otimização que liberam centenas de milhares em caixa para investimentos estratégicos." },
];

function RadarChart({ scores }) {
  const dims = ["visao", "divida", "giro", "custo", "investimento"];
  const labels = ["Visão de\nFuturo", "Estrutura\nde Dívida", "Ciclo do\nCapital de Giro", "Custo do\nCrescimento", "Decisão de\nInvestimento"];
  const cx = 160, cy = 160, maxR = 110;
  const angleStep = (2 * Math.PI) / 5;
  const startAngle = -Math.PI / 2;
  const getPoint = (i, r) => { const angle = startAngle + i * angleStep; return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]; };
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const dataPoints = dims.map((d, i) => getPoint(i, maxR * (scores[d] / 100)));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";
  return (
    <svg viewBox="0 0 320 320" style={{ width: "100%", maxWidth: 360, margin: "0 auto", display: "block" }}>
      {gridLevels.map((level) => { const pts = dims.map((_, i) => getPoint(i, maxR * level)); const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z"; return <path key={level} d={path} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />; })}
      {dims.map((_, i) => { const [ex, ey] = getPoint(i, maxR); return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />; })}
      <path d={dataPath} fill="rgba(16,185,129,0.15)" stroke="#10B981" strokeWidth="2.5" />
      {dataPoints.map(([px, py], i) => (<circle key={i} cx={px} cy={py} r="5" fill={DIMENSION_INFO[dims[i]].color} stroke="#0A0F1C" strokeWidth="2" />))}
      {dims.map((_, i) => { const [lx, ly] = getPoint(i, maxR + 32); const lines = labels[i].split("\n"); return (<text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="system-ui">{lines.map((line, li) => (<tspan key={li} x={lx} dy={li === 0 ? 0 : 13}>{line}</tspan>))}</text>); })}
    </svg>
  );
}

function ScoreBar({ label, score, color, icon }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>{icon} {label}</span>
        <span style={{ color, fontWeight: 700, fontSize: 15 }}>{score}<span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>/100</span></span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 10, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 6, transition: "width 1.2s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  );
}

function ActionCard({ action }) {
  const bgMap = { solo: "rgba(59,130,246,0.06)", team: "rgba(139,92,246,0.06)", mirror: "rgba(245,158,11,0.06)" };
  const borderMap = { solo: "rgba(59,130,246,0.12)", team: "rgba(139,92,246,0.12)", mirror: "rgba(245,158,11,0.12)" };
  const labelColorMap = { solo: "#60A5FA", team: "#A78BFA", mirror: "#FBBF24" };
  return (
    <div style={{ background: bgMap[action.type], border: `1px solid ${borderMap[action.type]}`, borderRadius: 14, padding: "20px 22px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>{action.emoji}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: labelColorMap[action.type], letterSpacing: "0.04em", textTransform: "uppercase" }}>{action.label}</span>
      </div>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, margin: 0 }}>{action.text}</p>
    </div>
  );
}

export default function QuizCrescimento({ quizId }) {
  const [screen, setScreen] = useState("landing");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [showVideo, setShowVideo] = useState(null);
  const [fadeIn, setFadeIn] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const containerRef = useRef(null);

  const triggerFade = useCallback((cb) => { setFadeIn(false); setTimeout(() => { cb(); setFadeIn(true); }, 300); }, []);
  const scrollTop = () => { if (containerRef.current) containerRef.current.scrollTo({ top: 0, behavior: "smooth" }); };

  const rawTotal = Object.values(answers).reduce((a, b) => a + b, 0);
  const score100 = totalTo100(rawTotal);

  const getDimScores = () => {
    const raw = { visao: 0, divida: 0, giro: 0, custo: 0, investimento: 0 };
    QUESTIONS.forEach((q, i) => { if (answers[i] !== undefined) raw[q.dimension] += answers[i]; });
    return raw;
  };
  const dimScores100 = () => {
    const r = getDimScores();
    return { visao: dimTo100(r.visao), divida: dimTo100(r.divida), giro: dimTo100(r.giro), custo: dimTo100(r.custo), investimento: dimTo100(r.investimento) };
  };
  const getLevel = (s) => LEVELS.find((l) => s >= l.min && s <= l.max) || LEVELS[0];

  const handleAnswer = (qIndex, score) => {
    setSelectedOption(score);
    setTimeout(() => {
      const na = { ...answers, [qIndex]: score }; setAnswers(na); setSelectedOption(null);
      if (qIndex === 2) triggerFade(() => { setShowVideo("video1"); scrollTop(); });
      else if (qIndex === 6) triggerFade(() => { setShowVideo("video2"); scrollTop(); });
      else if (qIndex === 9) triggerFade(() => { setScreen("capture"); scrollTop(); });
      else triggerFade(() => { setCurrentQ(qIndex + 1); scrollTop(); });
    }, 400);
  };

  const handleVideoNext = () => {
    if (showVideo === "video1") triggerFade(() => { setShowVideo(null); setCurrentQ(3); scrollTop(); });
    else triggerFade(() => { setShowVideo(null); setCurrentQ(7); scrollTop(); });
  };

  const handleSubmitLead = async () => {
    if (!name.trim()) return;
    try {
      const raw = getDimScores();
      const scores = dimScores100();
      await supabase.from("quiz_leads").insert({
        quiz_id: quizId,
        name: name.trim(),
        email: email.trim() || null,
        whatsapp: whatsapp.trim() || null,
        score: score100,
        dimension_scores: scores,
      });
    } catch (err) {
      console.error("Failed to save lead:", err);
    }
    triggerFade(() => { setScreen("result"); scrollTop(); });
  };

  const progress = screen === "landing" ? 0 : screen === "result" ? 100 : ((Object.keys(answers).length) / 10) * 100;
  const base = { minHeight: "100vh", background: "#060A14", color: "#fff", fontFamily: "'Outfit', system-ui, -apple-system, sans-serif", overflow: "auto" };
  const card = { background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "32px 28px", maxWidth: 640, margin: "0 auto", position: "relative" };
  const btnP = { background: "linear-gradient(135deg, #059669 0%, #10B981 100%)", color: "#fff", border: "none", borderRadius: 12, padding: "16px 40px", fontSize: 16, fontWeight: 600, cursor: "pointer", letterSpacing: "0.02em", transition: "all 0.3s", display: "inline-flex", alignItems: "center", gap: 8 };
  const fade = { opacity: fadeIn ? 1 : 0, transform: fadeIn ? "translateY(0)" : "translateY(12px)", transition: "all 0.3s ease" };
  const hoverOn = (e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(5,150,105,0.4)"; };
  const hoverOff = (e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; };

  if (screen === "landing") {
    return (
      <div ref={containerRef} style={base}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 20px", textAlign: "center", ...fade }}>
          <div style={{ display: "inline-block", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 100, padding: "8px 20px", fontSize: 13, fontWeight: 500, color: "#34D399", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 32 }}>Teste Gratuito · 3 minutos</div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20, letterSpacing: "-0.02em" }}>
            Sua empresa aguenta{" "}<span style={{ color: "#10B981" }}>crescer</span>{" "}
            sem se{" "}<span style={{ color: "#EF4444" }}>endividar</span>?
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 16px" }}>
            Descubra em 10 perguntas se você tem previsibilidade financeira para investir no crescimento da sua empresa nos próximos 12 meses — ou se está caminhando para uma armadilha de caixa.
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 40 }}>Mais de 400 empresários já fizeram este diagnóstico</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, maxWidth: 580, margin: "0 auto 48px", textAlign: "left" }}>
            {[{ icon: "🔭", text: "Descubra se você tem caixa pra crescer nos próximos 6-12 meses" }, { icon: "📐", text: "Saiba quanto custa crescer 30% e se sua empresa aguenta" }, { icon: "🎯", text: "Receba ações práticas para destravar investimentos com segurança" }].map((item, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "20px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>
          <button style={btnP} onClick={() => triggerFade(() => { setScreen("quiz"); scrollTop(); })} onMouseOver={hoverOn} onMouseOut={hoverOff}>Descobrir Meu Potencial de Crescimento →</button>
          <div style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {["Gratuito", "3 minutos", "Resultado imediato"].map((t) => (
              <span key={t} style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />{t}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "result") {
    const scores = dimScores100();
    const rawScores = getDimScores();
    const level = getLevel(score100);
    const dims = ["visao", "divida", "giro", "custo", "investimento"];
    const weakest = dims.reduce((a, b) => (scores[a] <= scores[b] ? a : b));
    const strongest = dims.reduce((a, b) => (scores[a] >= scores[b] ? a : b));
    return (
      <div ref={containerRef} style={{ ...base, overflow: "auto" }}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px", ...fade }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-block", background: `${level.tagColor}15`, border: `1px solid ${level.tagColor}30`, borderRadius: 100, padding: "6px 18px", fontSize: 12, fontWeight: 600, color: level.tagColor, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>{level.tag}</div>
            <h1 style={{ fontSize: "clamp(26px, 4.5vw, 38px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 8 }}>
              {name.split(" ")[0]}, seu potencial de{" "}<span style={{ color: level.color }}>crescimento</span>:
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>{level.name}</p>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 4, marginBottom: 16 }}>
              <span style={{ fontSize: 64, fontWeight: 800, color: level.color, lineHeight: 1 }}>{score100}</span>
              <span style={{ fontSize: 24, color: "rgba(255,255,255,0.25)", fontWeight: 300 }}>/100</span>
            </div>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>{level.description}</p>
          </div>
          <div style={card}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, textAlign: "center" }}>Seu Mapa de Potencial de Crescimento</h3>
            <RadarChart scores={scores} />
            <div style={{ marginTop: 28 }}>{dims.map((d) => (<ScoreBar key={d} label={DIMENSION_INFO[d].name} score={scores[d]} color={DIMENSION_INFO[d].color} icon={DIMENSION_INFO[d].icon} />))}</div>
          </div>
          <div style={{ background: `${level.tagColor}08`, border: `1px solid ${level.tagColor}20`, borderRadius: 14, padding: "24px 28px", margin: "28px auto", maxWidth: 640, display: "flex", gap: 16, alignItems: "flex-start" }}>
            <span style={{ fontSize: 28, lineHeight: 1 }}>⚡</span>
            <div><div style={{ fontWeight: 600, fontSize: 15, color: level.tagColor, marginBottom: 6 }}>Dado Importante</div><p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>{level.urgency}</p></div>
          </div>
          <div style={{ ...card, marginTop: 28, borderColor: `${DIMENSION_INFO[weakest].color}20` }}>
            <div style={{ display: "inline-block", background: `${DIMENSION_INFO[weakest].color}15`, borderRadius: 8, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: DIMENSION_INFO[weakest].color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>⚠️ O QUE MAIS TRAVA SEU CRESCIMENTO</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{DIMENSION_INFO[weakest].icon} {DIMENSION_INFO[weakest].name}</h3>
            <p style={{ fontSize: 14, color: level.tagColor, fontWeight: 600, marginBottom: 16 }}>Score: {scores[weakest]}/100</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 24 }}>{rawScores[weakest] <= 4 ? DIMENSION_INFO[weakest].low.diagnosis : DIMENSION_INFO[weakest].high.diagnosis}</p>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 18, color: "rgba(255,255,255,0.85)" }}>O que fazer nas próximas 24 horas:</div>
            {(rawScores[weakest] <= 4 ? DIMENSION_INFO[weakest].low.actions : DIMENSION_INFO[weakest].high.actions).map((a, i) => (<ActionCard key={i} action={a} />))}
          </div>
          <div style={{ ...card, marginTop: 28, borderColor: `${DIMENSION_INFO[strongest].color}20` }}>
            <div style={{ display: "inline-block", background: `${DIMENSION_INFO[strongest].color}15`, borderRadius: 8, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: DIMENSION_INFO[strongest].color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>💪 SUA MAIOR VANTAGEM</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{DIMENSION_INFO[strongest].icon} {DIMENSION_INFO[strongest].name}</h3>
            <p style={{ fontSize: 14, color: "#10B981", fontWeight: 600, marginBottom: 16 }}>Score: {scores[strongest]}/100</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 24 }}>{rawScores[strongest] <= 4 ? DIMENSION_INFO[strongest].low.diagnosis : DIMENSION_INFO[strongest].high.diagnosis}</p>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 18, color: "rgba(255,255,255,0.85)" }}>Próximos passos para avançar:</div>
            {(rawScores[strongest] <= 4 ? DIMENSION_INFO[strongest].low.actions : DIMENSION_INFO[strongest].high.actions).map((a, i) => (<ActionCard key={i} action={a} />))}
          </div>
          <div style={{ ...card, marginTop: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>📋 Sua ação mais importante por dimensão</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>Comece por estas — uma de cada área — e você já vai sentir a diferença</p>
            {dims.map((d) => {
              const info = DIMENSION_INFO[d]; const isLow = rawScores[d] <= 4;
              const topAction = isLow ? info.low.actions[0] : info.high.actions[0];
              return (<div key={d} style={{ display: "flex", gap: 14, padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "flex-start" }}><span style={{ fontSize: 20 }}>{info.icon}</span><div style={{ flex: 1 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><span style={{ fontWeight: 600, fontSize: 14 }}>{info.name}</span><span style={{ fontSize: 12, color: info.color, fontWeight: 600 }}>{scores[d]}/100</span></div><p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, margin: 0 }}>{topAction.text.length > 130 ? topAction.text.substring(0, 130) + "..." : topAction.text}</p></div></div>);
            })}
          </div>
          <div style={{ textAlign: "center", marginTop: 48, padding: "48px 28px", background: "linear-gradient(135deg, rgba(5,150,105,0.08) 0%, rgba(16,185,129,0.03) 100%)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 20 }}>
            <div style={{ fontSize: 14, color: "#34D399", fontWeight: 500, marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>Próximo Passo</div>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, lineHeight: 1.25, marginBottom: 16 }}>
              Saber que quer crescer é fácil.<br /><span style={{ color: "#10B981" }}>Saber se você PODE é o que muda o jogo.</span>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 500, margin: "0 auto 12px" }}>
              No Diagnóstico de Fluxo de Caixa, mapeamos o Caminho do Dinheiro da sua empresa e te mostramos com precisão: quanto caixa você vai ter nos próximos 6-12 meses e onde estão as travas que impedem seu crescimento.
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Metodologia testada em centenas de empresas · Aplicada por Ricardo Maluf</p>
            <button style={{ ...btnP, padding: "18px 48px", fontSize: 17 }} onClick={() => window.open("#pagina-de-vendas", "_blank")} onMouseOver={hoverOn} onMouseOut={hoverOff}>Quero o Diagnóstico Completo →</button>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 16 }}>Diagnóstico de Fluxo de Caixa · R$397 · Duração: 40 minutos</p>
          </div>
          <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 40 }}>© 2026 Ricardo Maluf · Todos os direitos reservados</p>
        </div>
      </div>
    );
  }

  if (screen === "capture") {
    return (
      <div ref={containerRef} style={base}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: "#060A14", padding: "16px 20px 0" }}><div style={{ maxWidth: 640, margin: "0 auto" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Quase lá!</span><span style={{ fontSize: 12, color: "#10B981", fontWeight: 600 }}>95%</span></div><div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 3 }}><div style={{ width: "95%", height: "100%", background: "linear-gradient(90deg, #059669, #10B981)", borderRadius: 4 }} /></div></div></div>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "60px 20px", ...fade }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28 }}>🚀</div>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>Seu resultado está pronto!</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>Preencha seus dados para receber seu Mapa de Potencial de Crescimento com plano de ação.</p>
          </div>
          <div style={card}>
            {[{ label: "Seu nome *", value: name, set: setName, placeholder: "Como você gostaria de ser chamado?", type: "text" }, { label: "E-mail", value: email, set: setEmail, placeholder: "seu@email.com (opcional)", type: "email" }, { label: "WhatsApp", value: whatsapp, set: setWhatsapp, placeholder: "(11) 99999-9999 (opcional)", type: "tel" }].map((f) => (
              <div key={f.label} style={{ marginBottom: 20 }}><label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8, fontWeight: 500 }}>{f.label}</label><input type={f.type} value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.placeholder} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px", color: "#fff", fontSize: 15, outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }} onFocus={(e) => (e.target.style.borderColor = "rgba(16,185,129,0.4)")} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} /></div>
            ))}
            <button style={{ ...btnP, width: "100%", justifyContent: "center", marginTop: 12, opacity: name.trim() ? 1 : 0.4, pointerEvents: name.trim() ? "auto" : "none" }} onClick={handleSubmitLead}>Ver Meu Resultado →</button>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: 14 }}>🔒 Seus dados estão seguros. Não enviamos spam.</p>
          </div>
        </div>
      </div>
    );
  }

  if (showVideo) {
    const vd = showVideo === "video1" ? VIDEO_AFTER_Q3 : VIDEO_AFTER_Q7;
    return (
      <div ref={containerRef} style={base}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: "#060A14", padding: "16px 20px 0" }}><div style={{ maxWidth: 640, margin: "0 auto" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Pausa estratégica</span><span style={{ fontSize: 12, color: "#10B981", fontWeight: 600 }}>{Math.round(progress)}%</span></div><div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 3 }}><div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #059669, #10B981)", borderRadius: 4, transition: "width 0.6s" }} /></div></div></div>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 20px", ...fade }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-block", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 100, padding: "6px 16px", fontSize: 11, fontWeight: 600, color: "#34D399", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>▶ Vídeo Exclusivo · {vd.duration}</div>
            <h2 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 700, lineHeight: 1.3, marginBottom: 12 }}>{vd.title}</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>{vd.subtitle}</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, aspectRatio: "16/9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 32, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(16,185,129,0.06) 0%, transparent 70%)" }} />
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(16,185,129,0.15)", border: "2px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 1 }}><span style={{ fontSize: 28, marginLeft: 4 }}>▶</span></div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 16, zIndex: 1 }}>Placeholder: {vd.placeholder}</p>
          </div>
          <div style={{ textAlign: "center" }}><button style={btnP} onClick={handleVideoNext} onMouseOver={hoverOn} onMouseOut={hoverOff}>Continuar Diagnóstico →</button></div>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[currentQ];
  return (
    <div ref={containerRef} style={base}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "#060A14", padding: "16px 20px 0" }}><div style={{ maxWidth: 640, margin: "0 auto" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Pergunta {currentQ + 1} de 10</span><span style={{ fontSize: 12, color: "#10B981", fontWeight: 600 }}>{Math.round(progress)}%</span></div><div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 3 }}><div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #059669, #10B981)", borderRadius: 4, transition: "width 0.6s" }} /></div></div></div>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 20px", ...fade }}>
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 100, padding: "6px 14px", fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 28 }}>{DIMENSION_INFO[q.dimension].icon} {q.label}</div>
        <h2 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 700, lineHeight: 1.4, marginBottom: 36, maxWidth: 560 }}>{q.question}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {q.options.map((opt, i) => {
            const isSel = selectedOption === opt.score; const letters = ["A", "B", "C", "D"];
            return (
              <button key={i} onClick={() => handleAnswer(currentQ, opt.score)}
                style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", textAlign: "left", background: isSel ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.02)", border: isSel ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "18px 20px", color: isSel ? "#fff" : "rgba(255,255,255,0.7)", fontSize: 15, cursor: "pointer", transition: "all 0.25s", lineHeight: 1.5 }}
                onMouseOver={(e) => { if (!isSel) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}}
                onMouseOut={(e) => { if (!isSel) { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: isSel ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.04)", border: isSel ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0, color: isSel ? "#10B981" : "rgba(255,255,255,0.35)", transition: "all 0.25s" }}>{letters[i]}</span>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>
        {currentQ > 0 && (<button onClick={() => triggerFade(() => { setCurrentQ(currentQ - 1); scrollTop(); })} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: 13, cursor: "pointer", marginTop: 28, padding: "8px 0", display: "flex", alignItems: "center", gap: 6 }}>← Voltar</button>)}
      </div>
    </div>
  );
}
