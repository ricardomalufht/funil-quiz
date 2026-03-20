import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import QuizFunnel from "./QuizFunnel";

const quizId = import.meta.env.VITE_QUIZ_ID;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QuizFunnel quizId={quizId} />
  </StrictMode>
);
