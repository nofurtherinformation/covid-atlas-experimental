import dataFn from './dataFunction'

const getDataForBins = (tableData, table, numerProp, numerIndex, numerRange, denomTable, denomProp, denomIndex, denomRange, scale) => {
    let t0 = performance.now()
    let rtn = [];
    let n = tableData.length;
    while (n>0) {
        n--;
        rtn.push(dataFn(tableData[n][table], numerProp, numerIndex, numerRange, tableData[n][denomTable], denomProp, denomIndex, denomRange, scale))
    }
    console.log(performance.now() - t0)
    return rtn;   
}
export default getDataForBins