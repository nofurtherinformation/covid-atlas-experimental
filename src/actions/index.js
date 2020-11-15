export const setGeoid = (geoid) => {
    return {
        type: 'SET_GEOID',
        payload: {
            geoid
        }
    }
}

export const storeData = (data, name) => {
    return {
        type: 'SET_STORED_DATA',
        payload: {
            data,
            name
        }   
    }
}

export const setCurrentData = (data) => {
    return {
        type: 'SET_CURRENT_DATA',
        payload: {
            data
        }
    }
}

export const setGeodaProxy = (proxy) => {
    return {
        type: 'SET_GEODA_PROXY',
        payload: {
            proxy
        }
    }
}

export const setCentroids = (data, name) => {
    return {
        type: 'SET_CENTROIDS',
        payload: {
            data,
            name
        }
    }
}

export const setDates = (data, name) => {
    return {
        type: 'SET_DATES',
        payload: {
            data,
            name
        }
    }
}


export const setDataFunction = (fn) => {
    return {
        type: 'SET_DATA_FUNCTION',
        payload: {
            fn
        }
    }
}

export const setColumnNames = (data, name) => {
    return {
        type: 'SET_COLUMN_NAMES',
        payload: {
            data,
            name
        }
    }

}

export const setDate = (date) => {
    return {
        type: 'SET_CURR_DATE',
        payload: {
            date
        }
    }
}

export const setDateIndex = (index) => {
    return {
        type: 'SET_DATE_INDEX',
        payload: {
            index
        }
    }
}

export const setBins = (bins, breaks) => {
    return {
        type: 'SET_BINS',
        payload: {
            bins,
            breaks
        }
    }
}

export const set3D = () => {
    return {
        type: 'SET_3D'
    }
}