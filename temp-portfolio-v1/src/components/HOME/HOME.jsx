import React, { useState, useEffect, useMemo } from "react";
import { Element } from "react-scroll";
import R3Fpc from "./R3Fpc";
import "./HOME.css";

function TypingEffect() {
  const sentences = useMemo(
    () => [
      "Thanks for visiting.",
      "It's a bit shy,",
      "But let me introduce myself.",
    ],
    []
  );
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    if (index === sentences.length) {
      setIndex(0);
    }

    let timeout;
    if (!reverse && subIndex === sentences[index].length) {
      setBlink(true);
      timeout = setTimeout(() => {
        setBlink(false);
        setReverse(true);
      }, 1000);
    } else if (reverse && subIndex === 0) {
      setReverse(false);
      setIndex((prevIndex) => (prevIndex + 1) % sentences.length);
    } else {
      timeout = setTimeout(() => {
        setSubIndex((prevSubIndex) => prevSubIndex + (reverse ? -1 : 1));
      }, 80);
    }

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, sentences]);

  const cursorClasses = blink ? "cursor blink" : "cursor";

  return (
    <h2>
      {sentences[index].substring(0, subIndex)}
      <span className={cursorClasses}>|</span>
    </h2>
  );
}

function HomeMobile() {
  return (
    <div id="home" className="container">
      <div className="light yellow-light"></div>
      <div className="light blue-light"></div>
      <p>Hi, there!</p>
      <h1>
        I&apos;m <span style={{ color: "#ffc900" }}>YENA</span>.
      </h1>
      <TypingEffect />
    </div>
  );
}

function HOME() {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 700);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 700);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <Element name="home">
      {isSmallScreen ? (
        <HomeMobile />
      ) : (
        <div className="container" style={{ height: "calc(100vh - 60px)" }}>
          <R3Fpc />
        </div>
      )}
    </Element>
  );
}

export default HOME;
