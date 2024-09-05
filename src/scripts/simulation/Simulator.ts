import * as THREE from 'three'
import { RawShaderMaterial } from '../core/ExtendedMaterials'
import { shader, ShaderName } from './shader/shaders'

export class Simulator {
  private readonly PIXEL_RATIO // 解像度に対する係数
  private readonly DIFFUSE_ITERATION // 拡散計算のイテレーション回数
  private readonly PROJECT_ITERATION // 質量計算のイテレーション回数

  private readonly canvas: HTMLCanvasElement
  private readonly camera: THREE.OrthographicCamera

  private velocityFramebuffers: THREE.WebGLRenderTarget[] = []
  private densityFramebuffers: THREE.WebGLRenderTarget[] = []
  private projectFramebuffers: THREE.WebGLRenderTarget[] = []

  params = {
    timeStep: 0.01,
    forceRadius: 0.15,
    forceIntensity: 2,
    forceAttenuation: 0.0,
    diffuse: 0.015,
    additionalVelocity: 1,
  }

  private mouse = {
    press: true,
    move: false,
    position: [0, 0],
    prevPosition: [0, 0],
    direction: [0, 0],
    length: 1,
  }

  isAdditional = true
  isDrawDensity = true

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly scene: THREE.Scene,
    options?: {
      pixel_ratio?: number
      diffuse_iteration?: number
      project_iteration?: number
    },
  ) {
    this.PIXEL_RATIO = options?.pixel_ratio ?? 2
    this.DIFFUSE_ITERATION = options?.diffuse_iteration ?? 4
    this.PROJECT_ITERATION = options?.project_iteration ?? 16

    this.canvas = renderer.domElement
    this.camera = new THREE.OrthographicCamera()

    this.addPointerEvents()
    this.createMeshes()
    this.createFrameBuffers()
    this.resetFrameBuffers()
  }

  private get bufferSize() {
    return {
      width: Math.ceil(this.canvas.width / this.PIXEL_RATIO),
      height: Math.ceil(this.canvas.height / this.PIXEL_RATIO),
    }
  }

  private createFrameBuffers() {
    const { width, height } = this.bufferSize

    const create = () => {
      return new THREE.WebGLRenderTarget(width, height, {
        type: THREE.FloatType,
        format: THREE.RGBAFormat,
        magFilter: THREE.NearestFilter,
        minFilter: THREE.NearestFilter,
        // wrapS: THREE.RepeatWrapping,
        // wrapT: THREE.RepeatWrapping,
      })
    }

    this.velocityFramebuffers = [create(), create()]
    this.densityFramebuffers = [create(), create()]
    this.projectFramebuffers = [create(), create()]
  }

  resetFrameBuffers() {
    this.velocityFramebuffers.forEach((buffer) => {
      this.use('resetVelocity')
      this.bind(buffer)
      this.render()
      this.bind(null)
    })

    this.densityFramebuffers.forEach((buffer) => {
      this.use('resetDensity')
      this.bind(buffer)
      this.render()
      this.bind(null)
    })

    this.projectFramebuffers.forEach((buffer) => {
      this.use('resetProject')
      this.bind(buffer)
      this.render()
      this.bind(null)
    })
  }

  private addPointerEvents() {
    const pointermoveHandler = (e: PointerEvent | Touch) => {
      // if (!this.mouse.press) {
      //   this.mouse.move = false
      //   return
      // }
      const vx = e.clientX - this.mouse.prevPosition[0]
      const vy = e.clientY - this.mouse.prevPosition[1]
      const length = Math.hypot(vx, vy)
      this.mouse.prevPosition[0] = e.clientX
      this.mouse.prevPosition[1] = e.clientY
      this.mouse.position[0] = (e.clientX / window.innerWidth) * 2 - 1
      this.mouse.position[1] = -((e.clientY / window.innerHeight) * 2 - 1)
      if (length === 0) {
        this.mouse.direction[0] = 0
        this.mouse.direction[1] = 0
      } else {
        this.mouse.direction[0] = vx / length
        this.mouse.direction[1] = -vy / length
      }
      this.mouse.length = 1 + length
      this.mouse.move = true
    }

    // const eventTarget = this.canvas
    const eventTarget = window

    eventTarget.addEventListener('pointermove', (e) => {
      pointermoveHandler(e)
    })

    eventTarget.addEventListener('pointerdown', (e) => {
      this.mouse.press = true
      this.mouse.prevPosition[0] = e.clientX
      this.mouse.prevPosition[1] = e.clientY
    })

    // eventTarget.addEventListener('pointerup', () => {
    //   this.mouse.press = false
    //   this.mouse.move = false
    // })
  }

  private createMesh(name: ShaderName, uniforms?: { [uniform: string]: THREE.IUniform<any> }) {
    const geo = new THREE.PlaneGeometry(2, 2)
    const mat = new RawShaderMaterial({
      uniforms: uniforms ?? {},
      vertexShader: shader.base,
      fragmentShader: shader[name],
      glslVersion: '300 es',
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.name = name
    this.scene.add(mesh)
    return mesh
  }

  private createMeshes() {
    this.createMesh('resetVelocity')
    this.createMesh('resetDensity')
    this.createMesh('resetProject')

    this.createMesh('diffuseVelocity', {
      resolution: { value: this.resolution },
      velocityTexture: { value: null },
      dt: { value: this.params.timeStep },
      diffuse: { value: this.params.diffuse },
    })
    this.createMesh('diffuseDensity', {
      resolution: { value: this.resolution },
      densityTexture: { value: null },
      dt: { value: this.params.timeStep },
      diffuse: { value: this.params.diffuse },
    })

    this.createMesh('advectVelocity', {
      resolution: { value: this.resolution },
      velocityTexture: { value: null },
      dt: { value: this.params.timeStep },
      attenuation: { value: this.params.forceAttenuation },
    })
    this.createMesh('advectDensity', {
      resolution: { value: this.resolution },
      velocityTexture: { value: null },
      densityTexture: { value: null },
      dt: { value: this.params.timeStep },
      additionalVelocity: { value: this.params.additionalVelocity },
    })

    this.createMesh('projectBegin', {
      resolution: { value: this.resolution },
      velocityTexture: { value: null },
    })
    this.createMesh('projectLoop', {
      resolution: { value: this.resolution },
      projectTexture: { value: null },
    })
    this.createMesh('projectEnd', {
      resolution: { value: this.resolution },
      velocityTexture: { value: null },
      projectTexture: { value: null },
    })

    this.createMesh('forceVelocity', {
      resolution: { value: this.resolution },
      velocityTexture: { value: null },
      dt: { value: this.params.timeStep },
      forceRadius: { value: this.params.forceRadius },
      forceIntensity: { value: this.params.forceIntensity },
      forceDirection: { value: this.mouse.direction },
      forceOrigin: { value: this.mouse.position },
    })

    this.createMesh('renderVelocity', {
      velocityTexture: { value: null },
    })
    this.createMesh('renderDensity', {
      densityTexture: { value: null },
    })
  }

  private updateVelocity() {
    // マウスカーソルが押下＋移動の場合、速度を加算する
    if (this.mouse.press && this.mouse.move) {
      this.mouse.move = false
      const uniforms = this.uniforms('forceVelocity')
      uniforms.resolution.value = this.resolution
      uniforms.velocityTexture.value = this.texture(this.velocityFramebuffers[1])
      uniforms.dt.value = this.params.timeStep
      uniforms.forceRadius.value = this.params.forceRadius
      uniforms.forceIntensity.value = this.params.forceIntensity * this.mouse.length
      uniforms.forceDirection.value = this.mouse.direction
      uniforms.forceOrigin.value = this.mouse.position
      this.use('forceVelocity')
      this.bind(this.velocityFramebuffers[0])
      this.render()
      this.swap(this.velocityFramebuffers)
    }

    // 拡散が設定されている場合計算する
    if (0 < this.params.diffuse) {
      this.use('diffuseVelocity')
      for (let i = 0; i < this.DIFFUSE_ITERATION; i++) {
        const uniforms = this.uniforms('diffuseVelocity')
        uniforms.resolution.value = this.resolution
        uniforms.velocityTexture.value = this.texture(this.velocityFramebuffers[1])
        uniforms.dt.value = this.params.timeStep
        uniforms.diffuse.value = this.params.diffuse
        this.bind(this.velocityFramebuffers[0])
        this.render()
        this.swap(this.velocityFramebuffers)
      }
    }

    // 質量の計算と移流を計算する
    this.updateProject()
    const uniforms = this.uniforms('advectVelocity')
    uniforms.resolution.value = this.resolution
    uniforms.velocityTexture.value = this.texture(this.velocityFramebuffers[1])
    uniforms.dt.value = this.params.timeStep
    uniforms.attenuation.value = this.params.forceAttenuation
    this.use('advectVelocity')
    this.bind(this.velocityFramebuffers[0])
    this.render()
    this.swap(this.velocityFramebuffers)
    this.updateProject()
  }

  private updateDensity() {
    // 拡散が設定されている場合計算する
    if (0 < this.params.diffuse) {
      this.use('diffuseDensity')
      for (let i = 0; i < this.DIFFUSE_ITERATION; i++) {
        const uniforms = this.uniforms('diffuseDensity')
        uniforms.resolution.value = this.resolution
        uniforms.densityTexture.value = this.texture(this.densityFramebuffers[1])
        uniforms.dt.value = this.params.timeStep
        uniforms.diffuse.value = this.params.diffuse
        this.bind(this.densityFramebuffers[0])
        this.render()
        this.swap(this.densityFramebuffers)
      }
    }

    // 速度に応じて濃度を更新する
    const uniforms = this.uniforms('advectDensity')
    uniforms.resolution.value = this.resolution
    uniforms.velocityTexture.value = this.texture(this.velocityFramebuffers[1])
    uniforms.densityTexture.value = this.texture(this.densityFramebuffers[1])
    uniforms.dt.value = this.params.timeStep
    uniforms.additionalVelocity.value = this.params.additionalVelocity
    this.use('advectDensity')
    this.bind(this.densityFramebuffers[0])
    this.render()
    this.swap(this.densityFramebuffers)
  }

  private updateProject() {
    {
      const uniforms = this.uniforms('projectBegin')
      uniforms.resolution.value = this.resolution
      uniforms.velocityTexture.value = this.texture(this.velocityFramebuffers[1])
      this.use('projectBegin')
      this.bind(this.projectFramebuffers[0])
      this.render()
      this.swap(this.projectFramebuffers)
    }

    this.use('projectLoop')
    for (let i = 0; i < this.PROJECT_ITERATION; i++) {
      const uniforms = this.uniforms('projectLoop')
      uniforms.resolution.value = this.resolution
      uniforms.projectTexture.value = this.texture(this.projectFramebuffers[1])
      this.bind(this.projectFramebuffers[0])
      this.render()
      this.swap(this.projectFramebuffers)
    }

    {
      const uniforms = this.uniforms('projectEnd')
      uniforms.resolution.value = this.resolution
      uniforms.velocityTexture.value = this.texture(this.velocityFramebuffers[1])
      uniforms.projectTexture.value = this.texture(this.projectFramebuffers[1])
      this.use('projectEnd')
      this.bind(this.velocityFramebuffers[0])
      this.render()
      this.swap(this.velocityFramebuffers)
    }
  }

  private renderToDensity() {
    const uniforms = this.uniforms('renderDensity')
    uniforms.densityTexture.value = this.texture(this.densityFramebuffers[1])
    this.use('renderDensity')
    this.bind(null)
    this.render()
  }

  private renderToVelocity() {
    const uniforms = this.uniforms('renderVelocity')
    uniforms.velocityTexture.value = this.texture(this.velocityFramebuffers[1])
    this.use('renderVelocity')
    this.bind(null)
    this.render()
  }

  update(debugRender = false) {
    this.updateVelocity()
    this.updateDensity()

    if (debugRender) {
      if (this.isDrawDensity) {
        this.renderToDensity()
      } else {
        this.renderToVelocity()
      }
    }
  }

  resize() {
    for (const buffer of this.velocityFramebuffers) {
      buffer.setSize(this.bufferSize.width, this.bufferSize.height)
    }
    for (const buffer of this.densityFramebuffers) {
      buffer.setSize(this.bufferSize.width, this.bufferSize.height)
    }
    for (const buffer of this.projectFramebuffers) {
      buffer.setSize(this.bufferSize.width, this.bufferSize.height)
    }
    this.resetFrameBuffers()
  }

  // ------------------
  // utility functions

  get resolution() {
    return [this.bufferSize.width, this.bufferSize.height]
  }

  get velocityTexture() {
    return this.texture(this.velocityFramebuffers[1])
  }

  get densityTexture() {
    return this.texture(this.densityFramebuffers[1])
  }

  private use(name: ShaderName) {
    this.scene.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        child.visible = child.name === name
      }
    })
  }

  private bind(renderTarget: THREE.WebGLRenderTarget | null) {
    this.renderer.setRenderTarget(renderTarget)
  }

  private uniforms(name: ShaderName) {
    return (this.scene.getObjectByName(name) as THREE.Mesh<THREE.PlaneGeometry, RawShaderMaterial>).material.uniforms
  }

  private swap(targets: THREE.WebGLRenderTarget[]) {
    const temp = targets[0]
    targets[0] = targets[1]
    targets[1] = temp
  }

  private texture(renderTarget: THREE.WebGLRenderTarget) {
    return renderTarget.texture
  }

  private render() {
    this.renderer.render(this.scene, this.camera)
  }
}
