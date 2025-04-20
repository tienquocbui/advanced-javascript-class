export const renderAboutPage = () => {
    const pageContainer = document.getElementById('page-container');
    
    pageContainer.innerHTML = `
        <div class="about-page">
            <div class="about-header">
                <h1>About Us</h1>
                <p class="about-tagline">Apple-inspired modern e-commerce experience</p>
            </div>
            
            <div class="about-content">
                <div class="about-section">
                    <h2>Our Story</h2>
                    <p>
                        BuiShop was founded with a simple mission: to create a premium shopping experience 
                        with a focus on beautiful design and exceptional user experience.
                    </p>
                    <p>
                        Our team of developer and designer (only me :D) are passionate about creating interfaces that 
                        are not only visually stunning but also intuitive and easy to use. We believe that 
                        shopping online should be as enjoyable as shopping in a high-end store.
                    </p>
                </div>
                
                <div class="about-section">
                    <h2>Our Products</h2>
                    <p>
                        We curate a selection of high-quality products that meet our standards for both 
                        design and functionality. Each product in our catalog is carefully selected to 
                        ensure it provides real value to our customers.
                    </p>
                    <p>
                        From electronics to home goods, every item is tested and approved by our team 
                        before it makes it into our store. We stand behind everything we sell and offer 
                        a 30-day satisfaction guarantee on all purchases.
                    </p>
                </div>
                
                <div class="about-section">
                    <h2>Our Technology</h2>
                    <p>
                        This e-commerce platform is built using modern vanilla JavaScript with a focus on 
                        performance and maintainability. We use the latest web technologies to ensure a 
                        smooth and responsive experience across all devices.
                    </p>
                    <p>
                        The dark theme is not just about aesthetics - it reduces eye strain and power 
                        consumption on OLED screens, making our site more comfortable to browse and 
                        more environmentally friendly.
                    </p>
                </div>
                
                <div class="about-values">
                    <h2>Our Values</h2>
                    <div class="values-grid">
                        <div class="value-item">
                            <i class="fas fa-hand-holding-heart"></i>
                            <h3>Quality</h3>
                            <p>We never compromise on quality. Every product and feature must meet our high standards.</p>
                        </div>
                        <div class="value-item">
                            <i class="fas fa-lock"></i>
                            <h3>Security</h3>
                            <p>Your data and privacy are paramount. We use the latest security practices to keep you safe.</p>
                        </div>
                        <div class="value-item">
                            <i class="fas fa-leaf"></i>
                            <h3>Sustainability</h3>
                            <p>We're committed to reducing our environmental impact through sustainable practices.</p>
                        </div>
                        <div class="value-item">
                            <i class="fas fa-users"></i>
                            <h3>Community</h3>
                            <p>We believe in building a community of like-minded individuals who appreciate good design.</p>
                        </div>
                    </div>
                </div>
                
                <div class="about-team">
                    <h2>Meet Our Team</h2>
                    <div class="team-grid">
                        <div class="team-member">
                            <div class="team-photo">
                                <i class="fas fa-user"></i>
                            </div>
                            <h3>Tien Quoc (Kelvin) Bui</h3>
                            <p class="team-role">Founder & CEO</p>
                            <p class="team-bio">With experiences in e-commerce and design, Kelvin Bui leads our team with passion and vision.</p>
                        </div>
                    </div>
                </div>
                
                <div class="about-contact">
                    <h2>Get In Touch</h2>
                    <p>We'd love to hear from you! If you have any questions, feedback, or just want to say hello, please reach out to us.</p>
                    <div class="contact-info">
                        <div class="contact-item">
                            <i class="fas fa-envelope"></i>
                            <p>tien-quoc.bui@epita.fr</p>
                        </div>
                        <div class="contact-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <p>EPITA, Kremlin-Bicêtre, France</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}; 