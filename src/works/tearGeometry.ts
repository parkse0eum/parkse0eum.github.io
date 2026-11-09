export const STATIONERY_WIDTH = 1100
export const STATIONERY_HEIGHT = 1595
export const PERFORATION_X = 86

export function tearGeometry(value: number) {
  const progress = Math.max(0, Math.min(1, value))
  const end = progress * STATIONERY_HEIGHT
  const edge: [number, number][] = [[PERFORATION_X, 0]]
  for (let y = 5; y < end; y += 5) {
    const tooth = Math.sin(y * 1.91) * 1.6 + Math.sin(y * .47) * 1.1
    edge.push([PERFORATION_X + tooth, y])
  }
  edge.push([PERFORATION_X, end])
  const seam = edge.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  return {
    progress, end,
    body: `${seam} 0,${end} 0,${STATIONERY_HEIGHT} ${STATIONERY_WIDTH},${STATIONERY_HEIGHT} ${STATIONERY_WIDTH},0`,
    strip: `0,0 ${seam} 0,${end}`,
    edge,
  }
}
