import React from 'react';
import './Header.scss';

const Header: React.FC = () => (
  <header className="app-header d-flex align-items-center">
    <div className="d-flex">
      <button type="button" className="btn btn-primary toggle-sidebar" id="toggle-sidebar">
        <i className="icon-menu"></i>
      </button>
      <button type="button" className="btn btn-primary pin-sidebar" id="pin-sidebar">
        <i className="icon-menu"></i>
      </button>
    </div>
    <div className="app-brand-sm d-md-none d-sm-block">
      <a href="/">
        <img src="/assets/logo-sm.svg" className="logo" alt="OXITRANS Dashboard" />
      </a>
    </div>
    <div className="search-container d-xl-block d-none mx-3">
      <input type="text" className="form-control" placeholder="Buscar" />
      <i className="icon-search"></i>
    </div>
    <div className="header-actions">
      {/* Aquí puedes agregar notificaciones, usuario, etc. */}
    </div>
  </header>
);

export default Header;
