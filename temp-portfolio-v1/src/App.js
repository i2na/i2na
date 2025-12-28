import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import { Link, Element } from "react-scroll";
import HOME from "./components/HOME/HOME";
import ABOUT from "./components/ABOUT/ABOUT";
import PROJECTS from "./components/PROJECTS/PROJECTS";
import CONTACT from "./components/CONTACT/CONTACT";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navRef]);

  return (
    <>
      <nav className="navbar" ref={navRef}>
        <div className="logo">
          <Link to="home" smooth={true} duration={500}>
            YENA.
          </Link>
        </div>
        <div className="pc-menu">
          <ul>
            <li>
              <Link to="home" smooth={true} duration={500}>
                HOME
              </Link>
            </li>
            <li>
              <Link to="about" smooth={true} duration={500}>
                ABOUT
              </Link>
            </li>
            <li>
              <Link to="projects" smooth={true} duration={500}>
                PROJECTS
              </Link>
            </li>
            <li>
              <Link to="contact" smooth={true} duration={500}>
                CONTACT
              </Link>
            </li>
          </ul>
        </div>

        <input
          id="menu-toggle"
          type="checkbox"
          checked={menuOpen}
          onChange={toggleMenu}
        />
        <label className="menu-button" htmlFor="menu-toggle">
          <span className="line line1"></span>
          <span className="line line2"></span>
          <span className="line line3"></span>
        </label>

        <div className={`navbar__menu--mobile ${menuOpen ? "open" : ""}`}>
          <ul>
            <li>
              <Link to="home" smooth={true} duration={500} onClick={closeMenu}>
                HOME
              </Link>
            </li>
            <li>
              <Link to="about" smooth={true} duration={500} onClick={closeMenu}>
                ABOUT
              </Link>
            </li>
            <li>
              <Link
                to="projects"
                smooth={true}
                duration={500}
                onClick={closeMenu}
              >
                PROJECTS
              </Link>
            </li>
            <li>
              <Link
                to="contact"
                smooth={true}
                duration={500}
                onClick={closeMenu}
              >
                CONTACT
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <Element name="home" className="section">
        <HOME />
      </Element>
      <Element name="about" className="section">
        <ABOUT />
      </Element>
      <Element name="projects" className="section">
        <PROJECTS />
      </Element>
      <Element name="contact" className="section">
        <CONTACT />
      </Element>
    </>
  );
}

export default App;
