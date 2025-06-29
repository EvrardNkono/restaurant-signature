import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Banner.css';
import { faInstagram, faTiktok, faFacebookF, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faStar, faAward, faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

import banner1 from '../assets/images/banner-bg.jpg';
import banner2 from '../assets/images/banner2.jpeg';
import banner3 from '../assets/images/banner3.jpg';
import logo from '../assets/logo.png';


const images = [banner1, banner2, banner3];

const Banner = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="banner" style={{ backgroundImage: `url(${images[currentImageIndex]})` }}>
      <div className="overlay" />
      <div className="logo-container">
  <img src={logo} alt="Logo Restaurant Signature" className="logo-img" />
</div>


      <div className="banner-content">
        <h1 className='bienvenue' >Bienvenue sur Restaurant Signature</h1>
        <p>Découvrez nos saveurs exotiques</p>

        <button className="banner-button" onClick={() => navigate('/menu')}>
          <FontAwesomeIcon icon={faUtensils} className="icon purple-icon" />
          Menu Classique
        </button>

        <div className="btn-group">
          <button className="banner-button" onClick={() => navigate('/special-weekend')}>
  <FontAwesomeIcon icon={faStar} className="icon green-icon" />
  Special<br /> Weekend
</button>


          <button className="banner-button" onClick={() => navigate('/concept-chef')}>
            <FontAwesomeIcon icon={faAward} className="icon gold-icon" />
            Le concept<br />du Chef
          </button>
        </div>
      </div>

      {/* Carte Contact Flottante */}
      <div className="contact-floating-card">
        <h4>Contact</h4>
        <p><FontAwesomeIcon icon={faPhone} className="contact-icon" /> <a href="tel:+33644951184">+33 6 44 95 11 84</a></p>
        <p><FontAwesomeIcon icon={faEnvelope} className="contact-icon" /> <a href="mailto:restaurantsignature@outlook.fr">Mail: restaurantsignature <></>@outlook.fr</a></p>
        <p><FontAwesomeIcon icon={faMapMarkerAlt} className="contact-icon" /> 13 rue St-Barthélemy, 77000 Melun </p>
        <div className="social-icons">
  <a
    href="https://www.instagram.com/restaurantsignature"
    target="_blank"
    rel="noopener noreferrer"
    className="icon-instagram"
  >
    <FontAwesomeIcon icon={faInstagram} />
  </a>
  <a
    href="https://www.tiktok.com/@restaurantsignature"
    target="_blank"
    rel="noopener noreferrer"
    className="icon-tiktok"
  >
    <FontAwesomeIcon icon={faTiktok} />
  </a>
  <a
    href="https://www.facebook.com/restaurantsignature"
    target="_blank"
    rel="noopener noreferrer"
    className="icon-facebook"
  >
    <FontAwesomeIcon icon={faFacebookF} />
  </a>
  <a
    href="https://wa.me/33644951184"
    target="_blank"
    rel="noopener noreferrer"
    className="icon-whatsapp"
  >
    <FontAwesomeIcon icon={faWhatsapp} />
  </a>
</div>



      </div>
    </div>
  );
};

export default Banner;
