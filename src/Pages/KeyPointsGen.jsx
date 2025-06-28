import { useState, useRef } from "react";
import { FaFileUpload, FaMagic, FaSpinner, FaCopy } from "react-icons/fa";
import * as mammoth from "mammoth";
import "../Style/KeyPointsGen.css";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { GoogleGenerativeAI } from "@google/generative-ai";
GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.1.91/pdf.worker.min.js";

const KeyPointsGen = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [keyPoints, setKeyPoints] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const fileInputRef = useRef(null);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const extractText = async (file) => {
    setIsProcessing(true);
    setKeyPoints([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      let text = "";

      if (file.type === "application/pdf") {
        const loadingTask = getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const pagesPromises = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          pagesPromises.push(
            pdf.getPage(pageNum).then((page) =>
              page.getTextContent().then((content) => {
                return content.items.map((item) => item.str).join(" ");
              })
            )
          );
        }

        const pagesText = await Promise.all(pagesPromises);
        text = pagesText.join(" ");
      } else if (file.type.includes("word") || file.name.endsWith(".docx")) {
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (file.type.includes("text") || file.name.endsWith(".txt")) {
        text = await file.text();
      } else {
        throw new Error("Unsupported file type");
      }

      setExtractedText(text);
      setUploadedFile(file);
    } catch (error) {
      console.error("Error processing document:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateKeyPoints = async () => {
    if (!extractedText) return;

    setIsSummarizing(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Extract 10 key points from the following text in simple, concise bullet points. 
    Each point should be short (1 sentence max) and easy to understand. Focus on the most important concepts.
    Return only the bullet points without any additional text or numbering.
    
    Text: ${extractedText.substring(0, 30000)}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const points = text
        .split("\n")
        .filter((point) => point.trim().length > 0)
        .map((point, index) => ({
          id: index,
          point: point.replace(/^[-•*]\s*/, "").trim(),
          isImportant: index < 4,
        }));

      setKeyPoints(points);
    } catch (error) {
      console.error("Error generating key points:", error);
      const sentences = extractedText
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0);
      const importantSentences = sentences
        .filter((s) => s.split(" ").length > 5)
        .sort((a, b) => b.split(" ").length - a.split(" ").length)
        .slice(0, 10);

      setKeyPoints(
        importantSentences.map((sentence, index) => ({
          id: index,
          point: sentence.trim(),
          isImportant: index < 4,
        }))
      );
      alert("AI generation failed. Using basic extraction method instead.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const copyKeyPoints = () => {
    const textToCopy = keyPoints.map((kp) => `• ${kp.point}`).join("\n");
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => alert("Key points copied to clipboard!"))
      .catch((err) => console.error("Failed to copy:", err));
  };

  return (
    <div className="Keypnt">
      <div className="resource-finder-container">
        <h2 className="section-title">Study Material Summarizer</h2>
        <h3 className="keypnt-desc">
          {" "}
          "From pages to punchlines in seconds! <br />
          📑➡️✨
          <br />
          SmartSummary uses AI to extract the golden nuggets from your
          documents. No more highlighting wars - get automatic, organized key
          points perfect for last-minute revisions and cheat sheets."
        </h3>
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
        <h4 className="upload-hint-warning">If your format isn't supported:</h4>
        <div className="upload-instructions">
          <li>
            Copy the text into a .txt file OR paste into Word and save as .docx
          </li>
        </div>
        <p className="section-description">
          Upload your study materials to extract key points
        </p>

        <div className="upload-section">
          <label className="upload-btn">
            <FaFileUpload className="upload-icon" />
            <span>{uploadedFile ? uploadedFile.name : "Upload Document"}</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) =>
                e.target.files[0] && extractText(e.target.files[0])
              }
              accept=".pdf,.docx,.txt"
            />
          </label>
          {uploadedFile && (
            <button
              onClick={() => fileInputRef.current.click()}
              className="change-file-btn"
            >
              Change File
            </button>
          )}
        </div>

        {isProcessing && (
          <div className="processing-indicator">
            <FaSpinner className="spinner" />
            <p>Processing document...</p>
          </div>
        )}

        {extractedText && !isProcessing && (
          <div className="action-section">
            <button
              onClick={generateKeyPoints}
              disabled={isSummarizing}
              className="summarize-btn"
            >
              <FaMagic className="summarize-icon" />
              {isSummarizing
                ? "Generating Key Points..."
                : "Extract Key Points"}
            </button>
          </div>
        )}

        {isSummarizing && (
          <div className="processing-indicator">
            <FaSpinner className="spinner" />
            <p>Analyzing document content...</p>
          </div>
        )}

        {keyPoints.length > 0 && (
          <div className="key-points-section">
            <div className="key-points-header">
              <h3>Key Points</h3>
              <button
                onClick={copyKeyPoints}
                className="copy-btn"
                title="Copy to clipboard"
              >
                <FaCopy /> Copy
              </button>
            </div>

            <ul className="key-points-list">
              {keyPoints.map((point) => (
                <li
                  key={point.id}
                  className={`key-point ${
                    point.isImportant ? "important" : ""
                  }`}
                >
                  {point.point}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="supported-formats">
          <p>Supported formats: PDF, DOCX, TXT</p>
        </div>
      </div>
    </div>
  );
};

export default KeyPointsGen;
