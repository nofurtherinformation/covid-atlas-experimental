import { INITIAL_STATE } from '../constants/defaults';

var reducer = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case 'SET_GEOID': 
            return {
                ...state,
                currentGeoid: action.payload.geoid
            };
        case 'SET_STORED_DATA':
            let obj = {
                ...state.storedData,
            }
            obj[action.payload.name] = action.payload.data
            return {
                ...state,
                storedData: obj
            };
        case 'SET_CENTROIDS':
            let centroidsObj = {
                ...state.centroids,
            }
            centroidsObj[action.payload.name] = action.payload.data
            return {
                ...state,
                centroids: centroidsObj
            };
        case 'SET_CURRENT_DATA':
            return {
                ...state,
                currentData: action.payload.data
            }
        case 'SET_GEODA_PROXY':
            return {
                ...state,
                geodaProxy: action.payload.proxy
            }
        case 'SET_DATES':
            let datesObj = {
                ...state.dates
            }
            datesObj[action.payload.name] = action.payload.data
            return {
                ...state,
                dates: datesObj
            }
        case 'SET_DATA_FUNCTION':
            return {
                ...state,
                currentDataFn: action.payload.fn
            }
        case 'SET_COLUMN_NAMES':
            let colObj = {
                ...state.cols
            }
            colObj[action.payload.name] = action.payload.data
            return {
                ...state,
                cols: colObj
            }
        case 'SET_CURR_DATE':
            return {
                ...state,
                currDate: action.payload.date
            }
        case 'SET_DATE_INDEX':
            return {
                ...state,
                currDateIndex: action.payload.index
            }
        case 'SET_START_DATE_INDEX':
            return {
                ...state,
                startDateIndex: action.payload.index
            }
        case 'SET_BINS':
            let binsObj = {};
            binsObj['bins'] =  action.payload.bins;
            binsObj['breaks'] =  action.payload.breaks;
            return {
                ...state,
                bins: binsObj
            }
        case 'SET_3D':
            return {
                ...state,
                use3D: !state.use3D
            }
        case 'SET_DATA_SIDEBAR':
            return {
                ...state,
                sidebarData: action.payload.data
            }
        case 'INCREMENT_DATE':
            let dateObj = {
                ...state.dataParams
            }
            if (action.payload.index+state.dataParams.nIndex > state.dates[state.currentData].length) {
                dateObj.nIndex = state.startDateIndex;
                dateObj.dIndex = state.startDateIndex;
                return {
                    ...state,
                    dataParams:dateObj
                }
            } else {
                dateObj.nIndex = dateObj.nIndex + action.payload.index;
                dateObj.dIndex = dateObj.dIndex + action.payload.index;
                return {
                    ...state,
                    dataParams:dateObj
                }
            }
        case 'SET_VARIABLE_PARAMS':
            let paramObj = {
                ...state.dataParams,
                ...action.payload.params
            }

            if (paramObj.nType === 'time-series' && paramObj.nIndex === null) {
                paramObj.nIndex = state.storedIndex;
                paramObj.nRange = state.storedRange;
            }
            if (paramObj.dType === 'time-series' && paramObj.dIndex === null) {
                paramObj.dIndex = state.storedIndex;
                paramObj.dRange = state.storedRange;
            }
            if (paramObj.nType === 'characteristic' && state.dataParams.nType === 'time-series') {
                return {
                    ...state,
                    storedIndex: state.dataParams.nIndex,
                    storedRange: state.dataParams.nRange,
                    dataParams: paramObj,
                }
            } else {
                return {
                    ...state,
                    dataParams: paramObj 
                }
            }
        case 'SET_CHART_DATA':
            return {
                ...state,
                chartData: action.payload.data
            }
        default:
            return state;
    }
}

export default reducer;