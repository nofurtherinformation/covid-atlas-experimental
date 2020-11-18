const dataFn = (numeratorData, index, range, denominatorData, denominatorProperty, denominatorIndex, denominatorRange, scale)  => {
    return (
      (
        (
          (numeratorData[index] -
            (
              (range!==null)&&(numeratorData[index-range])
            )
          )
          /
          (range+(range===null))
        )
      /
        (
          (
            (denominatorData[denominatorProperty][denominatorIndex] -
              (
                (denominatorRange!==null)&&(denominatorData[denominatorProperty][denominatorIndex-denominatorRange])
              )
            )
            /
            (denominatorRange+(denominatorRange===null))
          )
          ||
            (denominatorData[denominatorProperty])
          || 
          1
        )
      )
      *
      scale
    )
}

export default dataFn;