const getDataForBins = (fn, data, table, index, range) => {
    let t0 = performance.now()
    let rtn = [];
    let n = data.length;
    while (n>0) {
        n--;
        rtn.push(fn(data[n], table, index, range))
    }
    console.log(performance.now() - t0)
    return rtn;   
}
export default getDataForBins