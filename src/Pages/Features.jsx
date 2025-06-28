import React, { useState, useEffect, useRef } from "react";
import {
  FaUniversalAccess,
  FaVolumeUp,
  FaVolumeMute,
  FaKeyboard,
  FaUpload,
} from "react-icons/fa";
import * as mammoth from "mammoth";
import "../Style/Features.css";
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

const Features = () => {
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);
  const [currentReading, setCurrentReading] = useState("");
  const [readingSpeed, setReadingSpeed] = useState(1.0);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const screenReaderMessages = {
    welcome:
      "Welcome to Study Buddy Screen Reader. Press U to upload a document, S to adjust speed, and R to repeat.",
    upload: "Press U to upload a document for the screen reader.",
    processing: "Processing your document. Please wait...",
  };

  useEffect(() => {
    if (isScreenReaderActive && extractedText) {
      speakMessage("Document ready. Press R to hear the content.");
    } else if (isScreenReaderActive) {
      speakMessage(screenReaderMessages.welcome);
    }
  }, [isScreenReaderActive]);

  const speakMessage = (message, interrupt = true) => {
    if ("speechSynthesis" in window) {
      if (interrupt) window.speechSynthesis.cancel();
      setCurrentReading(message);

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = readingSpeed;
      utterance.onend = () => setCurrentReading("");

      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isScreenReaderActive) return;

      switch (e.key.toLowerCase()) {
        case "u":
          fileInputRef.current.click();
          speakMessage(screenReaderMessages.upload);
          break;
        case "r":
          if (extractedText) {
            speakMessage(
              `Document content: ${extractedText.substring(0, 1000)}`,
              false
            );
          } else if (currentReading) {
            speakMessage(currentReading);
          } else {
            speakMessage("No document content available.");
          }
          break;
        case "s":
          const newSpeed = e.shiftKey
            ? Math.max(0.5, readingSpeed - 0.1)
            : Math.min(2.0, readingSpeed + 0.1);
          setReadingSpeed(newSpeed);
          speakMessage(`Reading speed set to ${newSpeed.toFixed(1)}`);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isScreenReaderActive, extractedText, readingSpeed, currentReading]);

  const extractText = async (file) => {
    setIsProcessing(true);
    speakMessage(screenReaderMessages.processing, false);
  
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
      setUploadedDocument(file);
      speakMessage(
        `Document ${file.name} processed successfully. Press R to hear the content.`
      );
    } catch (error) {
      console.error("Error processing document:", error);
      speakMessage(`Error: Could not process the document. ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  

  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    extractText(file);
  };

  const toggleScreenReader = () => {
    setIsScreenReaderActive(!isScreenReaderActive);
    if (!isScreenReaderActive) {
      speakMessage(screenReaderMessages.welcome);
    } else {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="featuress">
      <div className="features-container" aria-live="polite">
        <h1 className="features-title">
          <FaUniversalAccess className="icon-keyptn" /> Document Reader
        </h1>
        <h3>
          "Let your study materials speak to you! <br />
          📖➡️🔊 <br />
          ReadAloud transforms textbooks, notes, and documents into
          crystal-clear audio. Perfect for auditory learners, multitasking, or
          proofreading. Just upload and listen - your personal academic narrator
          is ready!"
        </h3>
        <div
          className={`screen-reader-panel ${
            isScreenReaderActive ? "active" : ""
          }`}
        >
          <div className="accessibility-controls">
            <button
              onClick={toggleScreenReader}
              className="accessibility-button"
              aria-label={
                isScreenReaderActive
                  ? "Turn off screen reader"
                  : "Turn on screen reader"
              }
            >
              {isScreenReaderActive ? <FaVolumeMute /> : <FaVolumeUp />}
              {isScreenReaderActive
                ? " Stop Screen Reader"
                : " Start Screen Reader"}
            </button>

            {isScreenReaderActive && (
              <>
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="accessibility-button"
                  aria-label="Upload document"
                >
                  <FaUpload /> Upload Document
                </button>

                <div className="speed-control">
                  <label htmlFor="reading-speed">Speed:</label>
                  <input
                    id="reading-speed"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={readingSpeed}
                    onChange={(e) =>
                      setReadingSpeed(parseFloat(e.target.value))
                    }
                    aria-label="Reading speed control"
                  />
                  <span>{readingSpeed.toFixed(1)}x</span>
                </div>
              </>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleDocumentUpload}
              accept=".txt,.pdf,.docx"
              style={{ display: "none" }}
              aria-hidden="true"
            />
          </div>

          {isScreenReaderActive && (
            <div className="keyboard-instructions">
              <h3>
                <FaKeyboard /> Keyboard Shortcuts
              </h3>
              <ul>
                <li>
                  <strong>U</strong>: Upload document
                </li>
                <li>
                  <strong>R</strong>: Read document content
                </li>
                <li>
                  <strong>S</strong>: Increase speed (+Shift to decrease)
                </li>
              </ul>
            </div>
          )}
        </div>

        {isProcessing && (
          <div className="processing-message">
            <p>Processing document... Please wait.</p>
          </div>
        )}

        {uploadedDocument && !isProcessing && (
          <div className="document-info">
            <h3>Current Document:</h3>
            <p>{uploadedDocument.name}</p>
            <div className="document-actions">
              <button
                onClick={() =>
                  speakMessage(
                    `Document content: ${extractedText.substring(0, 1000)}`,
                    false
                  )
                }
                className="read-button"
              >
                Read Document
              </button>
              <button
                onClick={() => fileInputRef.current.click()}
                className="change-document-button"
              >
                Change Document
              </button>
              <button
                onClick={() => window.speechSynthesis.cancel()}
                className="change-document-button"
              >
                Stop Speech
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Features;
