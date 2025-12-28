import React, { useState, useEffect } from "react";
import { Element } from "react-scroll";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./PROJECTS.css";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { PiCursorClickFill } from "react-icons/pi";

const mappingSkill = {
  react:
    "https://img.shields.io/badge/react-61DAFB.svg?&style=for-the-badge&logo=react&logoColor=white",
  nextjs:
    "https://img.shields.io/badge/next.js-000000.svg?&style=for-the-badge&logo=next.js&logoColor=white",
  javascript:
    "https://img.shields.io/badge/javascript-F7DF1E.svg?&style=for-the-badge&logo=javascript&logoColor=white",
  typescript:
    "https://img.shields.io/badge/typescript-3178C6.svg?&style=for-the-badge&logo=typescript&logoColor=white",
  tailwindcss:
    "https://img.shields.io/badge/tailwindcss-06B6D4.svg?&style=for-the-badge&logo=tailwindcss&logoColor=white",
  styledcomponents:
    "https://img.shields.io/badge/styledcomponents-DB7093.svg?&style=for-the-badge&logo=styled-components&logoColor=white",
  zustand:
    "https://img.shields.io/badge/zustand-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB",
  threejs:
    "https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white",
  webgl:
    "https://img.shields.io/badge/WebGL-990000?logo=webgl&logoColor=white&style=for-the-badge",
  socketio:
    "https://img.shields.io/badge/Socket.IO-010101?logo=socket.io&logoColor=white&style=for-the-badge",
  flask:
    "https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=Flask&logoColor=white",
  stablediffusion:
    "https://img.shields.io/badge/Stable%20Diffusion-ED8B40?style=for-the-badge&logo=Stable%20Diffusion&logoColor=white",
};

function PROJECTS() {
  return (
    <Element name="projects">
      <div className="container">
        <div className="blank-container"></div>
        <h1>PROJECTS</h1>
        <div className="underline"></div>
        <div className="content-container">
          {/* QUIPU-DEV 카테고리 */}
          <div className="project-category">
            <h1>QUIPU-DEV</h1>
            <div></div>
            <p>
              서울시립대학교 컴퓨터 학술 중앙 동아리에서 웹 개발팀을 만들어
              새로운 도전에 뛰어들며, 저만의 아이디어를 자유롭게 실현하고
              있습니다.
            </p>
          </div>
          <Project
            title="배틀글라운드"
            subtitle="실시간 멀티플레이어 타자 배틀 웹게임"
            period="2024.07 - 2024.09"
            about="React와 Socket.io 기반의 최대 3명의 플레이어가 함께 겨루는 멀티플레이어 타자 게임입니다."
            detail="방을 생성하거나 참가하여 주어진 하나의 단어장을 보며 단어를 먼저 타이핑해 점수를 얻는 형식으로 진행됩니다. 대학 축제 부스에서 약 70명의 플레이어가 실제로 참여하며 발생한 버그를 단계적으로 해결했습니다."
            skillList={["react", "socketio"]}
            pointList={{
              "소켓 안정성 강화":
                "새로고침 시 소켓 연결이 끊기던 문제를 해결해 기존 참여 방 정보를 복원함으로써 끊김 없는 플레이 환경을 제공했습니다.",
              "입력 이벤트 최적화":
                "엔터 키 중복 입력으로 점수가 여러 번 올라가는 버그를 debounce 기법으로 개선해 정확한 점수 처리와 불필요한 서버 요청을 방지했습니다.",
            }}
            img={[
              "https://pub-80a42cc7d41749078071917a4265d3ca.r2.dev/배틀글라운드_img1.jpeg",
              "https://pub-80a42cc7d41749078071917a4265d3ca.r2.dev/배틀글라운드_img2.jpeg",
              "https://pub-80a42cc7d41749078071917a4265d3ca.r2.dev/배틀글라운드_img3.jpeg",
              "https://pub-80a42cc7d41749078071917a4265d3ca.r2.dev/배틀글라운드_video1.mp4",
            ]}
            memo="https://yenaley.notion.site/19a4cc4362cb8033b8edd0e9a913af32"
            github={["https://github.com/Quipu-Developers/24_2_battleground"]}
            reverse={true}
          />

          <Project
            title="Articket"
            subtitle="AI 기반 명화 변환 서비스"
            period="2024.09 - 2024.11"
            about="Stable Diffusion으로 사진을 네 가지 화가의 스타일로 변환하고, PDF 티켓을 자동 발급하는 서비스입니다."
            detail="피카소, 르누아르, 고흐, 리히텐슈타인의 화풍을 제공하며 간단한 성격 테스트를 통해 어울리는 화가를 추천해주고, 사용자의 사진을 해당 화가의 스타일로 변환해줍니다. 대구 EXCO 경진대회 부스에서 약 200명을 대상으로 체험 서비스를 운영했습니다."
            skillList={["flask", "stablediffusion", "socketio"]}
            pointList={{
              "고속 이미지 생성":
                "GPU 환경에서 Stable Diffusion 모델을 실행하고, 스레드 풀을 사용해 네 이미지를 병렬 생성하여 처리 시간을 단축했습니다.",
              "자동화 티켓 발급":
                "ReportLab과 PyPDF2를 통해 변환된 이미지를 PDF 템플릿에 자동 삽입하고, 완료된 티켓 PDF를 구글 클라우드에 업로드해 바로 출력할 수 있도록 구성했습니다.",
            }}
            img={[
              "https://pub-80a42cc7d41749078071917a4265d3ca.r2.dev/articket_img1.jpeg",
              "https://pub-80a42cc7d41749078071917a4265d3ca.r2.dev/articket_img2.jpeg",
              "https://pub-80a42cc7d41749078071917a4265d3ca.r2.dev/articket_img3.jpeg",
              "https://pub-80a42cc7d41749078071917a4265d3ca.r2.dev/articket_img4.jpeg",
              "https://pub-80a42cc7d41749078071917a4265d3ca.r2.dev/articket_img5.jpeg",
              "https://pub-80a42cc7d41749078071917a4265d3ca.r2.dev/articket_img6.jpeg",
            ]}
            memo="https://yenaley.notion.site/Articket-19a4cc4362cb80838a8ac44f901a6f0c"
            github={["https://github.com/YenaLey/Articket"]}
          />

          <Project
            title="QUIPU Main Web"
            subtitle="동아리 소개 및 신규 회원 모집 웹사이트"
            period="2024.01 - 2024.08"
            about="React와 Three.js 기반의 동아리 활동과 프로젝트를 공유하며 회원을 모집하는 메인 페이지입니다."
            detail="연도별 활동 기록과 프로젝트 쇼케이스를 담고 있고 모집 폼을 통해 약 150명의 신규 회원을 모집했습니다. 이벤트용 퀴즈와 룰렛 기능을 구현해 다수가 동시에 접속해도 안정적으로 작동하도록 최적화했습니다."
            skillList={["react", "threejs"]}
            pointList={{
              "자동 배포 파이프라인":
                "GitHub Actions를 도입해 메인 브랜치 푸시 시 자동으로 빌드와 배포가 진행되도록 설정했습니다.",
              "3D 컴포넌트 성능 개선":
                "React Three Fiber로 전환해 Three.js 기반 3D 모델의 렌더링 성능을 높이고, 사용자 경험을 향상시켰습니다.",
            }}
            img={[
              "https://pub-80a42cc7d41749078071917a4265d3ca.r2.dev/main24_img1.png",
              "https://pub-80a42cc7d41749078071917a4265d3ca.r2.dev/main24_img2.png",
              "https://pub-80a42cc7d41749078071917a4265d3ca.r2.dev/main24_img3.png",
              "https://pub-80a42cc7d41749078071917a4265d3ca.r2.dev/룰렛24_img1.jpeg",
              "https://pub-80a42cc7d41749078071917a4265d3ca.r2.dev/룰렛24_video1.mp4",
            ]}
            github={["https://github.com/Quipu-Developers/24_2_main"]}
            link="https://quipu.uos.ac.kr/"
            reverse={true}
          />

          <Project
            title="QUIPU BackOffice Web"
            subtitle="지원자 정보를 실시간 관리하는 백오피스 페이지"
            period="2024.07 - 2024.08"
            about="메인 웹 지원 폼과 연동해 서류 검토와 관리에 용이한 정보를 제공하는 서비스입니다."
            detail="지원자의 기본 정보, 포트폴리오 PDF 등을 모달창에서 빠르게 확인하고, 단축키 복사 및 Excel 다운로드 기능으로 편하게 사용할 수 있는 기능을 담았습니다."
            skillList={["react"]}
            pointList={{
              "실시간 동기화":
                "서버에서 전달되는 지원 정보를 즉시 반영해 변경 사항을 놓치지 않고 확인할 수 있도록 했습니다.",
              "간편한 검토 프로세스":
                "단축키로 특정 내용을 빠르게 복사하거나 모달을 열고 닫아 한눈에 정보를 비교하고, Excel로 일괄 관리할 수 있도록 구현했습니다.",
            }}
            img={[
              "https://pub-80a42cc7d41749078071917a4265d3ca.r2.dev/backoffice_img1.png",
              "https://pub-80a42cc7d41749078071917a4265d3ca.r2.dev/backoffice_img2.png",
            ]}
            github={["https://github.com/Quipu-Developers/backoffice"]}
          />
        </div>
        <div className="blank-container"></div>
        <div className="blank-container"></div>
      </div>

      <div className="container">
        <a
          href="https://yenaley.notion.site/Yena-Info-1514cc4362cb80da94e4f68e2ff3a0f6?pvs=73"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <button
            style={{
              backgroundColor: "#000",
              color: "#fff",
              padding: "0.75rem 1.25rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
              transition: "background-color 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            See More Projects{" "}
            <PiCursorClickFill style={{ width: "20px", height: "20px" }} />
          </button>
        </a>
        {/* <div className="blank-container"></div>
        <h1>SIDE PROJECTS</h1>
        <div className="underline"></div>
        <div className="content-container sideProject">
          <SideProject
            img="./img/project/기획.jpg"
            title="기획 및 디자인"
            description="전체적인 프로세스를 이해하고 적극적으로 아이디어를 내기 위해 기획과 디자인을 공부하고 있습니다."
          />
          <SideProject
            img="./img/project/외주.png"
            title="외주"
            description="다양한 문제 상황을 경험하고 기술 역량을 넓히기 위해 FE 개발 분야에서 외주 작업을 진행하고 있습니다."
          />
          <SideProject
            img="./img/project/스터디2.jpg"
            title="세미나"
            description="FE 개발 지식을 공유하고 피드백을 받기 위해 FE 개발 관련 세미나를 열고 있습니다."
          />
          <SideProject
            img="./img/project/코딩테스트스터디.jpg"
            title="스터디"
            description="코딩을 지치지 않고 꾸준히 하는 습관을 들이기 위해 여러 사람들과 스터디를 하고 있습니다."
          />
          <SideProject
            img="./img/project/스터디3.jpg"
            title="코드 리뷰"
            description="여러 사람과 코드 리뷰를 통해 같은 기능에 대한 여러 코드를 경험하고 있습니다."
          />
          <SideProject
            img="./img/project/예대발표.jpg"
            title="리더"
            description="컴퓨터 동아리를 이끌며 다양한 프로젝트를 기획하고 진행하며 겪을 수 있는 문제 상황과 책임을 경험하고 있습니다."
          />
        </div>
        <div className="blank-container"></div>
        <div className="blank-container"></div>
        <div className="blank-container"></div> */}
      </div>

      <div className="container">
        <div className="blank-container"></div>
        <div className="blank-container"></div>
        <div className="blank-container"></div>
        <h1>WHY CHOOSE ME</h1>
        <div className="underline"></div>
        <div className="content-container">
          <Choose
            title="주저 없는 실행력"
            description="새로운 아이디어가 떠오르면 즉시 실행에 옮기며, 도전하는 것을 두려워하지 않습니다."
            img1="./img/icon/추진력.png"
            img2="./img/icon/추진력2.png"
          />

          <Choose
            title="감각적인 사용자 경험"
            description="사용자의 작은 불편도 놓치지 않고 세심하게 개선하며, 트렌디하면서도 직관적인 인터페이스를 통해 감각적인 사용자 경험을 만듭니다."
            img1="./img/icon/작업.png"
            img2="./img/icon/작업2.png"
            reverse
          />

          <Choose
            title="적극적인 협업과 팀워크"
            description="아이디어를 공유하고, 다양한 관점을 받아들이는 것을 좋아하며, 팀워크 속에서 더 큰 시너지를 만드는 개발자가 되고자 합니다."
            img1="./img/icon/커뮤니케이션.png"
            img2="./img/icon/커뮤니케이션2.png"
          />

          <Choose
            title="끊임없는 개선과 성장"
            description="더 나은 코드, 더 빠른 성능, 더 효율적인 프로세스를 찾아가는 과정이 즐겁습니다."
            img1="./img/icon/신뢰성.png"
            img2="./img/icon/신뢰성2.png"
            reverse
          />
        </div>
        <div className="blank-container"></div>
      </div>
    </Element>
  );
}

export default PROJECTS;

// ─────────────────────────────────────────
// Project 컴포넌트

function Project({
  img,
  period,
  title,
  about,
  detail,
  skillList,
  pointList,
  link,
  memo,
  github,
  reverse,
}) {
  const [imgIndex, setImgIndex] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.5,
  });

  useEffect(() => {
    if (!inView) {
      setImgIndex(0);
    }
  }, [inView]);

  const handlePrev = () => {
    if (imgIndex > 0) {
      setImgIndex(imgIndex - 1);
    }
  };

  const handleNext = () => {
    if (imgIndex < img.length - 1) {
      setImgIndex(imgIndex + 1);
    }
  };

  // 확장자에 따라 이미지 또는 동영상 렌더링
  const renderMediaContent = (src, index) => {
    // URL에서 확장자 추출 (쿼리스트링이나 해시 제거)
    const extension = src.split(".").pop().split(/#|\?/)[0].toLowerCase();
    const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp"];
    const videoExtensions = ["mov", "mp4", "webm", "ogg"];

    if (imageExtensions.includes(extension)) {
      return (
        <img
          key={`media-${index}`}
          src={src}
          alt={`project-media-${index}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
          }}
          loading="lazy"
        />
      );
    }

    if (videoExtensions.includes(extension)) {
      return (
        <video
          key={`media-${index}`}
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            position: "absolute",
            top: 0,
            left: 0,
          }}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          controls
        />
      );
    }

    return null;
  };

  return (
    <motion.div
      ref={ref}
      className={reverse ? "project-block" : "project-block-reverse"}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="laptop">
        {imgIndex > 0 && (
          <div className="project-img-button" onClick={handlePrev}>
            <IoIosArrowBack />
          </div>
        )}
        {imgIndex < img.length - 1 && (
          <div className="project-img-button right" onClick={handleNext}>
            <IoIosArrowForward />
          </div>
        )}
        <div
          className="laptop-img"
          style={{ position: "relative", overflow: "hidden" }}
        >
          {renderMediaContent(img[imgIndex], imgIndex)}
        </div>

        <div className="keyboard">
          <div className="keyboard-top"></div>
          <div className="keyboard-bottom"></div>
          <div className="dots-container">
            {img.map((item, index) => (
              <span
                key={index}
                className={`dot ${imgIndex === index ? "active" : ""}`}
                onClick={() => setImgIndex(index)}
              ></span>
            ))}
          </div>
        </div>
      </div>

      <div className="project-content">
        <p>{period}</p>
        <h2>{title}</h2>
        <p>
          <span
            style={{ fontWeight: "700", color: "#ffc900", fontSize: "20px" }}
          >
            About.{" "}
          </span>
          <span style={{ color: "black" }}>{about}</span>
        </p>
        <p>
          <span
            style={{ fontWeight: "700", color: "#ffc900", fontSize: "20px" }}
          >
            Detail.{" "}
          </span>
          {detail}
        </p>
        <p style={{ display: "flex", alignItems: "center" }}>
          {skillList &&
            skillList.map((skill, index) => {
              return (
                <img
                  key={index}
                  src={mappingSkill[skill]}
                  alt={skill}
                  className="project-skill-icon"
                  style={{ width: "auto", height: "24px", marginRight: "8px" }}
                />
              );
            })}
        </p>
        {pointList &&
          Object.keys(pointList).map((key, index) => (
            <p key={index}>
              <span style={{ color: "#ff6f61", marginRight: "6px" }}>✅</span>
              <span style={{ color: "black" }}>{key}</span> - {pointList[key]}
            </p>
          ))}
        <div className="icon-container">
          {memo && (
            <a href={memo} target="_blank" rel="noopener noreferrer">
              <div className="icon">
                <img src="./img/icon/question.png" alt="Pencil Icon" />
              </div>
            </a>
          )}
          {github &&
            github.map((element, index) => (
              <a
                key={index}
                href={element}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="icon">
                  <img src="./img/icon/깃허브아이콘.png" alt="GitHub Icon" />
                </div>
              </a>
            ))}
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer">
              <div className="icon">
                <img src="./img/icon/url.png" alt="Link Icon" />
              </div>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// SideProject 컴포넌트 (hover 시 설명 슬라이드)
// function SideProject(props) {
//   const { ref, inView } = useInView({
//     triggerOnce: true,
//     threshold: 0.1,
//   });

//   const [isHovered, setIsHovered] = useState(false);

//   const variants = {
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
//     hidden: { opacity: 0, y: 50 },
//   };

//   const textSlideVariants = {
//     hover: { y: 0, opacity: 1 },
//     initial: { y: 50, opacity: 0 },
//   };

//   return (
//     <motion.div
//       className="sideProject-block"
//       ref={ref}
//       initial="hidden"
//       animate={inView ? "visible" : "hidden"}
//       variants={variants}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <img src={props.img} alt="사이드프로젝트 사진" />
//       <motion.div
//         className="sideProject-description"
//         variants={textSlideVariants}
//         initial="initial"
//         animate={isHovered ? "hover" : "initial"}
//       >
//         <h3>{props.title}</h3>
//         <p>{props.description}</p>
//       </motion.div>
//     </motion.div>
//   );
// }

// ─────────────────────────────────────────
// Choose 컴포넌트 (키워드 아이콘 및 설명)
function Choose({ title, description, img1, img2, reverse }) {
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
      className={reverse ? "choose-block" : "choose-block reverse"}
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
    >
      <div className="img">
        <img className="before" src={img1} alt="키워드 이미지1" />
        <img className="after" src={img2} alt="키워드 이미지2" />
      </div>
      <div className={reverse ? "description" : "description reverse"}>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </motion.div>
  );
}
