import baseVs from './base.vs'
import blendFs from './blend.fs'
import blurFs from './blur.fs'
import accumFs from './accum.fs'

export const shader = {
  blend: {
    vs: baseVs,
    fs: blendFs,
  },
  blur: {
    vs: baseVs,
    fs: blurFs,
  },
  accum: {
    vs: baseVs,
    fs: accumFs,
  },
}
