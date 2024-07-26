
let config = require("./config.js");
const log4js = require("log4js");
log4js.configure(config.log4js_set);
const logger = log4js.getLogger(__filename.slice(__dirname.length + 1));

path = require("path") ;

let util = require ("./lib/util.js")

let ttc_1200 = {} ;
let ttc_800 = {} ;

let basic_length = 0 ;
let advance_length = 0 ;

exports.init = function () {
    path_basic = path.join(__dirname, config.eng.resource_folder, config.eng.basic);
    path_advance = path.join(__dirname, config.eng.resource_folder, config.eng.advance);
    logger.info ("Loading vocabulary database from  : " + path_basic + " and " + path_advance) ;

    ttc_1200 = util.loadJSONFileSync(path_basic) ;
    ttc_800 = util.loadJSONFileSync(path_advance) ;

    if (ttc_1200) 
        basic_length = Object.keys(ttc_1200).length

    if (ttc_800) 
        advance_length = Object.keys(ttc_800).length
    
    /*
    console.log (Object.keys(ttc_800).length) ;       // 784
    console.log (Object.keys(ttc_800)[15]) ;          // air conditioner
    console.log (Object.entries(ttc_800)[15]) ;       // [ 'air conditioner', { chi: '[名詞] 冷氣機', link: 'None', count: '0' } ]
    console.log (Object.entries(ttc_800)[15][0]) ;    // air conditioner
    console.log (ttc_800[Object.keys(ttc_800)[15]]) ;  // { chi: '[名詞] 冷氣機', link: 'None', count: '0' }
    */
}

exports.randomBasicWord = function () {
    var seed = Math.random()  ;
    seed = Math.round(seed * 10000) % basic_length ;   
    //logger.debug(seed) ;
    return Object.entries(ttc_1200)[seed];
}

exports.randomAdvanceWord = function () {

    var seed = Math.random()  ;
    seed = Math.round(seed * 1000) % advance_length ;   
    //logger.debug(seed) ;
    return Object.entries(ttc_800)[seed];
}