#version 300 es
precision highp float;

uniform sampler2D sourceMap;
uniform vec2 resolution;
uniform vec2 direction;

in vec2 vUv;
out vec4 outColor;

const float PI = acos(-1.0);
const float DIV2 = 2.0 * pow(1.0, 2.0); // 2 * σ^2
const float SAMPLING = 3.0;

void main() {
  vec2 uv = vUv;
  vec2 px = 1.0 / resolution;

  // gaussianBlur
  vec4 sum;
  for (float i = -SAMPLING; i <= SAMPLING; i++) {
    float g = (1.0 / sqrt(PI * DIV2)) * exp(-(i * i) / DIV2);
    sum += texture(sourceMap, uv + i * px * direction) * g;
  }
  
  outColor = sum;
}