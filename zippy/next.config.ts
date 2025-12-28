/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ["zippy.b-cdn.net", "pub-80a42cc7d41749078071917a4265d3ca.r2.dev"], // 외부 이미지 도메인 추가
  },
};

export default nextConfig;
