import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import QuizFunnel from "./QuizFunnel";
import QuizDominioCaixa from "./QuizDominioCaixa";

const path = window.location.pathname.replace(/\/+$/, "") || "/";

function App() {
  if (path === "/dominio-caixa") {
    return <QuizDominioCaixa quizId="dominio-caixa" />;
  }
  // Default: quiz Lucro (also handles /lucro explicitly)
  return <QuizFunnel quizId="lucro" />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
