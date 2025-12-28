import React from "react";
import { Link, Element } from "react-scroll";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "../CONTACT/CONTACT.css";

function CONTACT() {
  return (
    <Element name="contact">
      <div className="container">
        <div className="blank-container"></div>
        <h1>CONTACT</h1>
        <div className="underline"></div>
        <div className="content-container">
          <Contact
            link="https://github.com/YenaLey"
            img="./img/icon/깃허브.png"
            title="Github"
            description="YenaLey"
          ></Contact>

          <Contact
            link="https://velog.io/@yena121/posts"
            img="./img/icon/블로그.png"
            title="Velog"
            description="yena.log"
          ></Contact>

          <Contact
            link="https://www.instagram.com/2ye._na/"
            img="./img/icon/인스타그램.png"
            title="Instagram"
            description="2ye._na"
          ></Contact>

          <Contact
            link="mailto: yena.e121@gmail.com"
            img="./img/icon/메일.png"
            title="Mail"
            description="yena.e121@gmail.com"
          ></Contact>
        </div>
        <div className="blank-container"></div>
        <div className="blank-container"></div>
        <div id="footer" className="container">
          <Link
            activeClass="active-menu-item"
            to="home"
            spy={true}
            smooth={true}
            duration={500}
          >
            YENA.
          </Link>
          <div className="footer-img-container">
            <a
              href="https://github.com/YenaLey"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="footer-img">
                <img src="./img/icon/깃허브_푸터.png" alt="깃허브 아이콘" />
              </div>
            </a>
            <a
              href="https://www.instagram.com/2ye._na/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="footer-img">
                <img
                  src="./img/icon/인스타그램_푸터.png"
                  alt="인스타드램 아이콘"
                />
              </div>
            </a>
            <a
              href="mailto: yena.e121@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="footer-img">
                <img src="./img/icon/메일_푸터.png" alt="메일 아이콘" />
              </div>
            </a>
          </div>
          <p>Copyright 2025. 이예나. All rights reserved.</p>
          <p>icon designed by Flaticon(Freepik)</p>
        </div>
      </div>
    </Element>
  );
}

export default CONTACT;

function Contact(props) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const variants = {
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hidden: { opacity: 0, y: 50 },
  };

  return (
    <a
      id="contactHref"
      href={props.link}
      target="_blank"
      rel="noopener noreferrer"
    >
      <motion.div
        className="contactCard"
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        whileHover={{ rotate: 5 }}
        variants={variants}
      >
        <div className="contactImg" style={{ width: "80px" }}>
          <img src={props.img} alt="contact 아이콘" />
        </div>
        <h2>{props.title}</h2>
        <p>{props.description}</p>
      </motion.div>
    </a>
  );
}
