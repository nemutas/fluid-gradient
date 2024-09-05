#version 300 es
precision highp float;

uniform vec2 resolution;
uniform sampler2D velocityTexture;
uniform float dt;
uniform float diffuse;

in vec2 vUv;
out vec4 outColor;

void main() {
  vec2 px = 1.0 / resolution;

  vec4 center = texture(velocityTexture, vUv + vec2( 0.0,  0.0) * px);
  vec4 left   = texture(velocityTexture, vUv + vec2(-1.0,  0.0) * px);
  vec4 right  = texture(velocityTexture, vUv + vec2( 1.0,  0.0) * px);
  vec4 top    = texture(velocityTexture, vUv + vec2( 0.0, -1.0) * px);
  vec4 bottom = texture(velocityTexture, vUv + vec2( 0.0,  1.0) * px);

  float a = dt * diffuse * resolution.x * resolution.y;
  vec4 dest = (center + a * (top + bottom + left + right)) / (1.0 + 4.0 * a);

  outColor = dest;
}

