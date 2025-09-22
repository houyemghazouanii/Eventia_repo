import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container-fluid d-flex justify-content-between">
        <nav className="pull-left">
          <ul className="nav">
            <li className="nav-item">
              <a className="nav-link" href="http://www.themekita.com" target="_blank" rel="noopener noreferrer"> {/* Added rel="noopener noreferrer" for security */}
                EventIA
              </a>
            </li>
           
          </ul>
        </nav>
        <div className="copyright">
          2025, made with <i className="fa fa-heart heart text-danger"></i> by
          <a href="http://www.themekita.com" target="_blank" rel="noopener noreferrer">Ghazouani Houyem</a> {/* Added rel="noopener noreferrer" for security */}
        </div>
       
      </div>
    </footer>
  );
};

export default Footer;
