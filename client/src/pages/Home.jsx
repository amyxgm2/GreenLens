import './Home.css'

const Home = () => {
  return (
    <div className="homepage text-center">
      {/* HERO SECTION */}
      <section className="hero position-relative text-white">
        <video
          className="hero-video position-absolute w-100 h-100 top-0 start-0"
          src="public/nature-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{ objectFit: 'cover' }}
        />
        <div className="container position-relative py-5">
          <h1 className="display-4 fw-bold">GreenLens — AI Sustainability Scanner</h1>
          <p className="lead mb-4">Scan Smarter, Shop Greener</p>
          <button className="btn btn-primary btn-lg px-4">Start Scanning</button>
        </div>
      </section>

      {/* FEATURE SECTION */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-4">
              <h3>Mission</h3>
              <p>
                To empower consumers with intelligent, transparent sustainability insights that transform everyday purchases into environmentally responsible choices.
              </p>
            </div>
            <div className="col-lg-4">
              <h3>Values</h3>
              <p>
                We promote a transition toward cleaner energy use by revealing the energy demands and emissions behind each product.
              </p>
              <p>
                We support a circular economy by encouraging reusing, recycling, or upcycling.
              </p>
              <p>
                We make sustainability engaging with our AI-powered GreenScore and gamified rewards.
              </p>
            </div>
            <div className="col-lg-4">
              <h3>Purpose</h3>
              <p>
                GreenLens harnesses AI to make sustainability simple, measurable, and actionable—helping people shop smarter and live greener.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Home