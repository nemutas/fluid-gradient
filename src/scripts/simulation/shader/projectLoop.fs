#version 300 es
precision highp float;

uniform vec2 resolution;
uniform sampler2D projectTexture;

in vec2 vUv;
out vec4 outColor;

void main() {
  vec2 px = 1.0 / resolution;

  float previous = texture(projectTexture, vUv).y;
  float left     = texture(projectTexture, vUv + vec2(-1.0,  0.0) * px).x;
  float right    = texture(projectTexture, vUv + vec2( 1.0,  0.0) * px).x;
  float top      = texture(projectTexture, vUv + vec2( 0.0, -1.0) * px).x;
  float bottom   = texture(projectTexture, vUv + vec2( 0.0,  1.0) * px).x;

  float div = (previous + left + right + top + bottom) / 4.0;
  outColor = vec4(div, previous, 0.0, 0.0);
}

