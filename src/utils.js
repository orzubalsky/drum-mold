export const val= value => value * 72

export const times = n=> f=> {
  let iter = i=> {
    if (i === n) return
    f (i)
    iter (i + 1)
  }
  return iter (0)
}

export const radians = degrees => degrees * Math.PI / 180

export const pointOnCircle = (center, r, degrees) => {
   return {
      x: center.x + r * Math.cos(radians(degrees)),
      y: center.y + r * Math.sin(radians(degrees))
   }
}

export const point = (x, y) => {
  return { x: x, y: y }
}
