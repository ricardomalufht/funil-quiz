import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";

const QUESTIONS = [
  {
    id: 1,
    dimension: "clareza",
    label: "Clareza Financeira",
    question: "Hoje, se eu te perguntasse exatamente para onde foi cada real que sua empresa gerou no último mês, você...",
    options: [
      { text: "Não saberia responder com precisão", score: 1 },
      { text: "Teria uma ideia geral, mas sem detalhes concretos", score: 2 },
      { text: "Saberia a maioria, mas com algumas lacunas importantes", score: 3 },
      { text: "Saberia responder com clareza, dados e confiança", score: 4 },
    ],
  },
  {
    id: 2,
    dimension: "previsibilidade",
    label: "Previsibilidade de Caixa",
    question: "Nos últimos 6 meses, quantas vezes você foi pego de surpresa por falta de caixa ou por um pagamento inesperado?",
    options: [
      { text: "Praticamente todo mês tem alguma surpresa desagradável", score: 1 },
      { text: "A cada 2-3 meses algo me pega desprevenido", score: 2 },
      { text: "Raramente — talvez 1 ou 2 vezes no semestre", score: 3 },
      { text: "Nunca. Tenho tudo mapeado com antecedência", score: 4 },
    ],
  },
  {
    id: 3,
    dimension: "autonomia",
    label: "Autonomia Operacional",
    question: "Se você tirasse 15 dias de férias amanhã, sem acesso ao celular, o financeiro da sua empresa...",
    options: [
      { text: "Entraria em caos — ninguém sabe tomar decisão sem mim", score: 1 },
      { text: "Funcionaria no básico, mas com muitos problemas acumulando", score: 2 },
      { text: "Rodaria razoavelmente, com algumas dificuldades pontuais", score: 3 },
      { text: "Funcionaria perfeitamente — meu time é autônomo e preparado", score: 4 },
    ],
  },
  {
    id: 4,
    dimension: "decisao",
    label: "Tomada de Decisão",
    question: "Quando surge uma oportunidade de investimento — novo equipamento, expansão, contratação — como você decide?",
    options: [
      { text: "No feeling — confio na minha experiência e intuição", score: 1 },
      { text: "Consulto o financeiro, mas nem sempre entendo os dados que me trazem", score: 2 },
      { text: "Analiso alguns indicadores antes, mas sem uma metodologia clara", score: 3 },
      { text: "Projeto o impacto no caixa e decido com base em cenários e dados", score: 4 },
    ],
  },
  {
    id: 5,
    dimension: "clareza",
    label: "Clareza Financeira",
    question: "Você sabe dizer, hoje, qual é a diferença entre o lucro contábil da sua empresa (DRE) e o dinheiro real disponível no caixa?",
    options: [
      { text: "Honestamente, não sei explicar essa diferença", score: 1 },
      { text: "Sei que existe uma diferença, mas não sei quantificá-la", score: 2 },
      { text: "Tenho uma noção, mas não acompanho com precisão", score: 3 },
      { text: "Sim — acompanho e entendo perfeitamente essa diferença", score: 4 },
    ],
  },
  {
    id: 6,
    dimension: "autonomia",
    label: "Autonomia Operacional",
    question: "Qual das opções abaixo melhor descreve seu time financeiro hoje?",
    options: [
      { text: "Apenas executa pagamentos e recebimentos — operacional puro", score: 1 },
      { text: "Gera relatórios, mas eu não consigo usá-los na prática", score: 2 },
      { text: "Traz informações úteis, mas falta visão estratégica e proatividade", score: 3 },
      { text: "Pensa estrategicamente, antecipa problemas e traz soluções", score: 4 },
    ],
  },
  {
    id: 7,
    dimension: "previsibilidade",
    label: "Previsibilidade de Caixa",
    question: "Se eu pedisse agora uma projeção confiável do seu fluxo de caixa para os próximos 3 meses, você...",
    options: [
      { text: "Não teria nenhuma projeção — trabalho no dia a dia", score: 1 },
      { text: "Teria algo genérico, sem muita confiança nos números", score: 2 },
      { text: "Teria uma projeção razoável, mas com muitas incertezas", score: 3 },
      { text: "Teria uma projeção detalhada, confiável e atualizada", score: 4 },
    ],
  },
  {
    id: 8,
    dimension: "crescimento",
    label: "Capacidade de Crescimento",
    question: "Se você precisasse pedir crédito no banco amanhã, quão preparado estaria para mostrar seus números e convencer o gerente?",
    options: [
      { text: "Ia passar aperto — meus números não estão organizados e eu não saberia explicar com segurança", score: 1 },
      { text: "Teria o básico, mas ia gaguejar em algumas perguntas e faltar documentos", score: 2 },
      { text: "Estaria razoavelmente preparado, mas precisaria de uns dias pra juntar tudo", score: 3 },
      { text: "Mostraria tudo na hora — está organizado, claro e eu sei explicar cada número", score: 4 },
    ],
  },
  {
    id: 9,
    dimension: "decisao",
    label: "Tomada de Decisão",
    question: "Qual dessas frases melhor descreve sua relação com a gestão financeira da empresa?",
    options: [
      { text: '"O financeiro é um mal necessário que me dá dor de cabeça"', score: 1 },
      { text: '"Sei que é importante, mas não consigo dedicar o tempo que deveria"', score: 2 },
      { text: '"Acompanho regularmente, mas sinto que poderia extrair muito mais"', score: 3 },
      { text: '"O financeiro é meu painel de comando — lidero a partir dele"', score: 4 },
    ],
  },
  {
    id: 10,
    dimension: "crescimento",
    label: "Capacidade de Crescimento",
    question: "Pensando nos próximos 12 meses, qual é o seu maior desafio financeiro?",
    options: [
      { text: "Sobreviver sem sustos e conseguir pagar as contas em dia", score: 1 },
      { text: "Entender para onde o dinheiro está indo e parar de perder margem", score: 2 },
      { text: "Conseguir fazer novos investimentos sem comprometer o caixa", score: 3 },
      { text: "Escalar a empresa com segurança e consistência financeira", score: 4 },
    ],
  },
];

const VIDEO_AFTER_Q3 = {
  title: "Por que sua empresa mostra lucro, mas o caixa não acompanha?",
  subtitle: "Assista esse vídeo de 3 minutos antes de continuar — ele vai mudar a forma como você enxerga seus números.",
  placeholder: "VIDEO_URL_1",
  duration: "3:22",
};

const VIDEO_AFTER_Q7 = {
  title: "O que separa empresários no comando dos que estão no escuro",
  subtitle: "Esse vídeo revela o padrão que encontramos em centenas de empresas de médio porte.",
  placeholder: "VIDEO_URL_2",
  duration: "4:15",
};

const dimTo100 = (raw) => Math.round(((raw - 2) / 6) * 100);
const totalTo100 = (raw) => Math.round(((raw - 10) / 30) * 100);

const DIMENSION_INFO = {
  clareza: {
    name: "Clareza Financeira",
    icon: "👁️",
    color: "#3B82F6",
    low: {
      diagnosis: "Você está operando no escuro. Seu DRE pode mostrar lucro, mas você não sabe para onde o dinheiro realmente vai. Essa falta de visibilidade é a raiz de grande parte dos problemas de caixa.",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Abra sua conta bancária e anote num papel: saldo de hoje, os 5 maiores pagamentos do mês e os 5 maiores recebimentos. Só isso. Olhe para esses 10 números e pergunte: \"Isso faz sentido com o que eu achava?\"" },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "Mande essa mensagem: \"Preciso que você me mostre, em uma página só, o saldo real de caixa de hoje, o total de contas a receber e o total de contas a pagar dos próximos 30 dias. Sem relatório bonito — só os 3 números.\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"Quando foi a última vez que eu sentei e olhei de verdade para os números da minha empresa, sem pressa, sem interrupção? Se não lembro, o problema não é o time — sou eu que não estou dedicando atenção ao que mais importa.\"" },
      ],
    },
    high: {
      diagnosis: "Você tem boa visibilidade sobre seus números. O próximo passo é transformar essa clareza em decisões estratégicas que acelerem a geração de caixa.",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Pegue seu DRE do último mês e circule os 3 maiores custos. Agora pergunte: \"Esses custos cresceram mais rápido que meu faturamento nos últimos 6 meses?\" Se sim, você encontrou seu primeiro vazamento." },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "\"Quero um comparativo simples: nosso lucro do DRE dos últimos 3 meses versus quanto realmente entrou a mais no caixa nesses mesmos meses. Me mostra a diferença entre os dois.\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"Eu sei quais são os 3 maiores ralos de margem do meu negócio? Se eu tivesse que cortar 10% dos custos amanhã, sei exatamente onde cortar sem prejudicar a operação?\"" },
      ],
    },
  },
  previsibilidade: {
    name: "Previsibilidade de Caixa",
    icon: "📊",
    color: "#8B5CF6",
    low: {
      diagnosis: "Sua empresa opera no modo 'reativo'. Sem projeção de caixa, cada mês é uma surpresa — e surpresas financeiras custam caro: juros de antecipação, empréstimos emergenciais, oportunidades perdidas.",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Pegue uma folha e divida em 4 colunas: Semana 1, 2, 3 e 4 do próximo mês. Em cada coluna, escreva de cabeça: o que entra e o que sai. Não precisa ser perfeito — o exercício de pensar nisso já vai te mostrar onde estão os buracos." },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "\"Me lista todos os pagamentos fixos e variáveis dos próximos 30 dias com as datas. E ao lado, tudo que temos pra receber com as datas. Quero ver se tem alguma semana que aperta.\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"Quantas vezes nos últimos 6 meses eu precisei antecipar recebível ou pegar empréstimo de emergência? Se foi mais de 2 vezes, isso não é azar — é falta de planejamento.\"" },
      ],
    },
    high: {
      diagnosis: "Sua previsibilidade de caixa está acima da média. Agora o desafio é refinar a acurácia e usar essas projeções como arma estratégica para negociar melhor e investir na hora certa.",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Compare sua projeção do mês passado com o que realmente aconteceu. Anote as 3 maiores diferenças. Essas diferenças são os pontos cegos que ainda te pegam de surpresa." },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "\"Toda sexta-feira quero receber uma atualização de 3 linhas por WhatsApp: saldo atual, o que vence semana que vem, e se tem algo que me preocupa. Só isso, sem relatório.\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"Estou usando minha previsão de caixa para negociar melhores prazos com fornecedores e bancos? Ou ela só serve pra eu olhar e ter menos medo?\"" },
      ],
    },
  },
  autonomia: {
    name: "Autonomia Operacional",
    icon: "⚙️",
    color: "#10B981",
    low: {
      diagnosis: "Sua empresa depende demais de você para funcionar. Enquanto tudo passar pela sua cabeça, seu crescimento estará travado — e suas férias serão uma miragem.",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Liste as 5 decisões financeiras que você mais toma na semana (aprovar pagamentos, liberar compras, decidir prazos). Agora pergunte: quais dessas eu poderia deixar de fazer se meu time tivesse uma regra clara? Escreva a regra para pelo menos 1 delas." },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "\"Me diz: qual decisão você mais espera eu aprovar e que atrasa tudo? Vamos criar uma regra pra você resolver sozinho sem precisar me consultar.\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"Será que eu não delego porque meu time não é capaz, ou porque eu nunca ensinei a eles o que eu levo em conta pra decidir? Talvez o problema não seja o time — seja eu não ter passado os critérios.\"" },
      ],
    },
    high: {
      diagnosis: "Seu time tem autonomia e você consegue se afastar da operação. Isso é raro e valioso. O próximo passo é elevar o nível das análises que eles trazem — de operacional para estratégico.",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Anote as últimas 3 decisões financeiras importantes que você tomou. Para cada uma, pergunte: meu time poderia ter me trazido essa decisão já mastigada, com recomendação e impacto? Se não trouxe, o que faltou?" },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "\"A partir de agora, quando me trouxer um problema, quero junto: o que você recomenda, por que, e qual o impacto no caixa. Não me traga só o problema — traga a sugestão.\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"Se eu ficar doente por 30 dias, meu time saberia explicar a saúde financeira da empresa pra alguém? Ou tudo isso está só na minha cabeça?\"" },
      ],
    },
  },
  decisao: {
    name: "Tomada de Decisão",
    icon: "🎯",
    color: "#F59E0B",
    low: {
      diagnosis: "Você toma decisões com base em instinto e experiência. Isso te trouxe até aqui, mas no tamanho que sua empresa está hoje, cada decisão no feeling pode custar dezenas de milhares de reais.",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Pense na última decisão financeira importante que você tomou (compra, contratação, investimento). Agora anote: que números eu olhei antes de decidir? Se a resposta for \"nenhum\" ou \"só o saldo da conta\", esse é o problema." },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "\"Me mostra 3 números toda segunda-feira: quanto temos em caixa, quanto temos a receber vencido, e qual nossa margem do mês passado. Pode ser por WhatsApp, em 3 linhas.\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"Quantas vezes eu decidi investir em algo e depois descobri que não tinha caixa? Se isso acontece mais do que eu gostaria de admitir, estou apostando — não gerenciando.\"" },
      ],
    },
    high: {
      diagnosis: "Suas decisões são fundamentadas em dados — isso coloca você à frente da maioria dos empresários. O próximo passo é transformar esse processo em algo que funcione sem você.",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Escreva em um papel as 3 \"regras\" que você usa mentalmente para decidir (ex: \"não invisto se o payback é maior que 12 meses\"). Documentar suas regras é o primeiro passo para ensinar seu time a decidir como você." },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "\"Quero que para qualquer gasto acima de R$[seu valor], você me traga: quanto custa, de onde sai o dinheiro, e o que acontece se a gente NÃO fizer. Sempre essas 3 perguntas respondidas.\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"Das minhas últimas 10 decisões financeiras importantes, quantas eu tomaria diferente se tivesse esperado 48 horas e olhado os números com calma?\"" },
      ],
    },
  },
  crescimento: {
    name: "Capacidade de Crescimento",
    icon: "🚀",
    color: "#EF4444",
    low: {
      diagnosis: "Sua empresa não está preparada para o próximo nível. Sem números organizados, você não consegue negociar crédito com vantagem, planejar uma expansão com segurança, ou provar o valor do que construiu.",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Abra seu extrato bancário dos últimos 3 meses e some quanto entrou vs. quanto saiu. Agora compare com seu lucro no DRE. Se a diferença for grande, você acabou de encontrar o buraco por onde seu crescimento está vazando." },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "\"Preciso que você me mostre quanto a empresa gerou de caixa DE VERDADE nos últimos 3 meses. Não o lucro do DRE — o dinheiro que realmente sobrou na conta. Se não souber calcular, é aí que precisamos começar.\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"Se o banco me ligar amanhã pedindo meus números, eu consigo mandar em 1 hora? Se não, quanto de credibilidade e poder de negociação eu estou perdendo por essa desorganização?\"" },
      ],
    },
    high: {
      diagnosis: "Você está bem posicionado para dar o próximo salto. Com números organizados e visão clara, as portas de crescimento se abrem mais rápido do que você imagina.",
      actions: [
        { type: "solo", emoji: "🔑", label: "Faça você mesmo agora", text: "Liste seus 3 maiores clientes por faturamento. Agora pergunte: qual deles me dá mais lucro REAL? Qual demora mais pra pagar? Muitas vezes o maior cliente é o que mais prende seu caixa." },
        { type: "team", emoji: "📋", label: "Peça ao seu financeiro amanhã", text: "\"Quero um ranking dos nossos top 10 clientes com: faturamento, prazo médio de pagamento e margem. Me mostra quem realmente dá dinheiro e quem só dá trabalho.\"" },
        { type: "mirror", emoji: "🪞", label: "Pergunte a si mesmo", text: "\"Estou crescendo porque escolho crescer, com número na mão — ou porque não sei dizer não para oportunidade nenhuma? Crescimento sem critério é o jeito mais caro de quebrar.\"" },
      ],
    },
  },
};

const LEVELS = [
  { min: 0, max: 23, name: "Cegueira Financeira", tag: "ZONA CRÍTICA", tagColor: "#EF4444", color: "#EF4444", emoji: "🔴", description: "Sua empresa está operando no escuro. Você tem lucro no papel, mas não enxerga para onde o dinheiro vai. Decisões são tomadas por instinto, surpresas financeiras são frequentes, e o crescimento está travado pela falta de visibilidade. Esse é o perfil mais comum — e mais perigoso — entre empresários de médio porte.", urgency: "Cada mês sem clareza financeira pode estar custando entre 3% e 8% da sua margem em ineficiências invisíveis." },
  { min: 24, max: 49, name: "Visão Parcial", tag: "ZONA DE ATENÇÃO", tagColor: "#F59E0B", color: "#F59E0B", emoji: "🟡", description: "Você tem consciência dos problemas, mas ainda não tem as ferramentas e processos para resolvê-los. É como dirigir com o para-brisa embaçado — você vê algo, mas não o suficiente para acelerar com confiança. O risco aqui é se acostumar com essa meia-visão e achar que é 'normal'.", urgency: "Empresas nesse estágio tipicamente conseguem aumentar a geração de caixa em 15-25% nos primeiros 3 meses com os ajustes certos." },
  { min: 50, max: 76, name: "Clareza Emergente", tag: "EM EVOLUÇÃO", tagColor: "#3B82F6", color: "#3B82F6", emoji: "🔵", description: "Você está no caminho certo. Tem boa consciência financeira e alguns processos funcionando, mas ainda há lacunas importantes que impedem você de operar com total confiança. O próximo passo é sistematizar o que já funciona e corrigir os pontos cegos.", urgency: "Você está a 2-3 ajustes estratégicos de distância de ter um negócio verdadeiramente no seu controle." },
  { min: 77, max: 100, name: "Dono no Comando", tag: "NÍVEL AVANÇADO", tagColor: "#10B981", color: "#10B981", emoji: "🟢", description: "Parabéns — você está entre os poucos empresários brasileiros que realmente dominam os números do seu negócio. Sua empresa está pronta para o próximo nível: crescimento acelerado, negociação com bancos de igual para igual, e liberdade real.", urgency: "Mesmo nesse nível, um diagnóstico profundo pode revelar oportunidades de otimização que geram centenas de milhares em caixa adicional." },
];

function RadarChart({ scores }) {
  const dims = ["clareza", "previsibilidade", "autonomia", "decisao", "crescimento"];
  const labels = ["Clareza\nFinanceira", "Previsibilidade\nde Caixa", "Autonomia\nOperacional", "Tomada de\nDecisão", "Capacidade de\nCrescimento"];
  const cx = 160, cy = 160, maxR = 110;
  const angleStep = (2 * Math.PI) / 5;
  const startAngle = -Math.PI / 2;
  const getPoint = (i, r) => {
    const angle = startAngle + i * angleStep;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const dataPoints = dims.map((d, i) => getPoint(i, maxR * (scores[d] / 100)));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";

  return (
    <svg viewBox="0 0 320 320" style={{ width: "100%", maxWidth: 360, margin: "0 auto", display: "block" }}>
      {gridLevels.map((level) => {
        const pts = dims.map((_, i) => getPoint(i, maxR * level));
        const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";
        return <path key={level} d={path} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
      })}
      {dims.map((_, i) => { const [ex, ey] = getPoint(i, maxR); return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />; })}
      <path d={dataPath} fill="rgba(59,130,246,0.15)" stroke="#3B82F6" strokeWidth="2.5" />
      {dataPoints.map(([px, py], i) => (<circle key={i} cx={px} cy={py} r="5" fill={DIMENSION_INFO[dims[i]].color} stroke="#0A0F1C" strokeWidth="2" />))}
      {dims.map((_, i) => {
        const [lx, ly] = getPoint(i, maxR + 32);
        const lines = labels[i].split("\n");
        return (<text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="system-ui">{lines.map((line, li) => (<tspan key={li} x={lx} dy={li === 0 ? 0 : 13}>{line}</tspan>))}</text>);
      })}
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

export default function QuizFunnel({ quizId }) {
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
    const raw = { clareza: 0, previsibilidade: 0, autonomia: 0, decisao: 0, crescimento: 0 };
    QUESTIONS.forEach((q, i) => { if (answers[i] !== undefined) raw[q.dimension] += answers[i]; });
    return raw;
  };
  const dimScores100 = () => {
    const r = getDimScores();
    return { clareza: dimTo100(r.clareza), previsibilidade: dimTo100(r.previsibilidade), autonomia: dimTo100(r.autonomia), decisao: dimTo100(r.decisao), crescimento: dimTo100(r.crescimento) };
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
  const btnP = { background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)", color: "#fff", border: "none", borderRadius: 12, padding: "16px 40px", fontSize: 16, fontWeight: 600, cursor: "pointer", letterSpacing: "0.02em", transition: "all 0.3s", display: "inline-flex", alignItems: "center", gap: 8 };
  const fade = { opacity: fadeIn ? 1 : 0, transform: fadeIn ? "translateY(0)" : "translateY(12px)", transition: "all 0.3s ease" };
  const hoverOn = (e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(37,99,235,0.4)"; };
  const hoverOff = (e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; };

  // ─── LANDING ───
  if (screen === "landing") {
    return (
      <div ref={containerRef} style={base}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 20px", textAlign: "center", ...fade }}>
          <div style={{ display: "inline-block", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 100, padding: "8px 20px", fontSize: 13, fontWeight: 500, color: "#60A5FA", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 32 }}>Teste Gratuito · 3 minutos</div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20, letterSpacing: "-0.02em" }}>
            Qual é o seu nível de{" "}<span style={{ color: "#3B82F6" }}>Domínio do Caixa</span>?
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 540, margin: "0 auto 16px" }}>
            Descubra em 10 perguntas se você está realmente no comando dos números da sua empresa — e receba ações práticas para destravar seu caixa nas próximas 24 horas.
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 40 }}>Mais de 400 empresários já fizeram este diagnóstico</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, maxWidth: 580, margin: "0 auto 48px", textAlign: "left" }}>
            {[{ icon: "📍", text: "Descubra onde seu dinheiro está ficando preso na operação" }, { icon: "📊", text: "Receba seu score de Domínio do Caixa de 0 a 100" }, { icon: "🎯", text: "Ganhe ações práticas para aplicar nas próximas 24h" }].map((item, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "20px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>
          <button style={btnP} onClick={() => triggerFade(() => { setScreen("quiz"); scrollTop(); })} onMouseOver={hoverOn} onMouseOut={hoverOff}>Descobrir Meu Nível →</button>
          <div style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {["Gratuito", "3 minutos", "Resultado imediato"].map((t) => (
              <span key={t} style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6" }} />{t}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULT ───
  if (screen === "result") {
    const scores = dimScores100();
    const rawScores = getDimScores();
    const level = getLevel(score100);
    const dims = ["clareza", "previsibilidade", "autonomia", "decisao", "crescimento"];
    const weakest = dims.reduce((a, b) => (scores[a] <= scores[b] ? a : b));
    const strongest = dims.reduce((a, b) => (scores[a] >= scores[b] ? a : b));

    return (
      <div ref={containerRef} style={{ ...base, overflow: "auto" }}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px", ...fade }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-block", background: `${level.tagColor}15`, border: `1px solid ${level.tagColor}30`, borderRadius: 100, padding: "6px 18px", fontSize: 12, fontWeight: 600, color: level.tagColor, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>{level.tag}</div>
            <h1 style={{ fontSize: "clamp(26px, 4.5vw, 38px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 8 }}>
              {name.split(" ")[0]}, seu nível de{" "}<span style={{ color: level.color }}>Domínio do Caixa</span>:
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>{level.name}</p>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 4, marginBottom: 16 }}>
              <span style={{ fontSize: 64, fontWeight: 800, color: level.color, lineHeight: 1 }}>{score100}</span>
              <span style={{ fontSize: 24, color: "rgba(255,255,255,0.25)", fontWeight: 300 }}>/100</span>
            </div>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>{level.description}</p>
          </div>

          <div style={card}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, textAlign: "center" }}>Seu Mapa de Domínio do Caixa</h3>
            <RadarChart scores={scores} />
            <div style={{ marginTop: 28 }}>
              {dims.map((d) => (<ScoreBar key={d} label={DIMENSION_INFO[d].name} score={scores[d]} color={DIMENSION_INFO[d].color} icon={DIMENSION_INFO[d].icon} />))}
            </div>
          </div>

          <div style={{ background: `${level.tagColor}08`, border: `1px solid ${level.tagColor}20`, borderRadius: 14, padding: "24px 28px", margin: "28px auto", maxWidth: 640, display: "flex", gap: 16, alignItems: "flex-start" }}>
            <span style={{ fontSize: 28, lineHeight: 1 }}>⚡</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: level.tagColor, marginBottom: 6 }}>Dado Importante</div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>{level.urgency}</p>
            </div>
          </div>

          <div style={{ ...card, marginTop: 28, borderColor: `${DIMENSION_INFO[weakest].color}20` }}>
            <div style={{ display: "inline-block", background: `${DIMENSION_INFO[weakest].color}15`, borderRadius: 8, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: DIMENSION_INFO[weakest].color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>⚠️ MAIOR PONTO DE ATENÇÃO</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{DIMENSION_INFO[weakest].icon} {DIMENSION_INFO[weakest].name}</h3>
            <p style={{ fontSize: 14, color: level.tagColor, fontWeight: 600, marginBottom: 16 }}>Score: {scores[weakest]}/100</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 24 }}>{rawScores[weakest] <= 4 ? DIMENSION_INFO[weakest].low.diagnosis : DIMENSION_INFO[weakest].high.diagnosis}</p>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 18, color: "rgba(255,255,255,0.85)" }}>O que fazer nas próximas 24 horas:</div>
            {(rawScores[weakest] <= 4 ? DIMENSION_INFO[weakest].low.actions : DIMENSION_INFO[weakest].high.actions).map((a, i) => (<ActionCard key={i} action={a} />))}
          </div>

          <div style={{ ...card, marginTop: 28, borderColor: `${DIMENSION_INFO[strongest].color}20` }}>
            <div style={{ display: "inline-block", background: `${DIMENSION_INFO[strongest].color}15`, borderRadius: 8, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: DIMENSION_INFO[strongest].color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>💪 SEU PONTO FORTE</div>
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
              return (
                <div key={d} style={{ display: "flex", gap: 14, padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20 }}>{info.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{info.name}</span>
                      <span style={{ fontSize: 12, color: info.color, fontWeight: 600 }}>{scores[d]}/100</span>
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, margin: 0 }}>{topAction.text.length > 130 ? topAction.text.substring(0, 130) + "..." : topAction.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center", marginTop: 48, padding: "48px 28px", background: "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(59,130,246,0.03) 100%)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 20 }}>
            <div style={{ fontSize: 14, color: "#60A5FA", fontWeight: 500, marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>Próximo Passo</div>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, lineHeight: 1.25, marginBottom: 16 }}>
              Essas ações são o primeiro passo.<br /><span style={{ color: "#3B82F6" }}>O Diagnóstico é o mapa completo.</span>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 500, margin: "0 auto 12px" }}>
              Em 40 minutos, mapeamos o Caminho do Dinheiro da sua empresa e identificamos exatamente onde estão os vazamentos que travam seu caixa — com ações específicas para o SEU negócio.
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

  // ─── LEAD CAPTURE ───
  if (screen === "capture") {
    return (
      <div ref={containerRef} style={base}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: "#060A14", padding: "16px 20px 0" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Quase lá!</span>
              <span style={{ fontSize: 12, color: "#3B82F6", fontWeight: 600 }}>95%</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 3 }}><div style={{ width: "95%", height: "100%", background: "linear-gradient(90deg, #2563EB, #3B82F6)", borderRadius: 4 }} /></div>
          </div>
        </div>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "60px 20px", ...fade }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28 }}>📊</div>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>Seu resultado está pronto!</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>Preencha seus dados para receber seu Mapa de Domínio do Caixa com plano de ação personalizado.</p>
          </div>
          <div style={card}>
            {[
              { label: "Seu nome *", value: name, set: setName, placeholder: "Como você gostaria de ser chamado?", type: "text" },
              { label: "E-mail", value: email, set: setEmail, placeholder: "seu@email.com (opcional)", type: "email" },
              { label: "WhatsApp", value: whatsapp, set: setWhatsapp, placeholder: "(11) 99999-9999 (opcional)", type: "tel" },
            ].map((f) => (
              <div key={f.label} style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8, fontWeight: 500 }}>{f.label}</label>
                <input type={f.type} value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.placeholder}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px", color: "#fff", fontSize: 15, outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.4)")} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />
              </div>
            ))}
            <button style={{ ...btnP, width: "100%", justifyContent: "center", marginTop: 12, opacity: name.trim() ? 1 : 0.4, pointerEvents: name.trim() ? "auto" : "none" }} onClick={handleSubmitLead}>Ver Meu Resultado →</button>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: 14 }}>🔒 Seus dados estão seguros. Não enviamos spam.</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── VIDEO INTERSTITIAL ───
  if (showVideo) {
    const vd = showVideo === "video1" ? VIDEO_AFTER_Q3 : VIDEO_AFTER_Q7;
    return (
      <div ref={containerRef} style={base}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: "#060A14", padding: "16px 20px 0" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Pausa estratégica</span>
              <span style={{ fontSize: 12, color: "#3B82F6", fontWeight: 600 }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 3 }}><div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #2563EB, #3B82F6)", borderRadius: 4, transition: "width 0.6s" }} /></div>
          </div>
        </div>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 20px", ...fade }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-block", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 100, padding: "6px 16px", fontSize: 11, fontWeight: 600, color: "#60A5FA", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>▶ Vídeo Exclusivo · {vd.duration}</div>
            <h2 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 700, lineHeight: 1.3, marginBottom: 12 }}>{vd.title}</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>{vd.subtitle}</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, aspectRatio: "16/9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 32, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(59,130,246,0.06) 0%, transparent 70%)" }} />
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(59,130,246,0.15)", border: "2px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 1 }}><span style={{ fontSize: 28, marginLeft: 4 }}>▶</span></div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 16, zIndex: 1 }}>Placeholder: {vd.placeholder}</p>
          </div>
          <div style={{ textAlign: "center" }}><button style={btnP} onClick={handleVideoNext} onMouseOver={hoverOn} onMouseOut={hoverOff}>Continuar Diagnóstico →</button></div>
        </div>
      </div>
    );
  }

  // ─── QUIZ QUESTIONS ───
  const q = QUESTIONS[currentQ];
  return (
    <div ref={containerRef} style={base}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "#060A14", padding: "16px 20px 0" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Pergunta {currentQ + 1} de 10</span>
            <span style={{ fontSize: 12, color: "#3B82F6", fontWeight: 600 }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 3 }}><div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #2563EB, #3B82F6)", borderRadius: 4, transition: "width 0.6s" }} /></div>
        </div>
      </div>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 20px", ...fade }}>
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 100, padding: "6px 14px", fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 28 }}>{DIMENSION_INFO[q.dimension].icon} {q.label}</div>
        <h2 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 700, lineHeight: 1.4, marginBottom: 36, maxWidth: 560 }}>{q.question}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {q.options.map((opt, i) => {
            const isSel = selectedOption === opt.score;
            const letters = ["A", "B", "C", "D"];
            return (
              <button key={i} onClick={() => handleAnswer(currentQ, opt.score)}
                style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", textAlign: "left", background: isSel ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.02)", border: isSel ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "18px 20px", color: isSel ? "#fff" : "rgba(255,255,255,0.7)", fontSize: 15, cursor: "pointer", transition: "all 0.25s", lineHeight: 1.5 }}
                onMouseOver={(e) => { if (!isSel) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}}
                onMouseOut={(e) => { if (!isSel) { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: isSel ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)", border: isSel ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0, color: isSel ? "#3B82F6" : "rgba(255,255,255,0.35)", transition: "all 0.25s" }}>{letters[i]}</span>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>
        {currentQ > 0 && (
          <button onClick={() => triggerFade(() => { setCurrentQ(currentQ - 1); scrollTop(); })}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: 13, cursor: "pointer", marginTop: 28, padding: "8px 0", display: "flex", alignItems: "center", gap: 6 }}>← Voltar</button>
        )}
      </div>
    </div>
  );
}
