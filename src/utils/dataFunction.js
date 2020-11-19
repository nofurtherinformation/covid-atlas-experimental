// branchless variant
// const dataFn = (numeratorData, numeratorProperty, index, range, denominatorData, denominatorProperty, denominatorIndex, denominatorRange, scale)  => {

//     return (
//       (
//         (
//           (
//             (numeratorData[index]||numeratorData[numeratorProperty])
//             -
//             ((range!==null)&&(numeratorData[index-range]))
//           )
          
//           /
//           (range+(range===null))
//         )
//       /
//         (
//           (
//             (
//               (denominatorData[denominatorIndex]||denominatorData[denominatorProperty])
//               -
//               ((denominatorRange!==null)&&(denominatorData[denominatorIndex-denominatorRange]))
//             )
//             /
//             (denominatorRange+(denominatorRange===null))
//           )
//           ||
//             (denominatorData[denominatorProperty])
//           || 
//           1
//         )
//       )
//       *
//       scale
//     )
// }

// export default dataFn;

const dataFn = (numeratorData, numeratorProperty, index, range, denominatorData, denominatorProperty, denominatorIndex, denominatorRange, scale)  => {
  if (denominatorProperty===null&&range===null){ // whole count or number -- no range, no normalization
    return (numeratorData[numeratorProperty]||numeratorData[index])*scale
  } else if (denominatorProperty===null&&range!==null){ // range number, daily or weekly count -- no normalization
    return (numeratorData[index]-numeratorData[index-range])/range*scale
  } else if (denominatorProperty!==null&&range===null){ // whole count or number normalized -- no range
    return (numeratorData[numeratorProperty]||numeratorData[index])/(denominatorData[denominatorProperty]||denominatorData[denominatorIndex])*scale
  } else if (denominatorProperty!==null&&range!==null&&denominatorRange===null){ // range number, daily or weekly count, normalized to a single value
    return ((numeratorData[index]-numeratorData[index-range])/range)/(denominatorData[denominatorProperty]||denominatorData[denominatorIndex])*scale
  } else if (denominatorProperty!==null&&range!==null&&denominatorRange!==null){ // range number, daily or weekly count, normalized to a range number, daily or weekly count
    return ((numeratorData[index]-numeratorData[index-range])/range)/((denominatorData[denominatorIndex]-denominatorData[denominatorIndex-denominatorRange])/denominatorRange)*scale
  } else {      
    return 0;
  }
}

export default dataFn;