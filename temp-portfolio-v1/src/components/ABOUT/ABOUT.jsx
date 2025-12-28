import React, { useState, useEffect } from "react";
import { Element } from "react-scroll";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./ABOUT.css";

function ABOUT() {
  return (
    <Element name="about">
      {/* ABOUT ME */}
      <div className="container">
        <div className="blank-container"></div>
        <h1>ABOUT ME</h1>
        <div className="underline"></div>
        <div className="content-container">
          <div className="profile-img">
            <img src="./img/프로필.jpg" alt="프로필 사진"></img>
          </div>
          <div id="whitesmoke" className="about-content">
            <div className="pencil"></div>
            <h1>
              Hello, I am <span className="name">이예나</span>
            </h1>
            <h2>Front-End 개발자</h2>
            <p>
              말보다 행동이 앞서며, 결심하면 주저하지 않고 도전하는
              개발자입니다. &quot;안될 거다&quot;보다는 &quot;될 수 있다&quot;는
              열린 사고로 다양한 콘텐츠를 만드는 것을 좋아합니다. 이러한
              과정에서 네트워크 최적화와 빠른 렌더링, 원활한 배포까지 고려한
              프론트엔드 개발을 지향합니다. 더 나은 경험을 만들기 위해 개발
              과정의 작은 불편함도 그냥 지나치지 않고, 끊임없이 개선하며 더 나은
              방식으로 해결하기 위해 노력합니다.
            </p>
            <div className="about-content--bottom">
              <p>Address: </p>
              <span>서울시립대학교 학생회관 342호</span>
              <p>Email: </p>
              <span>yena.e121@gmail.com</span>
              <p>Velog: </p>
              <span>
                <a
                  href="https://velog.io/@yena121/posts"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  yena.log
                </a>
              </span>
              <p>Github: </p>
              <span>
                <a
                  href="https://github.com/YenaLey"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  YenaLey
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="blank-container"></div>
      {/* MY SKILLS */}
      <div id="whitesmoke" className="container">
        <div className="blank-container"></div>
        <h1>MY SKILLS</h1>
        <div className="underline"></div>
        <div
          className="content-container"
          style={{ alignItems: "flex-end", gap: "10px" }}
        >
          <SkillBar title="React.js" percent={80} />
          <SkillBar title="Next.js" percent={60} />
          <SkillBar title="TypeScript" percent={60} />
          <SkillBar title="Tailwind CSS" percent={80} />
          <SkillBar title="Styled Components" percent={80} />
          <SkillBar title="Python" percent={70} />
        </div>
      </div>
      <div id="whitesmoke" className="blank-container"></div>
      {/* count */}
      <div className="container" style={{ backgroundColor: "black" }}>
        <div className="content-container">
          <div className="blank-container"></div>
          <Count countNum={531} title="coding days" />
          <Count countNum={13} title="projects completed" />
          <Count countNum={1650} title="github contributions" />
          <div className="blank-container"></div>
        </div>
      </div>
    </Element>
  );
}

export default ABOUT;

function SkillBar({ title, percent }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const variants = {
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hidden: { opacity: 0, y: 50 },
  };

  return (
    <motion.div
      className="skillBar"
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      whileHover={{ y: -5 }}
      variants={variants}
    >
      <div className="skillTitle">{title}</div>
      <div className="flask">
        <div className="flaskBody">
          <div className="lava" style={{ height: `${percent}%` }}>
            <p>{parseFloat((0.01 * percent).toFixed(1))}</p>
          </div>
          {Array.from({ length: 10 }, (_, index) => (
            <div
              className="tick"
              style={{ bottom: `${index * 10}%` }}
              key={index}
            ></div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Count({ countNum, title }) {
  const [count, setCount] = useState(0);
  const controls = useAnimation();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start(() => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 },
      }));
      let start = 0;
      const end = countNum;
      if (start === end) return;

      let totalMilSecDur = 3000;
      let delay = totalMilSecDur / end;

      let interval = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === end) clearInterval(interval);
      }, delay);
    }
  }, [inView, countNum, controls]);

  return (
    <motion.div
      className="count-box"
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={controls}
    >
      <h1>{count} +</h1>
      <div
        className="underline"
        style={{
          width: "100px",
          height: "1px",
          margin: "5px 0",
          backgroundColor: "white",
        }}
      ></div>
      <p>{title}</p>
    </motion.div>
  );
}
