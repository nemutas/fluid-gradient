import * as THREE from 'three'
import { RawShaderMaterial } from '../core/ExtendedMaterials'
import { RenderParams } from '../core/utils'
import { shader } from '../shader/shaders'

export class Accum {
  private readonly renderTargets: THREE.WebGLRenderTarget[] = []
  private readonly scene = new THREE.Scene()
  private readonly camera = new THREE.OrthographicCamera()

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly scale = 1,
  ) {
    this.renderTargets.push(this.createRenderTarget(), this.createRenderTarget())
    this.createPlane()
  }

  private createRenderTarget() {
    const { width, height } = this.resolution
    return new THREE.WebGLRenderTarget(width, height, {
      type: THREE.HalfFloatType,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    })
  }

  private createPlane() {
    const geo = new THREE.PlaneGeometry(2, 2)
    const mat = new RawShaderMaterial({
      uniforms: {
        velocityMap: { value: null },
        prevMap: { value: null },
        accum: { value: 0.5 },
      },
      vertexShader: shader.accum.vs,
      fragmentShader: shader.accum.fs,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.name = 'accum'
    this.scene.add(mesh)
  }

  render(velocityMap: THREE.Texture, { output }: RenderParams = {}) {
    this.uniforms.velocityMap.value = velocityMap
    this.uniforms.prevMap.value = this.renderTargets[0].texture

    this.renderer.setRenderTarget(output ? null : this.renderTargets[1])
    this.renderer.render(this.scene, this.camera)

    this.swap()
  }

  resize() {
    const { width, height } = this.resolution
    this.renderTargets.forEach((rt) => rt.setSize(width, height))
  }

  get texture() {
    return this.renderTargets[1].texture
  }

  private get resolution() {
    const { width, height } = this.renderer.domElement
    const dpr = this.renderer.getPixelRatio()
    return { width: width * dpr * this.scale, height: height * dpr * this.scale }
  }

  private swap() {
    const temp = this.renderTargets[0]
    this.renderTargets[0] = this.renderTargets[1]
    this.renderTargets[1] = temp
  }

  private get uniforms() {
    return (this.scene.getObjectByName('accum') as THREE.Mesh<THREE.BufferGeometry, RawShaderMaterial>).material.uniforms
  }
}
