export const colorScales = {
    'natural_breaks': [
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
    'lisa': [
        [255,255,255],
        [255,0,0],
        [0,0,255],
        [167, 173, 249],
        [244, 173, 168],
        [70, 70, 70],
        [153, 153, 153]
    ],
    'hinge15_breaks': [
        [1, 102, 94],
        [90, 180, 172],
        [199, 234, 229],
        [246, 232, 195],
        [216, 179, 101],
        [140, 81, 10],
    ],    
    'uninsured':[
        [240,240,240],
        [247,252,253],
        [224,236,244],
        [191,211,230],
        [158,188,218],
        [140,150,198],
        [140,107,177],
        [136,65,157],
        [129,15,124],
        // [77,0,75],
      ],
    'over65':[
        [240,240,240],
        [247,252,240],
        [224,243,219],
        [204,235,197],
        [168,221,181],
        [123,204,196],
        [78,179,211],
        [43,140,190],
        [8,104,172],
        // [8,64,129],
    ],
    'lifeExp':[
        [240,240,240],
        [247,252,240],
        [224,243,219],
        [204,235,197],
        [168,221,181],
        [123,204,196],
        [78,179,211],
        [43,140,190],
        [8,104,172],
        // [8,64,129],
    ],
    'forecasting': [
        [240, 240, 240],
        [254,232,200],
        [253,187,132],
        [227,74,51],
    ],
    'testings' : [
        [240,240,240],
        [13,8,135],
        [92,1,166],
        [156,23,158],
        [203,70,121],
        [237,121,83],
        [253,180,47],
        [240,249,33],
      ],
      'testingCap':[
        [240,240,240],
        [247,251,255],
        [222,235,247],
        [198,219,239],
        [158,202,225],
        [107,174,214],
        [66,146,198],
        [33,113,181],
        [8,81,156],
        [8,48,107],
      ],
}

export const fixedScales = {
    'testing': {
        bins: ['No Data','<3%','5%','10%','15%','20%','>25%'],
        breaks:[0,3,5,10,15,20,25,Math.pow(10, 12)]
    },
    'testingCap': {
        bins: ['No Data','<50','100','150','200','250','300','350','>400'],
        breaks:[0,50,100,150,200,250,300,350,400,Math.pow(10, 12)]
    },
    'lisa':{
        bins: ["Not significant", "High-High", "Low-Low", "Low-High", "High-Low", "Undefined", "Isolated"]
    }
}

export const dataPresets = {
    'county_usfacts.geojson': {
        geojson: 'county_usfacts.geojson', 
        csv: ['covid_confirmed_usafacts','covid_deaths_usafacts', 'berkeley_predictions', 'chr_health_context', 'chr_life', 'chr_health_factors'], 
        joinCols: ['GEOID', 'FIPS'], 
        tableNames: ['cases','deaths', 'predictions', 'chr_health_context', 'chr_life', 'chr_health_factors'],
        accumulate: []
    },
    'county_1p3a.geojson': {
        geojson: 'county_1p3a.geojson', 
        csv: ['covid_confirmed_1p3a','covid_deaths_1p3a', 'berkeley_predictions', 'chr_health_context', 'chr_life', 'chr_health_factors'], 
        joinCols: ['GEOID', 'FIPS'], 
        tableNames: ['cases','deaths', 'predictions', 'chr_health_context', 'chr_life', 'chr_health_factors'],
        accumulate: ['covid_confirmed_1p3a','covid_deaths_1p3a']
    },
    'county_nyt.geojson': {
        geojson: 'county_nyt.geojson', 
        csv: ['covid_confirmed_nyt', 'covid_deaths_nyt', 'berkeley_predictions', 'chr_health_context', 'chr_life', 'chr_health_factors'], 
        joinCols: ['GEOID', 'FIPS'], 
        tableNames: ['cases', 'deaths', 'predictions', 'chr_health_context', 'chr_life', 'chr_health_factors'],
        accumulate: []
    },
    'state_1p3a.geojson': {
        geojson: 'state_1p3a.geojson', 
        csv: ['covid_confirmed_1p3a_state','covid_deaths_1p3a_state', 'chr_health_context_state', 'chr_life_state', 'chr_health_factors_state', 'covid_testing_1p3a_state', 'covid_wk_pos_1p3a_state', 'covid_tcap_1p3a_state', 'covid_ccpt_1p3a_state'], 
        joinCols: ['GEOID', 'FIPS'], 
        tableNames: ['cases', 'deaths', 'chr_health_context', 'chr_life', 'chr_health_factors', 'testing', 'testing_wk_pos', 'testing_tcap', 'testing_ccpt'],
        accumulate: ['covid_confirmed_1p3a_state','covid_deaths_1p3a_state']
    } 
}