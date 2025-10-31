import { useState } from "react"
import './Scanner.css'

const Scanner = () => {
    const [file, setFile] = useState(null)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [preview, setPreview] = useState(null)
    const [fileInfo, setFileInfo] = useState({ name: '', size: '' })

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        setFile(selectedFile)
        setResult(null)
        setError(null)

        if (selectedFile) {
            // Get file info
            const sizeInKB = (selectedFile.size / 1024).toFixed(2)
            const sizeInMB = (selectedFile.size / (1024 * 1024)).toFixed(2)
            const displaySize = selectedFile.size > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`
            
            setFileInfo({
                name: selectedFile.name,
                size: displaySize
            })

            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result)
            }
            reader.readAsDataURL(selectedFile)
        } else {
            setPreview(null)
            setFileInfo({ name: '', size: '' })
        }
    }

    const handleSubmit = async () => {
        if (!file) {
            alert("Please select a file first")
            return
        }
        setLoading(true)
        setError(null)

        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch("http://localhost:4000/api/analyze", {
                method: "POST",
                body: formData,
            })

            if (!res.ok) throw new Error("Server error")

            const data = await res.json()
            setResult(data)
        } catch (err) {
            console.error(err)
            setError("Something went wrong!")
        } finally {
            setLoading(false)
        }
    } 

    const getScoreColor = (score) => {
        if (score >= 70) return 'green'
        if (score >= 40) return 'orange'
        return 'red'
    }

    const getScoreLabel = (score) => {
        if (score >= 70) return 'Excellent'
        if (score >= 40) return 'Moderate'
        return 'Poor'
    }

    return (
        <div className="scanner">
            <div className="main">
                {/* Welcome message */}
                {!file && !result && (
                    <div className="welcome">
                        <div className="welcome-msg">
                            <h2>Welcome to GreenLens</h2>
                            <p>I'm your AI sustainability assistant. Upload an image of any product, and I'll analyze its environmental impact, recyclability, and provide eco-friendly recommendations.</p>
                        </div>
                        
                        <label htmlFor="file-input" className="upload-btn-center">
                            <span className="img-upload">+</span>
                            <input type="file" accept="image/*" onChange={handleFileChange} id="file-input" className="file-input" />
                        </label>                   
                    </div>
                )}

                {/* Results with side-by-side layout */}
                {result && preview && (
                    <div className="results-container">
                        {/* Left side - Image preview */}
                        <div className="image-section">
                            <div className="image-header">
                                <h3>{fileInfo.name}</h3>
                            </div>
                            <div className="full-preview">
                                <img src={preview} alt="Product" />
                            </div>
                            <div className="image-footer">
                                <p>Size: {fileInfo.size}</p>
                            </div>
                        </div>

                        {/* Right side - Stats/Results */}
                        <div className="stats-section">
                            <div className="score-content">
                                <h2>Sustainability Score</h2>
                                <div className="score-indicator" style={{ borderColor: getScoreColor(result.greenScore)}}>
                                    <span className="score-num" style={{ color: getScoreColor(result.greenScore) }}>
                                        {result.greenScore}
                                    </span>
                                    <span className="score-label">{getScoreLabel(result.greenScore)}</span>
                                </div>
                            </div>

                            <div className="metrics-grid">
                                <div className="metric-card">
                                    <h3>Energy Use</h3>
                                    <p>{result.energyUse}</p>
                                </div>

                                <div className="metric-card">
                                    <h3>Recycle</h3>
                                    <p>{result.recyclability}</p>
                                </div>

                                <div className="metric-card">
                                    <h3>Ethics</h3>
                                    <p>{result.ethics}</p>
                                </div>

                                <div className="metric-card">
                                    <h3>Ecosystem Impact</h3>
                                    <p>{result.ecosystemImpact}</p>
                                </div>

                                <div className="summary-card">
                                    <h3>Summary</h3>
                                    <p>{result.summary}</p>
                                </div>
                            </div>

                            {result.reuseIdeas && result.reuseIdeas.length > 0 && (
                                <div className="reuse-card">
                                    <h3>Reuse Ideas</h3>
                                    <ul>
                                        {result.reuseIdeas.map((idea, index) => (
                                            <li key={index}>{idea}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom chat input */}
            <div className="chat-input-container">
                <div className="chat-input-wrapper">
                    <div className="chat-input-box">
                        <span className="chat-input-text" type="text">
                            {!file ? "Upload a product image to analyze..." : 
                             result ? "Upload another product..." : 
                             "Click analyze to get sustainability insights"}
                        </span>
                        
                        <div className="upload-control">
                            {preview && result && (
                                <>
                                    <img src={preview} alt="Thumbnail" className="thumbnail-preview" />
                                    <button onClick={() => {
                                            setPreview(null);
                                            setFile(null);
                                            setResult(null);
                                            setFileInfo({ name: '', size: '' });
                                            const fileInput = document.getElementById('file-input');
                                            if (fileInput) fileInput.value = '';
                                        }} 
                                        className="delete-button"
                                    >
                                        ×
                                    </button>
                                </>
                            )}
                            
                            {file && !result ? (
                                <button onClick={handleSubmit} disabled={loading} className="analyze-btn">
                                    {loading ? "..." : "→"}
                                </button>
                            ) : (
                                <label htmlFor="file-input" className="upload-button">
                                    <span className="img-upload">+</span>
                                    <input type="file" accept="image/*" onChange={handleFileChange} id="file-input" className="file-input" />
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {error && <p className="error-message">{error}</p>}
        </div>
    )
}

export default Scanner