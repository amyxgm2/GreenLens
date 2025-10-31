import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Scanner.css";

const Scanner = () => {
  const [file, setFile] = useState(null);
  const [analyzedImages, setAnalyzedImages] = useState([]); // Store all analyzed images
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // Only reset file and preview, keep chat history
    setFile(selectedFile || null);
    setError(null);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:4000/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();

      // Add analyzed image to history
      const newAnalyzedImage = {
        id: Date.now(),
        file: file,
        preview: preview,
        result: data,
        timestamp: new Date(),
      };

      setAnalyzedImages((prev) => [...prev, newAnalyzedImage]);

      // Add AI message to chat
      const aiMessage = {
        role: "assistant",
        content: `I've analyzed your product! Here's what I found:\n\nSustainability Score: ${data.greenScore}/100\n\n${data.summary}\n\nFeel free to ask me any questions about this product's environmental impact!`,
        timestamp: new Date(),
        imageId: newAnalyzedImage.id,
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Reset file input for next upload
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while analyzing!");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || analyzedImages.length === 0) return;

    const userMessage = {
      role: "user",
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setChatLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: inputText }),
      });

      if (!res.ok) throw new Error("Chat error");

      const data = await res.json();
      const aiMessage = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      const fallbackMessage = {
        role: "assistant",
        content: "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "text-success";
    if (score >= 40) return "text-warning";
    return "text-danger";
  };

  return (
    <div className="container py-5">
      {/* Header / Intro Section */}
      {analyzedImages.length === 0 && !file && (
        <div className="text-center mb-5">
          <h1 className="fw-bold">Welcome to GreenLens!</h1>
          <h4 className="fw-normal">
            Upload a product photo to analyze its eco impact, recyclability, and reuse potential.
          </h4>
          <p className="text-secondary mt-3">
            Use one of the most common prompts below or start your own.
          </p>

          <div className="row justify-content-center g-3 mt-4">
            {[
              "How can I reuse this?",
              "Summarize the image",
              "What does the sustainability score mean?",
              "How can I make an impact?",
            ].map((text, index) => (
              <div key={index} className="col-md-2 d-flex">
                <div
                  className="card flex-fill d-flex align-items-center justify-content-center p-3 shadow-sm"
                  style={{
                    height: "120px",
                  }}
                >
                  {text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyzed Images History */}
      {analyzedImages.length > 0 && (
        <div className="mb-4">
          <h4 className="fw-bold mb-3">Analyzed Products</h4>
          {analyzedImages.map((item) => (
            <div key={item.id} className="card p-4 mb-3">
              <div className="row align-items-start">
                {/* Left Side: Image Preview */}
                <div
                  className="col-md-5 text-center position-relative"
                  style={{ maxWidth: "300px" }}
                >
                  <img
                    src={item.preview}
                    alt="Analyzed preview"
                    className="img-thumbnail"
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                  />
                  <div className="text-secondary small mt-2">
                    <p className="mb-1">{item.file?.name}</p>
                    <p>{(item.file?.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>

                {/* Right Side: Analysis Results */}
                <div className="col-md-7">
                  <h4 className="fw-bold mb-3">Sustainability Score</h4>
                  <h1
                    className={`fw-bold ${getScoreColor(
                      item.result.greenScore
                    )}`}
                  >
                    {item.result.greenScore}
                  </h1>
                  <p className="text-secondary">{item.result.summary}</p>
                  <div className="row text-center mt-3">
                    <div className="col-md-6 col-lg-3">
                      <p className="fw-bold mb-1">Energy Use</p>
                      <p>{item.result.energyUse}</p>
                    </div>
                    <div className="col-md-6 col-lg-3">
                      <p className="fw-bold mb-1">Recycle</p>
                      <p>{item.result.recyclability}</p>
                    </div>
                    <div className="col-md-6 col-lg-3">
                      <p className="fw-bold mb-1">Ethics</p>
                      <p>{item.result.ethics || "N/A"}</p>
                    </div>
                    <div className="col-md-6 col-lg-3">
                      <p className="fw-bold mb-1">Ecosystem Impact</p>
                      <p>{item.result.ecosystemImpact || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Section */}
      {messages.length > 0 && (
        <div className="mb-4">
          <h4 className="fw-bold mb-3">Conversation</h4>
          <div className="card p-3" style={{ minHeight: "200px" }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-3 ${
                  msg.role === "user" ? "text-end" : "text-start"
                }`}
              >
                <div
                  className={`d-inline-block p-3 rounded-3 ${
                    msg.role === "user"
                      ? "bg-light border"
                      : "bg-body-secondary border"
                  }`}
                  style={{ maxWidth: "80%" }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* AI typing indicator */}
            {chatLoading && (
              <div className="text-start mb-2">
                <div className="d-inline-block p-3 rounded-3 bg-body-secondary border">
                  <div className="dot-flashing"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <form
        className="d-flex align-items-center border rounded-3 p-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!file && analyzedImages.length === 0)
            return alert("Please select a file first");
          if (file && !preview) return;
          
          if (preview && !analyzedImages.find(img => img.preview === preview)) {
            handleSubmit(); // Analyze new image
          } else {
            handleSendMessage(e); // Chat about analyzed images
          }
        }}
      >
        <input
          type="text"
          className="form-control border-0 shadow-none"
          placeholder={
            !file && analyzedImages.length === 0
              ? "Upload a product image to analyze..."
              : preview && !analyzedImages.find(img => img.preview === preview)
              ? "Click analyze or press Enter to get insights..."
              : "Ask about your products' sustainability..."
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <label htmlFor="file-input" className="btn btn-outline-secondary ms-2">
          +
          <input
            type="file"
            accept="image/*"
            id="file-input"
            className="d-none"
            onChange={handleFileChange}
          />
        </label>

        <button
          type="submit"
          className="btn btn-outline-secondary ms-2"
          disabled={loading || chatLoading}
        >
          {loading || chatLoading ? "..." : "→"}
        </button>
      </form>

      {/* Image Preview (Before Analysis) */}
      {preview && !analyzedImages.find(img => img.preview === preview) && (
        <div
          className="position-relative text-left mt-4"
          style={{ maxWidth: "250px", margin: "0" }}
        >
          <img
            src={preview}
            alt="Uploaded preview"
            className="img-thumbnail mb-2"
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />

          {/* Image name and size */}
          <div className="text-secondary small">
            <p className="mb-1">{file?.name}</p>
            <p>{(file?.size / 1024).toFixed(2)} KB</p>
          </div>

          <button
            className="btn btn-outline-danger btn-sm mt-2"
            onClick={() => {
              setFile(null);
              setPreview(null);
            }}
          >
            Remove Image
          </button>
        </div>
      )}

      {error && <p className="text-danger mt-3">{error}</p>}
    </div>
  );
};

export default Scanner;