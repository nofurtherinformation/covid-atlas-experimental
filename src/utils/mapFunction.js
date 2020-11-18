const mapFn = (val, bins, colors) => {
    if (val == 0) return colors[0];
    for (let i=1; i<bins.length; i++) {
      if (val < bins[i]) {
        return colors[i]
      }
    }
    return colors[0];
}

export default mapFn