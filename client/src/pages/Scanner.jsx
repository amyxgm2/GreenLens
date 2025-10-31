import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Scanner.css";

const Scanner = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setResult(null);
    setError(null);
    setMessages([]);

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
      setResult(data);

      const aiMessage = {
        role: "assistant",
        content: `I've analyzed your product! Here's what I found:\n\nSustainability Score: ${data.greenScore}/100\n\n${data.summary}\n\nFeel free to ask me any questions about this product's environmental impact!`,
        timestamp: new Date(),
      };
      setMessages([aiMessage]);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while analyzing!");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !result) return;

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
        {!file && !result && (
            <div className="text-center mb-5">
                <h1 className="fw-bold">Welcome to GreenLens!</h1>
                <h4 className="fw-normal">Upload a product photo to analyze its eco impact, recyclability, and reuse potential.</h4>
                <p className="text-secondary mt-3">Use one of the most common prompts below or start your own.</p>

                <div className="row justify-content-center g-3 mt-4">
                {[
                    "How can I reuse this?",
                    "Summarize the image",
                    "What does the sustainability score mean?",
                    "How can I make an impact?",
                ].map((text, index) => (
                    <div key={index} className="col-md-2 d-flex">
                        <div className="card flex-fill d-flex align-items-center justify-content-center p-3 shadow-sm"
                            style={{
                            height: "120px", 
                            }}>
                            {text}
                        </div>
                    </div>
                ))}
                </div>
            </div>
        )}

        {/* Analysis Section */}
        {result && (
            <div className="card p-4 mb-4">
                <div className="row align-items-start">
                    {/* Left Side: Image Preview */}
                    <div className="col-md-5 text-center position-relative"
                    style={{ maxWidth: "300px" }}>

                    {preview ? (
                        <>
                        <img src={preview} alt="Analyzed preview" className="img-thumbnail"
                            style={{
                            width: "100%",
                            height: "auto",
                            objectFit: "cover",
                            borderRadius: "10px",
                            position: "relative",
                            top: "0",
                            left: "0",
                            }}/>
                        <div className="text-secondary small mt-2">
                            <p className="mb-1">{file?.name}</p>
                            <p>{(file?.size / 1024).toFixed(2)} KB</p>
                        </div>
                        </>
                    ) : (
                        <p className="text-secondary">No image available</p>
                    )}
                </div>

                {/* Right Side: Analysis Results */}
                <div className="col-md-7">
                    <h4 className="fw-bold mb-3">Sustainability Score</h4>
                    <h1 className={`fw-bold ${getScoreColor(result.greenScore)}`}>
                        {result.greenScore}
                    </h1>
                    <p className="text-secondary">{result.summary}</p>
                    <h4></h4>
                    <div className="row text-center mt-3">
                        <div className="col-md-6 col-lg-3">
                            <p className="fw-bold mb-1">Energy Use</p>
                            <p>{result.energyUse}</p>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <p className="fw-bold mb-1">Recycle</p>
                            <p>{result.recyclability}</p>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <p className="fw-bold mb-1">Ethics</p>
                            <p>{result.ethics}</p>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <p className="fw-bold mb-1">Ecosystem Impact</p>
                            <p>{result.ecosystemImpact}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )}

        {/* Chat Section */}
        {messages.length > 0 && (
            <div className="mb-4">
                <div className="card p-3" style={{ minHeight: "200px" }}>
                    {messages.map((msg, i) => (
                        <div key={i} className={`mb-3 ${msg.role === "user" ? "text-end" : "text-start"}`}>
                            <div className={`d-inline-block p-3 rounded-3 ${
                                msg.role === "user"
                                ? "bg-light border"
                                : "bg-body-secondary border"
                            }`}
                            >
                            {msg.content}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

      {/* Input Bar */}
        <form className="d-flex align-items-center border rounded-3 p-2"
            onSubmit={(e) => {
                e.preventDefault();
                if (!file) return alert("Please select a file first");
                if (!result) {
                    handleSubmit(); // Analyze when Enter or button pressed
                } else {
                    handleSendMessage(e); // Chat when Enter or button pressed
                }
            }}>

            <input type="text" className="form-control border-0 shadow-none"
                placeholder={
                !file
                    ? "Upload a product image to analyze..."
                    : !result
                    ? "Click analyze or press Enter to get insights..."
                    : "Ask about this product’s sustainability..."
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}/>

            {!file ? (
                <label htmlFor="file-input" className="btn btn-outline-secondary ms-2">+
                    <input type="file" accept="image/*" id="file-input" className="d-none" onChange={handleFileChange}/>
                </label>
            ) : (
                <button type="submit" className="btn btn-outline-secondary ms-2" disabled={loading || chatLoading}>
                    {(loading || chatLoading) ? "..." : "→"}
                </button>
            )}
        </form>


      {/* Image Preview (Before Analysis) */}
      {preview && !result && (
        <div className="position-relative text-left mt-4" style={{ maxWidth: "250px", margin: "0" }}
        >
          <img src={preview} alt="Uploaded preview" className="img-thumbnail mb-2"
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
                setResult(null);
                setMessages([]);
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
