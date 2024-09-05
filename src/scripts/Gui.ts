import { Pane } from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'

export class TweakPane extends Pane {
  private fps?: EssentialsPlugin.FpsGraphBladeApi

  constructor() {
    super()
    this.registerPlugin(EssentialsPlugin)
    this.custom()
  }

  private custom() {
    document.querySelector<HTMLElement>('.tp-dfwv')?.style.setProperty('width', 'fit-content')
    document.querySelector<HTMLElement>('.tp-dfwv')?.style.setProperty('user-select', 'none')
    document.querySelector<HTMLElement>('.tp-dfwv .tp-rotv_c')?.style.setProperty('display', 'block')
  }

  addFpsBlade(label?: string) {
    this.fps = this.addBlade({ view: 'fpsgraph', label: label ?? 'fps' } as any) as EssentialsPlugin.FpsGraphBladeApi
  }

  updateFps() {
    this.fps?.end()
    this.fps?.begin()
  }
}

export const pane = new TweakPane()
