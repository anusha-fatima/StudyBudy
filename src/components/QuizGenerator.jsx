import { useState, useCallback } from "react";
import * as mammoth from "mammoth";
import {
  FaFileUpload,
  FaSpinner,
  FaQuestionCircle,
  FaVolumeUp,
} from "react-icons/fa";
import "../Style/QuizGenerator.css";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { GoogleGenerativeAI } from "@google/generative-ai";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const QuizGenerator = ({ onDocumentProcessed, documentText }) => {
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [retryQuestions, setRetryQuestions] = useState([]);
  const [apiError, setApiError] = useState(null);

  // Proper shuffle array implementation (Fisher-Yates algorithm)
  const shuffleArray = useCallback((array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  const getDistractors = useCallback(
    (text) => {
      const words = text.match(/\b[A-Z][a-z]+\b|\b\w{4,}\b/gi) || [];
      const uniqueWords = [...new Set(words)]
        .filter(
          (word) =>
            word.length > 3 &&
            !word.match(
              /^(the|and|but|for|are|was|were|this|that|with|from|which)$/i
            )
        )
        .slice(0, 20);
      return shuffleArray(uniqueWords).slice(0, 3);
    },
    [shuffleArray]
  );

  const extractTextFromPDF = useCallback(async (arrayBuffer) => {
    try {
      const loadingTask = getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      let text = "";

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(" ");
        if (i % 5 === 0) await new Promise((resolve) => setTimeout(resolve, 0));
      }

      return text;
    } catch (error) {
      console.error("PDF processing error:", error);
      throw new Error(
        "Failed to process PDF. Please ensure it contains selectable text."
      );
    }
  }, []);

  const generateFallbackQuestions = useCallback(
    (text) => {
      const cleanedText = text
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .replace(/[^a-zA-Z0-9 .,;?!-]/g, "");

      const definitions =
        cleanedText.match(
          /([A-Z][a-z]+(?:\s+[A-Za-z]+)*)\s+(?:is|are|means)\s+([^.!?]+)/gi
        ) || [];
      const lists =
        cleanedText.match(
          /(([A-Za-z]+(?:-[A-Za-z]+)?)(,\s|\sand\s|\sor\s)){2,}[A-Za-z]+/gi
        ) || [];

      const definitionQs = definitions.slice(0, 5).map((def, i) => {
        const parts = def.split(/\s+(?:is|are|means)\s+/i);
        const options = shuffleArray([
          parts[1].trim(),
          ...getDistractors(cleanedText),
        ]);

        return {
          id: `def-${i}`,
          question: `What is ${parts[0].trim()}?`,
          options: options.map((text) => ({
            text,
            correct: text === parts[1].trim(),
          })),
          explanation: "Definition from document",
          correctAnswer: options.findIndex((opt) => opt === parts[1].trim()),
        };
      });

      const listQs = lists.slice(0, 5).map((list, i) => {
        const items = list.split(/\s*,\s*|\s+(?:and|or)\s+/gi).filter(Boolean);
        const options = shuffleArray([
          ...items,
          getDistractors(cleanedText)[0],
        ]);

        return {
          id: `list-${i}`,
          question: `Which item doesn't belong with these: ${items.join(
            ", "
          )}?`,
          options: options.map((text) => ({
            text,
            correct: !items.includes(text),
          })),
          explanation: "List from document",
          correctAnswer: options.findIndex((opt) => !items.includes(opt)),
        };
      });

      return shuffleArray([...definitionQs, ...listQs]).slice(0, 10);
    },
    [getDistractors, shuffleArray]
  );

  const processDocument = useCallback(
    async (file) => {
      if (!file && !documentText) return;
      setIsLoading(true);
      setApiError(null);

      try {
        let extractedText = documentText || "";
        if (file) {
          if (file.size > 5 * 1024 * 1024) {
            throw new Error("File size exceeds 5MB limit");
          }

          const arrayBuffer = await file.arrayBuffer();
          if (file.type === "application/pdf") {
            extractedText = await extractTextFromPDF(arrayBuffer);
          } else if (
            file.type.includes("word") ||
            file.name.endsWith(".docx")
          ) {
            const result = await mammoth.extractRawText({ arrayBuffer });
            extractedText = result.value;
          } else if (file.type.includes("text")) {
            extractedText = await file.text();
          } else {
            throw new Error("Unsupported file type");
          }
        }

        onDocumentProcessed(extractedText);
        const { totalQuestions, analysis } = await generateQuestionsFromText(
          extractedText
        );

        const message = analysis
          ? `Generated ${totalQuestions} questions covering ${analysis.total_concepts} key concepts from your document.`
          : `Generated ${totalQuestions} questions from your document content.`;

        setApiError(message);
      } catch (error) {
        console.error("Document processing error:", error);
        setApiError(error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [
      documentText,
      extractTextFromPDF,
      onDocumentProcessed,
      generateFallbackQuestions,
    ]
  );

  const generateQuestionsFromText = async (text) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Analyze the following text and generate as many high-quality quiz questions as possible. 
    Focus on key concepts, important details, and relationships in the text.
    Return JSON format:
    {
      "questions": [
        {
          "question": "",
          "options": [],
          "answer": 0,
          "explanation": ""
        }
      ],
      "analysis": {
        "total_concepts": number,
        "questions_generated": number
      }
    }
    Text: ${text.substring(0, 30000)}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();

      const jsonString = textResponse.replace(/```json|```/g, "");
      const data = JSON.parse(jsonString);

      if (!data?.questions) {
        throw new Error("Invalid response format from API");
      }

      const formattedQuestions = data.questions.map((q, i) => ({
        id: `q-${i}`,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.answer || 0,
        explanation: q.explanation || "",
      }));

      setQuizQuestions(formattedQuestions);

      return {
        totalQuestions: formattedQuestions.length,
        analysis: data.analysis || null,
      };
    } catch (error) {
      console.error("API Error:", error);
      setApiError(error.message);
      const fallbackQuestions = generateFallbackQuestions(text);
      setQuizQuestions(fallbackQuestions);
      return {
        totalQuestions: fallbackQuestions.length,
        analysis: null,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = useCallback((questionId, answerIndex) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  }, []);

  const handleRetry = useCallback(() => {
    setRetryQuestions([...quizQuestions]);
    setQuizQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        userAnswers: {},
        showFeedback: false,
      }))
    );
    setUserAnswers({});
  }, [quizQuestions]);

  const speakText = useCallback((text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return (
    <section
      id="quiz-section"
      className="quiz-generator-section"
      aria-labelledby="quiz-generator-heading"
    >
      <div className="quiz-container">
        <div className="section-title">
          <h2 id="quiz-generator-heading">
            <FaQuestionCircle className="icon" aria-hidden="true" />
            Quiz Generator
          </h2>
        </div>

        <div className="document-upload">
          <label className="upload-label">
            <FaFileUpload className="upload-icon" aria-hidden="true" />
            <span>Upload Document</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => processDocument(e.target.files[0])}
              className="file-input"
              aria-label="Upload document for quiz generation"
              disabled={isLoading}
            />
          </label>
          <p className="upload-hint">
            Only Supports PDF, DOCX, and TXT files (max 5MB)
          </p>
          <h4>Having trouble uploading?</h4>

          <h4 className="upload-hint-warning">If your file is too large:</h4>
          <div className="upload-instructions">
            <li>
              Extract just the important sections AND Save as a new smaller file
            </li>
          </div>
          <h4 className="upload-hint-warning">
            If your format isn't supported:
          </h4>
          <div className="upload-instructions">
            <li>
              Copy the text into a .txt file OR paste into Word and save as
              .docx
            </li>
          </div>

          <h4 className="upload-hint-warning">For PDFs:</h4>
          <div className="upload-instructions">
            <li>
              Ensure text is selectable (not scanned images) OR Try converting
              with OCR tools if needed
            </li>
          </div>
        </div>

        {isLoading && (
          <div className="loading-state" aria-live="polite">
            <FaSpinner className="spinner" aria-hidden="true" />
            <p>Processing your document...</p>
          </div>
        )}

        {apiError && (
          <div
            className={`info-message ${
              apiError.startsWith("Generated") ? "success" : "error"
            }`}
            aria-live="polite"
          >
            <p>{apiError}</p>
          </div>
        )}
        {quizQuestions.length > 0 && (
          <div className="quiz-results">
            <h3>Generated Quiz Questions</h3>
            <div className="questions-list">
              {quizQuestions.map((question) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <h4>{question.question}</h4>
                    <button
                      onClick={() => speakText(question.question)}
                      className="speak-button"
                      aria-label={`Speak question: ${question.question}`}
                    >
                      <FaVolumeUp aria-hidden="true" />
                    </button>
                  </div>

                  <div
                    className="options-grid"
                    role="group"
                    aria-label="Answer options"
                  >
                    {question.options.map((option, idx) => (
                      <button
                        key={idx}
                        className={`option-button ${
                          userAnswers[question.id] === idx ? "selected" : ""
                        } ${
                          userAnswers[question.id] !== undefined &&
                          idx === question.correctAnswer
                            ? "correct"
                            : ""
                        }`}
                        onClick={() => handleAnswerSelect(question.id, idx)}
                        aria-pressed={userAnswers[question.id] === idx}
                        disabled={userAnswers[question.id] !== undefined}
                      >
                        {option.text || option}
                      </button>
                    ))}
                  </div>

                  {userAnswers[question.id] !== undefined && (
                    <div className="question-feedback" aria-live="polite">
                      {userAnswers[question.id] === question.correctAnswer ? (
                        <span className="correct-feedback">
                          ✓ Correct! {question.explanation}
                        </span>
                      ) : (
                        <>
                          <span className="incorrect-feedback">
                            ✗ The correct answer is "
                            {question.options[question.correctAnswer].text ||
                              question.options[question.correctAnswer]}
                            "
                            {question.explanation &&
                              ` (${question.explanation})`}
                          </span>
                          <button
                            onClick={handleRetry}
                            className="retry-button"
                          >
                            Try Again
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="quiz-actions">
              <button
                onClick={() =>
                  retryQuestions.length
                    ? setQuizQuestions(retryQuestions)
                    : processDocument()
                }
                className="generate-button"
                disabled={isLoading}
                aria-label={
                  retryQuestions.length
                    ? "Retry quiz questions"
                    : "Generate new quiz questions"
                }
              >
                {retryQuestions.length
                  ? "Retry Quiz"
                  : "Generate New Questions"}
              </button>

              {documentText && (
                <>
                  <button
                    onClick={() => speakText(documentText)}
                    className="speech-button"
                    disabled={isLoading}
                    aria-label="Read entire document text"
                  >
                    <FaVolumeUp aria-hidden="true" /> Read Document
                  </button>

                  <button
                    onClick={() => window.speechSynthesis.cancel()}
                    className="stop-speech-button"
                    aria-label="Stop speech synthesis"
                  >
                    Stop Speech
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuizGenerator;
