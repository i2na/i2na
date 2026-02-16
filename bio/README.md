# YENA Identity Card Web

Three.js 기반으로 구현한 단일 페이지 인터랙티브 명함 웹입니다.  
고정 프로필 데이터를 카드 텍스처로 렌더링하고, 입력 장치에 따라 카드 재질 반응을 제공합니다.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)

https://github.com/user-attachments/assets/18687b91-0172-4af9-b4e7-43763ded4250

## Overview

이 프로젝트는 한 화면에서 핵심 프로필 정보를 카드 형태로 즉시 전달하는 React 애플리케이션입니다.  
카드 콘텐츠는 Canvas 기반 텍스처로 생성되며, 데스크톱과 모바일 레이아웃을 분리해 렌더링합니다.  
카드 재질은 셰이더 기반 하이라이트와 반사 표현을 사용하고, 입력값은 스프링 보간으로 안정화합니다.  
렌더러는 WebGPU를 우선 시도하고, 지원되지 않는 환경에서는 WebGL로 자동 폴백합니다.

## Features

- 소개, 경력, 기술 스택, 연락처를 단일 카드 화면에서 동시에 표시합니다.
- 모바일과 데스크톱에 대해 분리된 카드 콘텐츠 레이아웃을 제공합니다.
- 포인터/터치 입력에 따라 카드 회전과 재질 반응을 실시간으로 갱신합니다.
- 입력이 없는 구간에서는 완만한 idle 모션으로 카드 상태를 유지합니다.
- 모바일 롱프레스에서 드래그, 텍스트 선택, 컨텍스트 메뉴 동작을 차단합니다.
- WebGPU 우선 렌더링과 WebGL 폴백 경로를 동일 UX로 제공합니다.

## Tech Stack

- React
- TypeScript
- Three.js
- Vite
- Sass (SCSS)

## Getting Started

### Prerequisites

- Node.js 20.19 이상
- npm 10 이상

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

### Build

```bash
npm run build
```
