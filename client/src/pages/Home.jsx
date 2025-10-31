import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage text-center">
      {/* HERO SECTION - stays as video */}
      <section className="hero position-relative text-white">
        <video
          className="hero-video position-absolute w-100 h-100 top-0 start-0"
          src="/nature-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{ objectFit: 'cover' }}
        />
        <div className="container position-relative py-5">
          <h1 className="display-4 fw-bold">GreenLens — AI Sustainability Scanner</h1>
          <p className="lead mb-4">Scan Smarter, Shop Greener</p>
          <button
            className="btn btn-primary btn-lg px-4"
            onClick={() => navigate('/scanner')}
          >
            Start Scanning
          </button>
        </div>
      </section>

      {/* FEATURE SECTION */}
      <section className="py-5 bg-light">
        <div className="container marketing text-center">
          <div className="row g-5">
            {/* Mission */}
            <div className="col-lg-4">
              <div className="feature-icon circle-green text-white mb-3 mx-auto">
                <img src="/mission-icon.svg" alt="Mission icon" className="custom-icon" />
              </div>
              <h3 className="fw-semibold">Mission</h3>
              <p>
                To empower consumers with intelligent, transparent sustainability insights that transform
                everyday purchases into environmentally responsible choices.
              </p>
            </div>

            {/* Values */}
            <div className="col-lg-4">
              <div className="feature-icon circle-sage text-white mb-3 mx-auto">
                <img src="/values-icon.svg" alt="Values icon" className="custom-icon" />
              </div>
              <h3 className="fw-semibold">Values</h3>
              <p>
                We promote a transition toward cleaner energy use by revealing the energy demands and emissions
                behind each product.
              </p>
              <p>
                We support a circular economy by encouraging reusing, recycling, or upcycling.
              </p>
              <p>
                We make sustainability engaging with our AI-powered GreenScore and gamified rewards.
              </p>
            </div>

            {/* Purpose */}
            <div className="col-lg-4">
              <div className="feature-icon circle-lightgreen text-white mb-3 mx-auto">
                <img src="/purpose-icon.svg" alt="Purpose icon" className="custom-icon" />
              </div>
              <h3 className="fw-semibold">Purpose</h3>
              <p>
                GreenLens harnesses AI to make sustainability simple, measurable, and actionable — helping people
                shop smarter and live greener.
              </p>
            </div>
          </div>
        </div>

        {/* IMPACT FEATURETTE SECTION */}
        <section className="container my-5">
          <hr className="featurette-divider" />

          {/* Featurette 1 */}
          <div className="row featurette align-items-center my-5">
            <div className="col-md-7">
              <h2 className="featurette-heading fw-bold lh-1 mb-1">The Plastic Problem</h2>
              <h3 className="text-body-secondary mb-3">A Global Challenge</h3>
              <p className="lead">
                Scientists estimate that only <strong>9%</strong> of all plastic waste generated globally is
                recycled. Most of our plastic waste — around <strong>70%</strong> — ends up in landfills or in
                nature.
              </p>
            </div>
            <div className="col-md-5">
              <img
                src="/landfill-image.jpg"
                alt="Plastic waste pollution"
                className="featurette-image img-fluid mx-auto"
                width="500"
                height="500"
              />
            </div>
          </div>

          <hr className="featurette-divider" />

          {/* Featurette 2 */}
          <div className="row featurette align-items-center my-5">
            <div className="col-md-7 order-md-2">
              <h2 className="featurette-heading fw-bold lh-1 mb-1">A Missed Opportunity</h2>
              <h3 className="text-body-secondary mb-3">Rethinking Waste</h3>
              <p className="lead">
                Up to <strong>90%</strong> of landfill waste is recyclable or compostable. Every item that’s reused,
                recycled, or avoided keeps our planet cleaner and our ecosystems thriving.
              </p>
            </div>
            <div className="col-md-5 order-md-1">
              <img
                src="/recycle-image.jpg"
                alt="Recycling and landfill comparison"
                className="featurette-image img-fluid mx-auto"
                width="500"
                height="500"
              />
            </div>
          </div>

          <hr className="featurette-divider" />
        </section>
      </section>
    </div>
  );
};

export default Home;
