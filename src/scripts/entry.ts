import { Canvas } from './Canvas'

console.log(`https://github.com/nemutas/${import.meta.env.BASE_URL.split('/').at(-2)}`)

const canvas = new Canvas(document.querySelector<HTMLCanvasElement>('.webgl-canvas')!)

window.addEventListener('beforeunload', () => {
  canvas.dispose()
})
