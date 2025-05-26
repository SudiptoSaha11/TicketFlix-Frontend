import React from 'react';
import '../Home/Aboutus.css';

const Aboutus = () => {
    return (
        <div className="main-about-us">
            
            <div className="main-about-us-container">
                <section className="Main-about-section">
                    <h1>About Us</h1>
                    <p>
                        Welcome to TICKETFLIX! We are passionate about bringing the latest movies
                        to your fingertips with the best booking experience. Whether you're a movie
                        buff or just looking for something to watch, our platform helps you find the
                        perfect movie with ease.
                    </p>
                    <p>
                        Our mission is to provide the most seamless movie booking experience possible, 
                        with a simple and intuitive interface that anyone can use.
                    </p>
                </section>

                <section className="team-section">
                    <h2>Meet Our Team</h2>
                    <div className="team-members">
                        <div className="team-member">
                            
                            <h3>Antarikh Banerjee</h3>
                            <p>Roll-no : 504123011009</p>
                        </div>
                        <div className="team-member">
                            
                            <h3>Debajit Ghosh</h3>
                            <p>Roll-no : 504123011015</p>
                        </div>
                        <div className="team-member">
                           
                            <h3>Sudipto Saha</h3>
                            <p>Roll-no : 504123011053</p>
                        </div>
                       <div className="team-member">
                           
                           <h3>Sonali Roy</h3>
                           <p>Roll-no : 504123011047</p>
                       </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Aboutus;