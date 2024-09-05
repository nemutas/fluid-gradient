#version 300 es
precision highp float;

uniform sampler2D velocityMap;
uniform sampler2D prevMap;
uniform float accum;

in vec2 vUv;
out vec4 outColor;

void main() {
  vec2 uv = vUv;

  vec4 prev = texture(prevMap, uv);
  vec4 velo = texture(velocityMap, uv);

  outColor = mix((velo + prev) * 0.5, prev, accum);
}