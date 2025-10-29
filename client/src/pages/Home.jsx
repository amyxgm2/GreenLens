import './Home.css'

const Home = () => {
    return (
        <div className="homepage">
            <div className="hero">
                <div className='hero-img-placeholder'>
                    <img className="hero-img" src="#"></img>
                </div>
                <div className='hero-content'>
                    <h1>GreenLens — AI Sustainability Scanner</h1>
                    <p className='hero-p'>Build anything you want</p>
                    <button className='learn-more-btn'>Learn More</button>
                </div>
            </div>

            <div className='home-container'>
                <div className="home-headlines">
                    <div className="headline-card">

                    </div>
                    <div className="headline-card">

                    </div>
                    <div className="headline-card">

                    </div>
                    <div className="headline-card">

                    </div>
                </div>
            </div>

        </div>
    )
}

export default Home