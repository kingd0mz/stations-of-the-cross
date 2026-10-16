// Physical PDF page ranges; metadata only, with no restricted prayer text.
export const sources = {
  en: {
    document: 'stations-of-the-cross.pdf', pageCount: 19,
    opening: [1], stations: Array.from({ length: 14 }, (_, index) => [index + 2]),
    closing: [16], supplementaryHymns: [17, 18, 19],
  },
  fil: {
    document: 'bagong-daan-ng-krus.pdf', pageCount: 37,
    opening: [2],
    stations: [[3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16],
      [17, 18], [19, 20], [21, 22], [23, 24], [25, 26, 27], [28, 29], [30, 31], [32, 33], [34, 35, 36]],
    closing: [37], supplementaryHymns: [],
  },
} as const;
