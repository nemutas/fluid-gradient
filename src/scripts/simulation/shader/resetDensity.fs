#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

void main() {
  // checker pattern
  float x = floor(gl_FragCoord.x / 50.0) * 50.0;
  float y = floor(gl_FragCoord.y / 50.0) * 50.0;
  float col = step(mod(x + y, 100.0), 1.0);
  outColor = vec4(vec3(col), 1.0);

  outColor = vec4(vec3(0), 1.0);
}

