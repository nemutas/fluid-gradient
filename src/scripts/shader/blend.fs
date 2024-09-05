#version 300 es
precision highp float;

uniform sampler2D velocityMap;
uniform float time;
uniform vec2 resolution;

in vec2 vUv;
out vec4 outColor;

#include './module/noise.glsl'

mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, s, -s, c);
}

void main() {
  vec2 uv = vUv;
  vec2 asp = resolution / min(resolution.x, resolution.y);

  vec2 velo = texture(velocityMap, uv).rg;
  outColor = vec4(vec3(length(velo)), 1.0);

  // vec3 seed = vec3(uv * asp - velo * 0.5, time * 0.03);
  vec3 seed = vec3(uv * asp - velo * 0.8 + vec2(-0.7,-0.4), 2.5);
  float n1 = noise(seed.xyz * 0.9);
  seed.yz *= rot(n1 * 0.1);
  float n2 = noise(seed.zxy * 0.9);

  vec3 col =     vec3(0.65, 0.00, 0.52);
  col = mix(col, vec3(0.00, 0.58, 0.69), smoothstep(-0.5, 0.1, n1));
  col = mix(col, vec3(0.00, 0.00, 0.19), smoothstep(0.0, 0.5, n2));

  outColor = vec4(vec3(length(velo)), 1.0);
  outColor = vec4(col, 1.0);
}