import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css'

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <ul className="footer-links">
                    <li><Link to="https://id-id.facebook.com/places/">Place</Link></li>
                    <li><Link to="https://pay.facebook.com/">Meta Pay</Link></li>
                    <li><Link to="https://www.meta.com/">Meta Store</Link></li>
                    <li><Link to="https://www.instagram.com/">Instagram</Link></li>
                    <li><Link to="https://id-id.facebook.com/privacy/policies/cookies/?entry_point=cookie_policy_redirect&entry=0">Cookies</Link></li>
                </ul>
            </div>
        </footer>
    );
};

export default Footer;
