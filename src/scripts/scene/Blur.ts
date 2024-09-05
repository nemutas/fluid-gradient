import * as THREE from 'three'
import { RawShaderMaterial } from '../core/ExtendedMaterials'
import { RenderParams } from '../core/utils'
import { shader } from '../shader/shaders'

type BlurDirection = 'horizontal' | 'vertical'

export class Blur {
  private readonly renderTargets: THREE.WebGLRenderTarget[] = []
  private readonly camera = new THREE.OrthographicCamera()
  private readonly scene = new THREE.Scene()

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    sourceMap: THREE.Texture,
    private readonly scale = 1,
  ) {
    this.renderTargets.push(this.createRenderTarget(), this.createRenderTarget())

    this.createPlane('horizontal', sourceMap)
    this.createPlane('vertical', this.renderTargets[0].texture)
  }

  private createRenderTarget() {
    const { width, height } = this.resolution
    return new THREE.WebGLRenderTarget(width, height)
  }

  private createPlane(dir: BlurDirection, sourceMap: THREE.Texture) {
    const geo = new THREE.PlaneGeometry(2, 2)
    const mat = new RawShaderMaterial({
      uniforms: {
        sourceMap: { value: sourceMap },
        resolution: { value: [this.resolution.width, this.resolution.height] },
        direction: { value: dir === 'horizontal' ? [1, 0] : [0, 1] },
      },
      vertexShader: shader.blur.vs,
      fragmentShader: shader.blur.fs,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.name = dir
    this.scene.add(mesh)
  }

  render({ output }: RenderParams = { output: false }) {
    this.use('horizontal')
    this.renderer.setRenderTarget(this.renderTargets[0])
    this.renderer.render(this.scene, this.camera)

    this.use('vertical')
    if (output) {
      this.renderer.setRenderTarget(null)
    } else {
      this.renderer.setRenderTarget(this.renderTargets[1])
    }
    this.renderer.render(this.scene, this.camera)
  }

  resize() {
    const { width, height } = this.resolution
    this.renderTargets.forEach((rt) => rt.setSize(width, height))

    this.uniforms('horizontal').resolution.value = [width, height]
    this.uniforms('vertical').resolution.value = [width, height]
  }

  private get resolution() {
    const { width, height } = this.renderer.domElement
    const dpr = this.renderer.getPixelRatio()
    return { width: Math.trunc(width * dpr * this.scale), height: Math.trunc(height * dpr * this.scale) }
  }

  private use(name: BlurDirection) {
    this.scene.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        child.visible = child.name === name
      }
    })
  }

  private uniforms(name: BlurDirection) {
    return (this.scene.getObjectByName(name) as THREE.Mesh<THREE.BufferGeometry, RawShaderMaterial>).material.uniforms
  }

  get texture() {
    return this.renderTargets[1].texture
  }
}
