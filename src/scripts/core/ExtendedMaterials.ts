import * as THREE from 'three'

export class RawShaderMaterial extends THREE.RawShaderMaterial {
  constructor(public parameters: THREE.ShaderMaterialParameters) {
    super(parameters)
    this.glslVersion = this.glslVersion ?? '300 es'
    this.preprocess()
  }

  private preprocess() {
    if (this.glslVersion === '300 es') {
      this.vertexShader = this.vertexShader.replace('#version 300 es', '')
      this.fragmentShader = this.fragmentShader.replace('#version 300 es', '')
    }
  }
}
