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
    label: "Preparação para Crescimento",
    question: "Quando sua empresa precisa de crédito ou capital de giro, como isso normalmente acontece?",
    options: [
      { text: "Na emergência — antecipo recebível ou pego empréstimo no susto, com o juro que vier", score: 1 },
      { text: "Negocio com o banco, mas geralmente já estou pressionado e aceito condições ruins", score: 2 },
      { text: "Consigo planejar com alguma antecedência, mas nem sempre pego as melhores taxas", score: 3 },
      { text: "Planejo com antecedência, comparo opções e só tomo crédito quando faz sentido estratégico", score: 4 },
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
    label: "Preparação para Crescimento",
    question: "Pensando nos próximos 12 meses, qual é o seu maior desafio financeiro?",
    options: [
      { text: "Sobreviver sem sustos e conseguir pagar as contas em dia", score: 1 },
      { text: "Entender para onde o dinheiro está indo e parar de perder margem", score: 2 },
      { text: "Conseguir fazer novos investimentos sem comprometer o caixa", score: 3 },
      { text: "Estruturar a empresa para uma possível venda, fusão ou captação", score: 4 },
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

const DIMENSION_INFO = {
  clareza: {
    name: "Clareza Financeira",
    icon: "👁️",
    color: "#3B82F6",
    low: {
      diagnosis: "Você está operando no escuro. Seu DRE pode mostrar lucro, mas você não sabe para onde o dinheiro realmente vai. Essa falta de visibilidade é a raiz de grande parte dos problemas de caixa.",
      actions: [
        "Separe imediatamente o conceito de lucro contábil (DRE) do caixa real — são coisas completamente diferentes",
        "Mapeie o 'Caminho do Dinheiro': da venda até o caixa disponível, identifique cada ponto onde o dinheiro fica parado",
        "Crie um relatório semanal simples: o que entrou, o que saiu, e qual o saldo real (não o contábil)",
      ],
    },
    high: {
      diagnosis: "Você tem boa visibilidade sobre seus números. O próximo passo é transformar essa clareza em decisões estratégicas que acelerem a geração de caixa.",
      actions: [
        "Use sua clareza para identificar os 2-3 maiores vazamentos de margem",
        "Compare sua geração de caixa operacional com benchmarks do seu setor",
        "Documente seu processo de análise para que sua equipe replique sem você",
      ],
    },
  },
  previsibilidade: {
    name: "Previsibilidade de Caixa",
    icon: "📊",
    color: "#8B5CF6",
    low: {
      diagnosis: "Sua empresa opera no modo 'reativo'. Sem projeção de caixa, cada mês é uma surpresa — e surpresas financeiras custam caro (juros, antecipações emergenciais, oportunidades perdidas).",
      actions: [
        "Implemente HOJE uma projeção de caixa semanal de 13 semanas — é o padrão ouro usado por fundos de private equity",
        "Mapeie a sazonalidade da sua empresa: quais meses historicamente apertam e quais folgam",
        "Defina um 'colchão de segurança' mínimo de caixa equivalente a 30-45 dias de despesas fixas",
      ],
    },
    high: {
      diagnosis: "Sua previsibilidade de caixa está acima da média. Agora o desafio é refinar a acurácia e usar essas projeções para decisões estratégicas de investimento e crescimento.",
      actions: [
        "Compare suas projeções com o realizado — qual é a margem de erro? Busque menos de 10%",
        "Crie cenários (otimista, base, pessimista) para os próximos 6-12 meses",
        "Use a previsibilidade como ferramenta de negociação com bancos e fornecedores",
      ],
    },
  },
  autonomia: {
    name: "Autonomia Operacional",
    icon: "⚙️",
    color: "#10B981",
    low: {
      diagnosis: "Sua empresa depende demais de você para funcionar. Isso não é liderança — é gargalo. Enquanto tudo passar por você, seu crescimento estará travado.",
      actions: [
        "Documente os 5 processos financeiros mais críticos que só você sabe fazer",
        "Treine seu time financeiro para 'pensar como dono' — não apenas executar, mas analisar e propor",
        "Implemente reuniões semanais de 30 min com o financeiro focadas em 3 perguntas: o que aconteceu, o que vem pela frente, e onde agir",
      ],
    },
    high: {
      diagnosis: "Seu time tem autonomia e você consegue se afastar da operação. Isso é raro e valioso. O próximo passo é elevar o nível estratégico das análises que eles entregam.",
      actions: [
        "Desafie seu time a trazer insights proativos, não apenas relatórios reativos",
        "Implemente um dashboard executivo que você revise em 15 minutos por semana",
        "Crie um programa de desenvolvimento para seu time pensar em M&A e valuation",
      ],
    },
  },
  decisao: {
    name: "Tomada de Decisão",
    icon: "🎯",
    color: "#F59E0B",
    low: {
      diagnosis: "Você toma decisões com base em instinto, não em dados. Isso funcionou até aqui, mas no tamanho que sua empresa está hoje, cada decisão errada custa dezenas ou centenas de milhares de reais.",
      actions: [
        "Defina 3 KPIs financeiros que você vai olhar TODA semana (ex: caixa líquido, contas a receber vencidas, margem operacional)",
        "Antes de qualquer decisão acima de R$50 mil, exija uma análise de impacto no fluxo de caixa",
        "Crie um 'ritual de decisão': dados — análise — cenários — decisão. Sem dados, não decide",
      ],
    },
    high: {
      diagnosis: "Suas decisões são fundamentadas em dados — isso coloca você à frente de 90% dos empresários brasileiros. Agora é hora de sistematizar isso para escalar.",
      actions: [
        "Crie templates de análise de investimento que seu time possa preparar",
        "Implemente revisões trimestrais de decisões passadas: acertou ou errou? Por quê?",
        "Compartilhe seu processo de decisão com líderes de área para descentralizar com qualidade",
      ],
    },
  },
  crescimento: {
    name: "Preparação para Crescimento",
    icon: "🚀",
    color: "#EF4444",
    low: {
      diagnosis: "Sua empresa não está preparada para o próximo nível. Sem números organizados, você não consegue captar investimento, negociar com bancos de igual para igual, ou planejar uma expansão com segurança.",
      actions: [
        "Organize seu DRE, Balanço Patrimonial e Fluxo de Caixa dos últimos 24 meses — limpo e confiável",
        "Calcule seu EBITDA real e entenda o que ele significa para o valor da sua empresa",
        "Crie um plano financeiro de 12 meses com metas claras de geração de caixa, margem e investimento",
      ],
    },
    high: {
      diagnosis: "Você está bem posicionado para dar o próximo salto. Com números organizados e visão estratégica, as portas de crescimento se abrem naturalmente.",
      actions: [
        "Considere fazer um valuation da sua empresa para entender seu valor de mercado",
        "Prepare um 'information memorandum' simplificado — isso acelera qualquer negociação",
        "Identifique os 2-3 investimentos que mais gerariam retorno nos próximos 12 meses e modele-os",
      ],
    },
  },
};

const LEVELS = [
  {
    min: 10, max: 17,
    name: "Cegueira Financeira",
    tag: "ZONA CRÍTICA",
    tagColor: "#EF4444",
    color: "#EF4444",
    emoji: "🔴",
    description: "Sua empresa está operando no escuro. Você tem lucro no papel, mas não enxerga para onde o dinheiro vai. Decisões são tomadas por instinto, surpresas financeiras são frequentes, e o crescimento está travado pela falta de visibilidade. Esse é o perfil mais comum — e mais perigoso — entre empresários de médio porte.",
    urgency: "Cada mês sem clareza financeira pode estar custando entre 3% e 8% da sua margem em ineficiências invisíveis.",
  },
  {
    min: 18, max: 25,
    name: "Visão Parcial",
    tag: "ZONA DE ATENÇÃO",
    tagColor: "#F59E0B",
    color: "#F59E0B",
    emoji: "🟡",
    description: "Você tem consciência dos problemas, mas ainda não tem as ferramentas e processos para resolvê-los. É como dirigir com o para-brisa embaçado — você vê algo, mas não o suficiente para acelerar com confiança. O risco aqui é se acostumar com essa meia-visão e achar que é 'normal'.",
    urgency: "Empresas nesse estágio tipicamente conseguem aumentar a geração de caixa em 15-25% nos primeiros 3 meses com os ajustes certos.",
  },
  {
    min: 26, max: 33,
    name: "Clareza Emergente",
    tag: "EM EVOLUÇÃO",
    tagColor: "#3B82F6",
    color: "#3B82F6",
    emoji: "🔵",
    description: "Você está no caminho certo. Tem boa consciência financeira e alguns processos funcionando, mas ainda há lacunas importantes que impedem você de operar com total confiança. O próximo passo é sistematizar o que já funciona e corrigir os pontos cegos.",
    urgency: "Você está a 2-3 ajustes estratégicos de distância de ter um negócio verdadeiramente no seu controle.",
  },
  {
    min: 34, max: 40,
    name: "Dono no Comando",
    tag: "NÍVEL AVANÇADO",
    tagColor: "#10B981",
    color: "#10B981",
    emoji: "🟢",
    description: "Parabéns — você está entre os poucos empresários brasileiros que realmente dominam a gestão financeira do seu negócio. Sua empresa está pronta para o próximo nível: captação, M&A, ou crescimento acelerado com segurança.",
    urgency: "Mesmo nesse nível, o diagnóstico pode revelar oportunidades de otimização que geram centenas de milhares em caixa adicional.",
  },
];

function RadarChart({ scores }) {
  const dims = ["clareza", "previsibilidade", "autonomia", "decisao", "crescimento"];
  const labels = ["Clareza\nFinanceira", "Previsibilidade\nde Caixa", "Autonomia\nOperacional", "Tomada de\nDecisão", "Preparação p/\nCrescimento"];
  const cx = 160, cy = 160, maxR = 110;
  const angleStep = (2 * Math.PI) / 5;
  const startAngle = -Math.PI / 2;

  const getPoint = (i, r) => {
    const angle = startAngle + i * angleStep;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const dataPoints = dims.map((d, i) => {
    const val = (scores[d] || 0) / 8;
    return getPoint(i, maxR * val);
  });
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";

  return (
    <svg viewBox="0 0 320 320" style={{ width: "100%", maxWidth: 360, margin: "0 auto", display: "block" }}>
      {gridLevels.map((level) => {
        const pts = dims.map((_, i) => getPoint(i, maxR * level));
        const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";
        return <path key={level} d={path} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
      })}
      {dims.map((_, i) => {
        const [ex, ey] = getPoint(i, maxR);
        return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
      })}
      <path d={dataPath} fill="rgba(59,130,246,0.15)" stroke="#3B82F6" strokeWidth="2.5" />
      {dataPoints.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r="5" fill={DIMENSION_INFO[dims[i]].color} stroke="#0A0F1C" strokeWidth="2" />
      ))}
      {dims.map((_, i) => {
        const [lx, ly] = getPoint(i, maxR + 32);
        const lines = labels[i].split("\n");
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="system-ui">
            {lines.map((line, li) => (
              <tspan key={li} x={lx} dy={li === 0 ? 0 : 13}>{line}</tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}

function ScoreBar({ label, score, maxScore, color, icon }) {
  const pct = (score / maxScore) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>{icon} {label}</span>
        <span style={{ color, fontWeight: 700, fontSize: 15 }}>{score}/{maxScore}</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 10, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 6, transition: "width 1.2s cubic-bezier(.4,0,.2,1)" }} />
      </div>
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

  const triggerFade = useCallback((cb) => {
    setFadeIn(false);
    setTimeout(() => { cb(); setFadeIn(true); }, 300);
  }, []);

  const scrollTop = () => {
    if (containerRef.current) containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);

  const dimensionScores = () => {
    const scores = { clareza: 0, previsibilidade: 0, autonomia: 0, decisao: 0, crescimento: 0 };
    QUESTIONS.forEach((q, i) => {
      if (answers[i] !== undefined) scores[q.dimension] += answers[i];
    });
    return scores;
  };

  const getLevel = (score) => LEVELS.find((l) => score >= l.min && score <= l.max) || LEVELS[0];

  const handleAnswer = (qIndex, score) => {
    setSelectedOption(score);
    setTimeout(() => {
      const newAnswers = { ...answers, [qIndex]: score };
      setAnswers(newAnswers);
      setSelectedOption(null);

      if (qIndex === 2) {
        triggerFade(() => { setShowVideo("video1"); scrollTop(); });
      } else if (qIndex === 6) {
        triggerFade(() => { setShowVideo("video2"); scrollTop(); });
      } else if (qIndex === 9) {
        triggerFade(() => { setScreen("capture"); scrollTop(); });
      } else {
        triggerFade(() => { setCurrentQ(qIndex + 1); scrollTop(); });
      }
    }, 400);
  };

  const handleVideoNext = () => {
    if (showVideo === "video1") {
      triggerFade(() => { setShowVideo(null); setCurrentQ(3); scrollTop(); });
    } else {
      triggerFade(() => { setShowVideo(null); setCurrentQ(7); scrollTop(); });
    }
  };

  const handleSubmitLead = async () => {
    if (!name.trim()) return;

    try {
      const scores = dimensionScores();
      await supabase.from("quiz_leads").insert({
        quiz_id: quizId,
        name: name.trim(),
        email: email.trim() || null,
        whatsapp: whatsapp.trim() || null,
        score: totalScore,
        dimension_scores: scores,
      });
    } catch (err) {
      console.error("Failed to save lead:", err);
    }

    triggerFade(() => { setScreen("result"); scrollTop(); });
  };

  const progress = screen === "landing" ? 0 : screen === "result" ? 100 : ((Object.keys(answers).length) / 10) * 100;

  const baseStyle = {
    minHeight: "100vh",
    background: "#060A14",
    color: "#fff",
    fontFamily: "'Outfit', system-ui, -apple-system, sans-serif",
    overflow: "auto",
  };

  const cardStyle = {
    background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: "32px 28px",
    maxWidth: 640,
    margin: "0 auto",
    position: "relative",
  };

  const btnPrimary = {
    background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "16px 40px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.02em",
    transition: "all 0.3s",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  const fadeStyle = {
    opacity: fadeIn ? 1 : 0,
    transform: fadeIn ? "translateY(0)" : "translateY(12px)",
    transition: "all 0.3s ease",
  };

  // ─── LANDING SCREEN ───
  if (screen === "landing") {
    return (
      <div ref={containerRef} style={baseStyle}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 20px", textAlign: "center", ...fadeStyle }}>
          <div style={{ display: "inline-block", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 100, padding: "8px 20px", fontSize: 13, fontWeight: 500, color: "#60A5FA", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 32 }}>
            Teste Gratuito · 3 minutos
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20, letterSpacing: "-0.02em" }}>
            Sua empresa mostra{" "}
            <span style={{ color: "#3B82F6" }}>lucro</span>,<br />
            mas o caixa diz o{" "}
            <span style={{ color: "#EF4444" }}>contrário</span>?
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 16px" }}>
            Descubra em 10 perguntas qual é o seu nível de maturidade financeira — e receba um plano de ação personalizado para destravar o caixa da sua empresa.
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 40 }}>
            Mais de 400 empresários já fizeram este diagnóstico
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, maxWidth: 580, margin: "0 auto 48px", textAlign: "left" }}>
            {[
              { icon: "📍", text: "Descubra onde seu dinheiro está ficando preso" },
              { icon: "📊", text: "Receba seu score de maturidade financeira" },
              { icon: "🎯", text: "Ganhe ações práticas para melhorar seu caixa" },
            ].map((item, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "20px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>

          <button
            style={btnPrimary}
            onClick={() => triggerFade(() => { setScreen("quiz"); scrollTop(); })}
            onMouseOver={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(37,99,235,0.4)"; }}
            onMouseOut={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}
          >
            Começar Diagnóstico Gratuito →
          </button>

          <div style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {["Gratuito", "3 minutos", "Resultado imediato"].map((t) => (
              <span key={t} style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6" }} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULT SCREEN ───
  if (screen === "result") {
    const scores = dimensionScores();
    const level = getLevel(totalScore);
    const dims = ["clareza", "previsibilidade", "autonomia", "decisao", "crescimento"];
    const sorted = [...dims].sort((a, b) => scores[a] - scores[b]);
    const weakest = sorted[0];
    const strongest = sorted[sorted.length - 1];

    return (
      <div ref={containerRef} style={{ ...baseStyle, overflow: "auto" }}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px", ...fadeStyle }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-block", background: `${level.tagColor}15`, border: `1px solid ${level.tagColor}30`, borderRadius: 100, padding: "6px 18px", fontSize: 12, fontWeight: 600, color: level.tagColor, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
              {level.tag}
            </div>
            <h1 style={{ fontSize: "clamp(26px, 4.5vw, 38px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
              {name.split(" ")[0]}, seu nível é:{" "}
              <span style={{ color: level.color }}>{level.name}</span>
            </h1>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 6, marginBottom: 16 }}>
              <span style={{ fontSize: 56, fontWeight: 800, color: level.color }}>{totalScore}</span>
              <span style={{ fontSize: 22, color: "rgba(255,255,255,0.3)", fontWeight: 300 }}>/40</span>
            </div>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
              {level.description}
            </p>
          </div>

          {/* Score Bars */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, textAlign: "center" }}>Seu Mapa de Maturidade Financeira</h3>
            <div>
              {dims.map((d) => (
                <ScoreBar
                  key={d}
                  label={DIMENSION_INFO[d].name}
                  score={scores[d]}
                  maxScore={8}
                  color={DIMENSION_INFO[d].color}
                  icon={DIMENSION_INFO[d].icon}
                />
              ))}
            </div>
          </div>

          {/* Urgency callout */}
          <div style={{ background: `${level.tagColor}08`, border: `1px solid ${level.tagColor}20`, borderRadius: 14, padding: "24px 28px", margin: "28px auto", maxWidth: 640, display: "flex", gap: 16, alignItems: "flex-start" }}>
            <span style={{ fontSize: 28, lineHeight: 1 }}>⚡</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: level.tagColor, marginBottom: 6 }}>Dado Importante</div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>{level.urgency}</p>
            </div>
          </div>

          {/* Weakest dimension deep dive */}
          <div style={{ ...cardStyle, marginTop: 28, borderColor: `${DIMENSION_INFO[weakest].color}20` }}>
            <div style={{ display: "inline-block", background: `${DIMENSION_INFO[weakest].color}15`, borderRadius: 8, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: DIMENSION_INFO[weakest].color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
              MAIOR PONTO DE ATENÇÃO
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              {DIMENSION_INFO[weakest].icon} {DIMENSION_INFO[weakest].name}: {scores[weakest]}/8
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 20 }}>
              {DIMENSION_INFO[weakest].low.diagnosis}
            </p>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, color: "#60A5FA" }}>
              🔧 Ações práticas para melhorar agora:
            </div>
            {DIMENSION_INFO[weakest].low.actions.map((action, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                <span style={{ background: "rgba(59,130,246,0.15)", color: "#60A5FA", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, margin: 0 }}>{action}</p>
              </div>
            ))}
          </div>

          {/* Strongest dimension */}
          <div style={{ ...cardStyle, marginTop: 28, borderColor: `${DIMENSION_INFO[strongest].color}20` }}>
            <div style={{ display: "inline-block", background: `${DIMENSION_INFO[strongest].color}15`, borderRadius: 8, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: DIMENSION_INFO[strongest].color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
              SEU PONTO FORTE
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              {DIMENSION_INFO[strongest].icon} {DIMENSION_INFO[strongest].name}: {scores[strongest]}/8
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 20 }}>
              {DIMENSION_INFO[strongest].high.diagnosis}
            </p>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, color: "#10B981" }}>
              🚀 Próximos passos para avançar:
            </div>
            {DIMENSION_INFO[strongest].high.actions.map((action, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                <span style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, margin: 0 }}>{action}</p>
              </div>
            ))}
          </div>

          {/* All dimensions quick actions */}
          <div style={{ ...cardStyle, marginTop: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>📋 Resumo: Ações Rápidas por Dimensão</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>A ação mais impactante para cada área da sua gestão financeira</p>
            {dims.map((d) => {
              const info = DIMENSION_INFO[d];
              const isLow = scores[d] <= 4;
              const action = isLow ? info.low.actions[0] : info.high.actions[0];
              return (
                <div key={d} style={{ display: "flex", gap: 14, padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20 }}>{info.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{info.name}</span>
                      <span style={{ fontSize: 12, color: info.color, fontWeight: 600 }}>{scores[d]}/8</span>
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, margin: 0 }}>{action}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center", marginTop: 48, padding: "48px 28px", background: "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(59,130,246,0.03) 100%)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 20 }}>
            <div style={{ fontSize: 14, color: "#60A5FA", fontWeight: 500, marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>Próximo Passo</div>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, lineHeight: 1.25, marginBottom: 16 }}>
              Quer um diagnóstico{" "}
              <span style={{ color: "#3B82F6" }}>profundo e personalizado</span>{" "}
              da sua empresa?
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 12px" }}>
              Em 40 minutos, mapeamos o Caminho do Dinheiro da sua empresa e identificamos exatamente onde estão os vazamentos de caixa.
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>
              Metodologia testada em centenas de empresas · Aplicada por Ricardo Maluf
            </p>
            <button
              style={{ ...btnPrimary, padding: "18px 48px", fontSize: 17 }}
              onClick={() => window.open("#pagina-de-vendas", "_blank")}
              onMouseOver={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(37,99,235,0.4)"; }}
              onMouseOut={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}
            >
              Quero o Diagnóstico Completo →
            </button>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 16 }}>
              Diagnóstico de Fluxo de Caixa · R$397 · Duração: 40 minutos
            </p>
          </div>

          <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 40 }}>
            © 2026 Ricardo Maluf · Todos os direitos reservados
          </p>
        </div>
      </div>
    );
  }

  // ─── LEAD CAPTURE SCREEN ───
  if (screen === "capture") {
    return (
      <div ref={containerRef} style={baseStyle}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: "#060A14", padding: "16px 20px 0" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Quase lá!</span>
              <span style={{ fontSize: 12, color: "#3B82F6", fontWeight: 600 }}>95%</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 3 }}>
              <div style={{ width: "95%", height: "100%", background: "linear-gradient(90deg, #2563EB, #3B82F6)", borderRadius: 4, transition: "width 0.6s" }} />
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "60px 20px", ...fadeStyle }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28 }}>
              📊
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>Seu resultado está pronto!</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
              Preencha seus dados para receber seu diagnóstico personalizado com plano de ação.
            </p>
          </div>

          <div style={cardStyle}>
            {[
              { label: "Seu nome *", value: name, set: setName, placeholder: "Como você gostaria de ser chamado?", type: "text" },
              { label: "E-mail", value: email, set: setEmail, placeholder: "seu@email.com (opcional)", type: "email" },
              { label: "WhatsApp", value: whatsapp, set: setWhatsapp, placeholder: "(11) 99999-9999 (opcional)", type: "tel" },
            ].map((field) => (
              <div key={field.label} style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8, fontWeight: 500 }}>{field.label}</label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.set(e.target.value)}
                  placeholder={field.placeholder}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "14px 16px",
                    color: "#fff",
                    fontSize: 15,
                    outline: "none",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.4)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
            ))}

            <button
              style={{ ...btnPrimary, width: "100%", justifyContent: "center", marginTop: 12, opacity: name.trim() ? 1 : 0.4, pointerEvents: name.trim() ? "auto" : "none" }}
              onClick={handleSubmitLead}
            >
              Ver Meu Resultado →
            </button>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: 14 }}>
              🔒 Seus dados estão seguros. Não enviamos spam.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── VIDEO INTERSTITIAL ───
  if (showVideo) {
    const videoData = showVideo === "video1" ? VIDEO_AFTER_Q3 : VIDEO_AFTER_Q7;
    return (
      <div ref={containerRef} style={baseStyle}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: "#060A14", padding: "16px 20px 0" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Pausa estratégica</span>
              <span style={{ fontSize: 12, color: "#3B82F6", fontWeight: 600 }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 3 }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #2563EB, #3B82F6)", borderRadius: 4, transition: "width 0.6s" }} />
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 20px", ...fadeStyle }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-block", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 100, padding: "6px 16px", fontSize: 11, fontWeight: 600, color: "#60A5FA", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
              ▶ Vídeo Exclusivo · {videoData.duration}
            </div>
            <h2 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 700, lineHeight: 1.3, marginBottom: 12 }}>
              {videoData.title}
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>
              {videoData.subtitle}
            </p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, aspectRatio: "16/9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 32, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(59,130,246,0.06) 0%, transparent 70%)" }} />
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(59,130,246,0.15)", border: "2px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.3s", zIndex: 1 }}>
              <span style={{ fontSize: 28, marginLeft: 4 }}>▶</span>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 16, zIndex: 1 }}>
              Placeholder: {videoData.placeholder}
            </p>
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              style={btnPrimary}
              onClick={handleVideoNext}
              onMouseOver={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(37,99,235,0.4)"; }}
              onMouseOut={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}
            >
              Continuar Diagnóstico →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── QUIZ QUESTIONS ───
  const q = QUESTIONS[currentQ];

  return (
    <div ref={containerRef} style={baseStyle}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "#060A14", padding: "16px 20px 0" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Pergunta {currentQ + 1} de 10</span>
            <span style={{ fontSize: 12, color: "#3B82F6", fontWeight: 600 }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 3 }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #2563EB, #3B82F6)", borderRadius: 4, transition: "width 0.6s" }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 20px", ...fadeStyle }}>
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 100, padding: "6px 14px", fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 28 }}>
          {DIMENSION_INFO[q.dimension].icon} {q.label}
        </div>

        <h2 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 700, lineHeight: 1.4, marginBottom: 36, maxWidth: 560 }}>
          {q.question}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {q.options.map((opt, i) => {
            const isSelected = selectedOption === opt.score;
            const letters = ["A", "B", "C", "D"];
            return (
              <button
                key={i}
                onClick={() => handleAnswer(currentQ, opt.score)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  width: "100%",
                  textAlign: "left",
                  background: isSelected ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.02)",
                  border: isSelected ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14,
                  padding: "18px 20px",
                  color: isSelected ? "#fff" : "rgba(255,255,255,0.7)",
                  fontSize: 15,
                  cursor: "pointer",
                  transition: "all 0.25s",
                  lineHeight: 1.5,
                }}
                onMouseOver={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  }
                }}
              >
                <span style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: isSelected ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                  border: isSelected ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  flexShrink: 0,
                  color: isSelected ? "#3B82F6" : "rgba(255,255,255,0.35)",
                  transition: "all 0.25s",
                }}>
                  {letters[i]}
                </span>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>

        {currentQ > 0 && (
          <button
            onClick={() => triggerFade(() => { setCurrentQ(currentQ - 1); scrollTop(); })}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: 13, cursor: "pointer", marginTop: 28, padding: "8px 0", display: "flex", alignItems: "center", gap: 6 }}
          >
            ← Voltar
          </button>
        )}
      </div>
    </div>
  );
}
