import React from 'react';
import './LandingPageComponent.css';

function LandingPageComponent() {
    return (
        <div className="landing-page">
            <div className='landing-page-main-container'>
                <h2>A place to see all your favourite superheros!</h2>
                <div className="button-container">
                    <a href="/login" className="login-button">Login</a>
                    <a href="/register" className="signup-button">Sign Up</a>
                    
                </div>
            </div>
        </div>
    );
}

export default LandingPageComponent;