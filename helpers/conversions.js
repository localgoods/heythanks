export function camelToSnake(str) {
    return str.replace(/([A-Z])/g, (g) => `_${g[0].toLowerCase()}`)
}

export function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
}

export function camelObjToSnakeObj(obj) {
    let newObj = {}
    for (let key in obj) {
        newObj[camelToSnake(key)] = obj[key]
    }
    return newObj
}

export function snakeObjToCamelObj(obj) {
    let newObj = {}
    for (let key in obj) {
        newObj[snakeToCamel(key)] = obj[key]
    }
    return newObj
}