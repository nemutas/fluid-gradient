#version 300 es
precision highp float;

uniform vec2 resolution;
uniform sampler2D velocityTexture;

in vec2 vUv;
out vec4 outColor;

void main() {
  vec2 px = 1.0 / resolution;

  float left   = texture(velocityTexture, vUv + vec2(-1.0,  0.0) * px).x;
  float right  = texture(velocityTexture, vUv + vec2( 1.0,  0.0) * px).x;
  float top    = texture(velocityTexture, vUv + vec2( 0.0, -1.0) * px).y;
  float bottom = texture(velocityTexture, vUv + vec2( 0.0,  1.0) * px).y;

  float div = -0.5 * (right - left) + -0.5 * (bottom - top);
  outColor = vec4(0.0, div, 0.0, 0.0);
}

