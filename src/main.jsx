import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import QuizFunnel from "./QuizFunnel";
import QuizDominioCaixa from "./QuizDominioCaixa";
import QuizCrescimento from "./QuizPotencialCrescimento";
import QuizDiagnosticoCVE from "./QuizDiagnosticoCVE";

const path = window.location.pathname.replace(/\/+$/, "") || "/";

function App() {
  if (path === "/dominio-caixa") {
    return <QuizDominioCaixa quizId="dominio-caixa" />;
  }
  if (path === "/quiz-potencial-crescimento") {
    return <QuizCrescimento quizId="potencial-crescimento" />;
  }
  if (path === "/questionario-diagnostico-cve") {
    return <QuizDiagnosticoCVE quizId="questionario-diagnostico-cve" />;
  }
  // Default: quiz Lucro (also handles /lucro explicitly)
  return <QuizFunnel quizId="lucro" />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
