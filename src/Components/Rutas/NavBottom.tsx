import React from "react";
import { Link } from "react-router-dom";

export const NavBottom = () => {
  return (
    <nav className="sticky bottom-0">
      <Link to="/" className="nav-bottom__link">
        Home
      </Link>
      <Link to="/about" className="nav-bottom__link">
        About
      </Link>
      <Link to="/contact" className="nav-bottom__link">
        Contact
      </Link>
    </nav>
  );
};