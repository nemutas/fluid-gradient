import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'

export abstract class Three {
  readonly renderer: THREE.WebGLRenderer
  readonly scene: THREE.Scene
  protected readonly clock: THREE.Clock
  private _stats?: Stats
  protected focusWindow = true
  private abortController?: AbortController

  constructor(protected canvas: HTMLCanvasElement) {
    this.renderer = this.createRenderer(canvas)
    this.scene = this.createScene()
    this.clock = new THREE.Clock()

    this.addEvents()
  }

  private createRenderer(canvas: HTMLCanvasElement) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    // renderer.setPixelRatio(isTouch ? 1 : window.devicePixelRatio)
    renderer.setPixelRatio(1)
    // renderer.shadowMap.enabled = true
    return renderer
  }

  private createScene() {
    const scene = new THREE.Scene()
    return scene
  }

  protected get stats() {
    if (!this._stats) {
      this._stats = new Stats()
      document.body.appendChild(this._stats.dom)
    }
    return this._stats
  }
  private addEvents() {
    this.abortController = new AbortController()

    window.addEventListener(
      'resize',
      () => {
        const { innerWidth: width, innerHeight: height } = window
        this.renderer.setSize(width, height)
      },
      { signal: this.abortController.signal },
    )

    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.visibilityState === 'visible') this.clock.start()
        else if (document.visibilityState === 'hidden') this.clock.stop()
      },
      { signal: this.abortController.signal },
    )
  }

  get size() {
    const { width, height } = this.renderer.domElement
    return { width, height, aspect: width / height }
  }

  protected coveredScale(imageAspect: number) {
    const screenAspect = this.size.aspect
    if (screenAspect < imageAspect) return [screenAspect / imageAspect, 1]
    else return [1, imageAspect / screenAspect]
  }

  protected render(camera: THREE.Camera) {
    this.renderer.setRenderTarget(null)
    this.renderer.render(this.scene, camera)
  }

  dispose() {
    this.renderer.setAnimationLoop(null)
    this.renderer.dispose()
    this.abortController?.abort()
  }
}
