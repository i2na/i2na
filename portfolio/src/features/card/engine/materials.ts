import { AdditiveBlending, Color, ShaderMaterial, Vector2 } from "three";

import { ACCENT_HEX, CARD_CORNER_RADIUS_UV, DEFAULT_QUALITY_LEVEL } from "../model/constants";
import type { TCardGlassUniforms, TCardUniforms, TTilt } from "../model/types";

const CARD_VERTEX_SHADER = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDirection;

void main() {
  vUv = uv;
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vViewDirection = normalize(-viewPosition.xyz);
  gl_Position = projectionMatrix * viewPosition;
}
`;

const BASE_FRAGMENT_SHADER = `
precision highp float;

uniform float uTime;
uniform vec2 uTilt;
uniform vec2 uResolution;
uniform vec3 uAccentColor;
uniform float uQuality;
uniform float uCornerRadius;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDirection;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float roundedRectMask(vec2 uv, float radius) {
  vec2 p = uv - 0.5;
  vec2 b = vec2(0.5 - radius);
  vec2 q = abs(p) - b;
  float dist = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
  return 1.0 - smoothstep(0.0, 0.004, dist);
}

void main() {
  float mask = roundedRectMask(vUv, uCornerRadius);
  if (mask <= 0.001) {
    discard;
  }

  vec2 tilt = uTilt / vec2(6.0, 6.0);
  vec2 centeredUv = vUv - 0.5;
  float quality = max(uQuality, 0.0);

  float gradientX = smoothstep(-0.55, 0.52, centeredUv.x + tilt.y * 0.1);
  float gradientY = smoothstep(-0.45, 0.62, centeredUv.y - tilt.x * 0.08);
  vec3 baseColor = mix(vec3(0.038, 0.05, 0.072), vec3(0.068, 0.092, 0.13), gradientX);
  baseColor = mix(baseColor, vec3(0.084, 0.112, 0.154), gradientY * 0.35);

  float layerA = sin((vUv.x * 25.0 + vUv.y * 8.0) + uTime * 0.55 + tilt.y * 3.0);
  float layerB = sin((vUv.y * 38.0 - vUv.x * 6.0) - uTime * 0.34 + tilt.x * 2.5);
  float holoPattern = (layerA * 0.5 + 0.5) * 0.65 + (layerB * 0.5 + 0.5) * 0.35;
  vec3 holoColor = mix(vec3(0.07, 0.12, 0.19), uAccentColor, 0.68);
  vec3 holo = holoColor * holoPattern * 0.125 * quality;

  float microLine = sin(vUv.y * uResolution.y * 0.22 + uTime * 0.2) * 0.5 + 0.5;
  vec3 lineLayer = vec3(0.02, 0.03, 0.04) * microLine * 0.08 * quality;

  float grain = (noise(vUv * uResolution * 0.75 + uTime) - 0.5) * 0.05 * quality;
  vec3 grainLayer = vec3(grain);

  vec3 lightDirPrimary = normalize(vec3(0.48 + tilt.y * 0.08, 0.4 + tilt.x * 0.05, 1.0));
  vec3 lightDirSecondary = normalize(vec3(-0.46 + tilt.y * 0.05, 0.32 - tilt.x * 0.04, 1.0));
  float specularTight = pow(max(dot(vNormal, lightDirPrimary), 0.0), 118.0) * 0.38;
  float specularWide = pow(max(dot(vNormal, lightDirSecondary), 0.0), 40.0) * 0.12;
  float fresnel = pow(1.0 - max(dot(vNormal, vViewDirection), 0.0), 2.05) * 0.29;
  float clearcoatCenter = 0.24 + sin(uTime * 0.42) * 0.09 + tilt.y * 0.05;
  float clearcoatSweep = smoothstep(0.24, 0.0, abs(vUv.x - clearcoatCenter)) * 0.13 * quality;

  float edgeGlow = smoothstep(0.48, 0.12, abs(centeredUv.x)) * 0.038;
  edgeGlow += smoothstep(0.48, 0.14, abs(centeredUv.y)) * 0.03;

  vec3 finalColor = baseColor + holo + lineLayer + grainLayer;
  finalColor += vec3(specularTight + specularWide + fresnel + edgeGlow + clearcoatSweep);
  finalColor = clamp(finalColor, 0.0, 1.0);

  gl_FragColor = vec4(finalColor, mask);
}
`;

const GLASS_FRAGMENT_SHADER = `
precision highp float;

uniform float uTime;
uniform vec2 uTilt;
uniform vec2 uResolution;
uniform vec3 uAccentColor;
uniform float uQuality;
uniform float uCornerRadius;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDirection;

float roundedRectMask(vec2 uv, float radius) {
  vec2 p = uv - 0.5;
  vec2 b = vec2(0.5 - radius);
  vec2 q = abs(p) - b;
  float dist = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
  return 1.0 - smoothstep(0.0, 0.004, dist);
}

void main() {
  float mask = roundedRectMask(vUv, uCornerRadius);
  if (mask <= 0.001) {
    discard;
  }

  vec2 tilt = uTilt / vec2(6.0, 6.0);
  float quality = max(uQuality, 0.0);

  float sweepCenter = 0.36 + sin(uTime * 0.34) * 0.14 + tilt.y * 0.07;
  float sweepDistance = abs(vUv.x - sweepCenter);
  float sweep = smoothstep(0.32, 0.0, sweepDistance);
  float secondaryCenter = 0.7 + sin(uTime * 0.22 + 1.8) * 0.1 - tilt.y * 0.05;
  float secondarySweep = smoothstep(0.24, 0.0, abs(vUv.x - secondaryCenter));

  float topGloss = pow(1.0 - vUv.y, 3.5) * 0.38;
  float sideGloss = smoothstep(0.46, 0.1, abs(vUv.x - 0.5)) * 0.14;
  float rim = pow(1.0 - max(dot(vNormal, vViewDirection), 0.0), 3.0) * 0.2;
  float edgeBand = smoothstep(0.08, 0.0, vUv.y) * 0.1;
  float pulse = (sin(uTime * 0.64 + vUv.x * 10.0) * 0.5 + 0.5) * 0.035;

  float intensity =
      (sweep * 0.3 + secondarySweep * 0.12 + topGloss + sideGloss + rim + edgeBand + pulse) *
      quality;
  vec3 glossColor = mix(vec3(0.9, 0.97, 1.0), uAccentColor, 0.28) * intensity;

  gl_FragColor = vec4(glossColor, mask * 0.66);
}
`;

function createSharedUniforms(): TCardUniforms {
    return {
        uTime: { value: 0 },
        uTilt: { value: new Vector2(0, 0) },
        uResolution: { value: new Vector2(1, 1) },
        uAccentColor: { value: new Color(ACCENT_HEX) },
        uQuality: { value: DEFAULT_QUALITY_LEVEL },
        uCornerRadius: { value: CARD_CORNER_RADIUS_UV },
    };
}

export function createCardMaterial(): ShaderMaterial {
    return new ShaderMaterial({
        uniforms: createSharedUniforms(),
        vertexShader: CARD_VERTEX_SHADER,
        fragmentShader: BASE_FRAGMENT_SHADER,
        transparent: true,
    });
}

export function createCardGlassMaterial(): ShaderMaterial {
    const uniforms: TCardGlassUniforms = createSharedUniforms();

    return new ShaderMaterial({
        uniforms,
        vertexShader: CARD_VERTEX_SHADER,
        fragmentShader: GLASS_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
    });
}

export function updateCardMaterialUniforms(
    material: ShaderMaterial,
    elapsedTime: number,
    tilt: TTilt,
    resolution: Vector2,
    quality: number = DEFAULT_QUALITY_LEVEL
): void {
    const uniforms = material.uniforms as TCardUniforms;
    uniforms.uTime.value = elapsedTime;
    uniforms.uTilt.value.set(tilt.y, tilt.x);
    uniforms.uResolution.value.copy(resolution);
    uniforms.uQuality.value = quality;
}

export function updateCardGlassMaterialUniforms(
    material: ShaderMaterial,
    elapsedTime: number,
    tilt: TTilt,
    resolution: Vector2,
    quality: number = DEFAULT_QUALITY_LEVEL
): void {
    const uniforms = material.uniforms as TCardGlassUniforms;
    uniforms.uTime.value = elapsedTime;
    uniforms.uTilt.value.set(tilt.y, tilt.x);
    uniforms.uResolution.value.copy(resolution);
    uniforms.uQuality.value = quality;
}
