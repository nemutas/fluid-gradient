import { Three } from './core/Three'
import { pane } from './Gui'
import { Accum } from './scene/Accum'
import { Blend } from './scene/Blend'
import { Blur } from './scene/Blur'
import { Simulator } from './simulation/Simulator'

export class Canvas extends Three {
  private readonly simulator: Simulator
  private readonly accumPass: Accum
  private readonly blendPass: Blend
  private readonly blur1Pass: Blur
  private readonly blur2Pass: Blur

  constructor(canvas: HTMLCanvasElement) {
    super(canvas)

    this.simulator = new Simulator(this.renderer, this.scene, { pixel_ratio: 5 })
    this.accumPass = new Accum(this.renderer, 0.4)
    this.blendPass = new Blend(this.renderer)
    this.blur1Pass = new Blur(this.renderer, this.blendPass.texture, 0.1)
    this.blur2Pass = new Blur(this.renderer, this.blur1Pass.texture, 1)

    // this.loadParams()
    this.setGui()

    window.addEventListener('resize', this.resize.bind(this))
    this.renderer.setAnimationLoop(this.tick.bind(this))
  }

  // private loadParams() {
  //   const params = localStorage.getItem('params')
  //   if (params) {
  //     this.simulator.params = JSON.parse(params)
  //     pane.refresh()
  //   }
  // }

  private setGui() {
    pane.expanded = false
    pane.title = 'paramaters'
    pane.addFpsBlade()
    pane.addBinding(this.simulator, 'isDrawDensity', { label: 'draw_density' })
    pane.addBinding(this.simulator, 'isAdditional', { label: 'additional_velocity' }).on('change', (v) => {
      this.simulator.params.additionalVelocity = v.value ? 1 : 0
    })
    pane.addBinding(this.simulator.params, 'timeStep', { min: 0.001, max: 0.01, step: 0.001, label: 'time_step' })
    pane.addBinding(this.simulator.params, 'forceRadius', { min: 0.001, max: 0.15, step: 0.001, label: 'force_radius' })
    pane.addBinding(this.simulator.params, 'forceIntensity', { min: 1, max: 100, step: 1, label: 'force_intensity' })
    pane.addBinding(this.simulator.params, 'forceAttenuation', { min: 0, max: 0.1, step: 0.001, label: 'force_attenuation' })
    pane.addBinding(this.simulator.params, 'diffuse', { min: 0, max: 0.1, step: 0.001, label: 'diffuse' })
    // pane.addButton({ title: 'save params' }).on('click', () => localStorage.setItem('params', JSON.stringify(this.simulator.params)))
  }

  private tick() {
    pane.updateFps()
    const dt = this.clock.getDelta()

    this.simulator.update()
    this.accumPass.render(this.simulator.velocityTexture)
    this.blendPass.render(this.accumPass.texture, { dt })
    this.blur1Pass.render()
    this.blur2Pass.render({ output: true })
  }

  private resize() {
    this.simulator.resize()
    this.accumPass.resize()
    this.blendPass.resize()
    this.blur1Pass.resize()
    this.blur2Pass.resize()
  }
}
