#version 300 es
precision highp float;

uniform sampler2D densityTexture;

in vec2 vUv;
out vec4 outColor;

void main() {
  vec4 density = texture(densityTexture, vUv);
  outColor = vec4(density.xyz, 1.0);
}

