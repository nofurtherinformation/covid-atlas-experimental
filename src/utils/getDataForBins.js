import dataFn from './dataFunction';

// this function loops through the current data set and provides data for GeodaJS to create custom breaks 
const getDataForBins = (tableData, table, nType, numerProp, numerIndex, numerRange, denomTable, dType, denomProp, denomIndex, denomRange, scale) => {
    let t0 = performance.now() // logging performance

    // declare empty array for return variables
    let rtn = [];

    // length of data table to loop through
    let n = tableData.length;

    // this checks if the bins generated should be dynamic (generating for each date) or fixed (to the most recent date)
    if (numerIndex === null && numerProp === null) {
        // if fixed, get the most recent date
        let tempIndex = tableData[0][table].length-1;
        
        // if the denominator is time series data (eg. deaths / cases this week), make the indices the same (most recent)
        let tempDenomIndex = dType === 'time-series' ? tableData[0][denomTable].length-1 : denomIndex;

        // loop through, do appropriate calculation. push returned value to rtn array
        while (n>0) {
            n--;
            rtn.push(dataFn(tableData[n][table], numerProp, tempIndex, numerRange, tableData[n][denomTable], denomProp, tempDenomIndex, denomRange, scale))
        }
    } else {
       while (n>0) {
            n--;
            rtn.push(dataFn(tableData[n][table], numerProp, numerIndex, numerRange, tableData[n][denomTable], denomProp, denomIndex, denomRange, scale))
        }
    }

    console.log(performance.now() - t0);

    return rtn;   
}
export default getDataForBins