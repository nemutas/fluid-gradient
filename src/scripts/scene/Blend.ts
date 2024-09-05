import * as THREE from 'three'
import { RawShaderMaterial } from '../core/ExtendedMaterials'
import { RenderParams } from '../core/utils'
import { shader } from '../shader/shaders'

export class Blend {
  private readonly renderTarget: THREE.WebGLRenderTarget
  private readonly scene = new THREE.Scene()
  private readonly camera = new THREE.OrthographicCamera()

  constructor(private readonly renderer: THREE.WebGLRenderer) {
    this.renderTarget = this.createRenderTarget()
    this.createPlane()
  }

  private createRenderTarget() {
    const { width, height } = this.renderer.domElement
    const dpr = this.renderer.getPixelRatio()
    return new THREE.WebGLRenderTarget(width * dpr, height * dpr)
  }

  private createPlane() {
    const geo = new THREE.PlaneGeometry(2, 2)
    const mat = new RawShaderMaterial({
      uniforms: {
        velocityMap: { value: null },
        time: { value: 0 },
        resolution: { value: [this.resolution.width, this.resolution.height] },
      },
      vertexShader: shader.blend.vs,
      fragmentShader: shader.blend.fs,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.name = 'blend'
    this.scene.add(mesh)
  }

  render(velocityMap: THREE.Texture, { output, dt }: RenderParams = {}) {
    this.uniforms.velocityMap.value = velocityMap
    this.uniforms.time.value += dt ?? 0

    this.renderer.setRenderTarget(output ? null : this.renderTarget)
    this.renderer.render(this.scene, this.camera)
  }

  resize() {
    const { width, height } = this.resolution
    this.renderTarget.setSize(width, height)
    this.uniforms.resolution.value = [width, height]
  }

  private get resolution() {
    const { width, height } = this.renderer.domElement
    const dpr = this.renderer.getPixelRatio()
    return { width: width * dpr, height: height * dpr }
  }

  get texture() {
    return this.renderTarget.texture
  }

  private get uniforms() {
    return (this.scene.getObjectByName('blend') as THREE.Mesh<THREE.BufferGeometry, RawShaderMaterial>).material.uniforms
  }
}
