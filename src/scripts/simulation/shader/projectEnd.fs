#version 300 es
precision highp float;

uniform vec2 resolution;
uniform sampler2D velocityTexture;
uniform sampler2D projectTexture;

in vec2 vUv;
out vec4 outColor;

void main() {
  vec2 px = 1.0 / resolution;

  vec4 velocity = texture(velocityTexture, vUv);

  float left   = texture(projectTexture, vUv + vec2(-1.0,  0.0) * px).x;
  float right  = texture(projectTexture, vUv + vec2( 1.0,  0.0) * px).x;
  float top    = texture(projectTexture, vUv + vec2( 0.0, -1.0) * px).x;
  float bottom = texture(projectTexture, vUv + vec2( 0.0,  1.0) * px).x;

  float x = 0.5 * (right - left);
  float y = 0.5 * (bottom - top);
  outColor = velocity - vec4(x, y, 0.0, 0.0);
}

