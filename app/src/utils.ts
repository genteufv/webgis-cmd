export function generateQueryParams(object: any) {

  const objSize = Object.keys(object).length
  var paramsArray = []

  for (let index = 0; index < objSize; index++) {
    
    paramsArray.push({
      key: Object.keys(object)[index],
      value: Object.values(object)[index]
    })
  }

  return (
    paramsArray
    .map((e:any ) => {
      return `${e.key}=${e.value}`
    })
    .join('&')
  );
}