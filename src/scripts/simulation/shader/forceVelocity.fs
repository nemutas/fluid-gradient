#version 300 es
precision highp float;

uniform vec2 resolution;
uniform sampler2D velocityTexture;
uniform float dt;
uniform float forceRadius;
uniform float forceIntensity;
uniform vec2 forceDirection;
uniform vec2 forceOrigin;

in vec2 vUv;
out vec4 outColor;

void main() {
  float aspect = resolution.x / resolution.y;
  vec4 velocity = texture(velocityTexture, vUv);
  vec2 coord = (vUv * 2.0 - 1.0) - forceOrigin;
  float forceDistance = length(coord * vec2(aspect, 1.0));
  float intensity = 1.0 - smoothstep(forceRadius - forceRadius * 0.1, forceRadius, forceDistance);
  vec2 force = dt * intensity * forceDirection * forceIntensity;

  outColor = velocity + vec4(force, 0.0, 0.0);
}

