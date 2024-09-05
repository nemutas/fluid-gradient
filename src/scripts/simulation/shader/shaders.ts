import base from './base.vs'
import advectDensity from './advectDensity.fs'
import advectVelocity from './advectVelocity.fs'
import diffuseDensity from './diffuseDensity.fs'
import diffuseVelocity from './diffuseVelocity.fs'
import forceVelocity from './forceVelocity.fs'
import projectBegin from './projectBegin.fs'
import projectEnd from './projectEnd.fs'
import projectLoop from './projectLoop.fs'
import renderDensity from './renderDensity.fs'
import renderVelocity from './renderVelocity.fs'
import resetDensity from './resetDensity.fs'
import resetProject from './resetProject.fs'
import resetVelocity from './resetVelocity.fs'

export const shader = {
  base,
  advectDensity,
  advectVelocity,
  diffuseDensity,
  diffuseVelocity,
  forceVelocity,
  projectBegin,
  projectEnd,
  projectLoop,
  renderDensity,
  renderVelocity,
  resetDensity,
  resetProject,
  resetVelocity,
}

export type ShaderName = keyof typeof shader
