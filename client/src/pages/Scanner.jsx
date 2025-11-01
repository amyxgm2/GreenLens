import { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Scanner.css";

const Scanner = () => {
    const [file, setFile] = useState(null); // Current selected img file
    const [analyzedImages, setAnalyzedImages] = useState([]); // Stores all analyzed img
    const [loading, setLoading] = useState(false); // Controls loading during analysis   
    const [error, setError] = useState(null); // Displays errors  
    const [preview, setPreview] = useState(null); // Stores Base64 preview of uploaded img

    // Chatbox
    const [messages, setMessages] = useState([]); // Chat hisroryu
    const [inputText, setInputText] = useState(""); // Current user input txt
    const [chatLoading, setChatLoading] = useState(false); // Loading for chat

    const chatEndRef = useRef(null); // Auto scroll

    // Automatically scrolls to bot for new chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handles file selection
    // Generate preview thumbnail
    // Reset erroor state
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
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
        formData.append("userQuestion", inputText.trim()); // SEND THE QUESTION

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
                result: data.analysis, // Use the analysis object from server
                timestamp: new Date(),
            };

            setAnalyzedImages((prev) => [...prev, newAnalyzedImage]);

            // If user asked a question, show it in chat first
            if (inputText.trim()) {
                const userMessage = {
                    role: "user",
                    content: inputText,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, userMessage]);
            }

            // Add AI's answer to chat
            const aiMessage = {
                role: "assistant",
                content: data.answer, // Use the answer from server
                timestamp: new Date(),
                imageId: newAnalyzedImage.id,
            };
            setMessages((prev) => [...prev, aiMessage]);

            // Reset inputs
            setFile(null);
            setPreview(null);
            setInputText("");
        } catch (err) {
            console.error(err);
            setError("Something went wrong while analyzing!");
        } finally {
            setLoading(false);
        }
    };


    // ---------- CHAT HANDLER ----------
    // Sends user msgs to the backend char endpoint
    // Displays AI replies to Analyzed Products section
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || analyzedImages.length === 0) return;

        const userMessage = {
            role: "user",
            content: inputText,
            timestamp: new Date(),
        };

        // Append user's msg
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

            // Append AI's response
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

    // Bootstrap color based on score
    const getScoreColor = (score) => {
        if (score >= 70) return "text-success";
        if (score >= 40) return "text-warning";
        return "text-danger";
    };

    return (
        <>
            <div className="container py-5" style={{ paddingBottom: "120px" }}>
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

                        {/* <div className="row justify-content-center g-3 mt-4">
                            {[
                                "How can I reuse this?",
                                "Summarize the image",
                                "What does the sustainability score mean?",
                                "How can I make an impact?",
                            ].map((text, index) => (
                                <div key={index} className="col-md-2 d-flex">
                                    <div
                                        className="card flex-fill d-flex align-items-center justify-content-center p-3 shadow-sm"
                                        style={{ height: "120px" }}
                                    >
                                        {text}
                                    </div>
                                </div>
                            ))}
                        </div> */}
                    </div>
                )}

                {/* Analyzed Images History */}
                {analyzedImages.length > 0 && (
                    <div className="mb-4">
                        <h4 className="fw-bold mb-3">Analyzed Products</h4>
                        {analyzedImages.map((item) => (
                            <div key={item.id} className="card p-4 mb-3">
                                <div className="row align-items-start">
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
                                                <p className="fw-bold mb-1">Community</p>
                                                <p>{item.result.communityImpact || "N/A"}</p>
                                            </div>
                                            <div className="col-md-6 col-lg-3">
                                                <p className="fw-bold mb-1">Drop-off</p>
                                                <p>{item.result.dropOffInfo || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Chat Messages */}
                {messages.length > 0 && (
                    <div className="mb-4">
                        <h4 className="fw-bold mb-3">Conversation</h4>
                        <div className="card p-3" style={{ backgroundColor: "#f8f9fa" }}>
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`mb-3 ${msg.role === "user" ? "text-end" : "text-start"
                                        }`}
                                >
                                    <div
                                        className={`d-inline-block p-3 rounded-3 ${msg.role === "user"
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
                            <div ref={chatEndRef} />
                        </div>
                    </div>
                )}

                {/* Image Preview (Before Analysis) */}
                {preview && !analyzedImages.find((img) => img.preview === preview) && (
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

            {/* Fixed Input Bar at Bottom */}
            <div>
                <div className="container py-3">
                    <form
                        className="d-flex align-items-center border rounded-3 p-2 bg-white"
                        onSubmit={(e) => {
                            e.preventDefault();

                            if (preview && !analyzedImages.find((img) => img.preview === preview)) {
                                handleSubmit(); // Analyze image (with or without question)
                            } else if (analyzedImages.length > 0) {
                                handleSendMessage(e); // Chat about existing images
                            } else {
                                setError("Please upload an image before submitting.");
                            }
                        }}
                    >
                        <input
                            type="text"
                            className="form-control border-0 shadow-none"
                            placeholder={
                                !file && analyzedImages.length === 0
                                    ? "Upload a product image and optionally ask a question..."
                                    : preview &&
                                        !analyzedImages.find((img) => img.preview === preview)
                                        ? "Ask a question about this image (optional)..."
                                        : "Ask about your products' sustainability..."
                            }
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />

                        <label
                            htmlFor="file-input"
                            className="btn btn-outline-secondary ms-2"
                        >
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
                </div>
            </div>
        </>
    );
};

export default Scanner;