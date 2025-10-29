import { useState } from "react"
import './Scanner.css'

const Scanner = () => {
    const [file, setFile] = useState(null)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [preview, setPreview] = useState(null)

    // Get file from the event. Called at return ()
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0] // Get first file
        setFile(e.target.files[0])
        setResult(null)
        setError(null)

        // Create Preview
        if (selectedFile) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result) // Save data
            }
            reader.readAsDataURL(selectedFile) // Convert to base64 string
        } else {
            setPreview(null)
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
        if (score >= 70) return '#10b981'
        if (score >= 40) return '#f59e0b'
        return '#ef4444'
    }

    const getScoreLabel = (score) => {
        if (score >= 70) return 'Execelent'
        if (score >= 40) return 'Moderate'
        return 'Poor'
    }

    return (
        <div className="scanner">
            <div className="scanner-header">
                <h1>GreenLens</h1>
            </div>

            {!preview ? (
                <div className="img-upload">
                    <p>Upload a product image to analyze</p>
                    <input type="file" accept="image/*" onChange={handleFileChange} id="file-input" className="file-input"/>
                </div>
            ) : (
                <div className="preview-container">
                    <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '400px' }} />
                </div>
            )}

            <button onClick={handleSubmit} disabled={loading} className="analyze-btn">
                {loading ? "Analyzing..." : "Analyze Product"}
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {result && (
                <div className="results">
                    <div className="score-content">
                        <h2>Sustainability Score</h2>
                        <div className="score-indicator" style={{ borderColor: getScoreColor(result.greenScore) }}>
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
            )}    
        </div>
    )
}

export default Scanner