#version 300 es
precision highp float;

uniform sampler2D velocityTexture;

in vec2 vUv;
out vec4 outColor;

void main() {
  vec4 velocity = texture(velocityTexture, vUv);
  vec2 nVelocity = vec2(0.5);
  if (length(velocity.xy) > 0.0) {
    nVelocity = normalize(velocity.xy) * 0.5 + 0.5;
  }
  outColor = vec4(nVelocity, 0.5, 1.0);
}

