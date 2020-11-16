export const INITIAL_STATE = {
  geodaProxy: null,
  storedData: {},
  cols: {},
  currentData: '',
  chartData: {},
  bins: {},
  binMode: '',
  colorScale:  [
    [240,240,240],
    [255,255,204],
    [255,237,160],
    [254,217,118],
    [254,178,76],
    [253,141,60],
    [252,78,42],
    [227,26,28],
    [177,0,38],
  ],
  centroids: {},
  dates: {},
  currDate: '',
  currDateIndex: '',
  currentVariable: '7-Day Average Daily New Confirmed Count per 100K Pop',
  currentMethod: 'natural_breaks',
  currentOverlay: '',
  currentResource: '',
  isCartogram: false,
  currentGeoid: '',
  use3D: false,
  currentDataFn: (data, table, index, range) => (data[table][index]-data[table][index-range])/7/data.properties.population*100000,
  currentMapFn: (val, bins, colors) => {
    if (val == 0) return colors[0];
    for (let i=1; i<bins.length; i++) {
      if (val < bins[i]) {
        return colors[i]
      }
    }
    return [0,0,0]
  }
};