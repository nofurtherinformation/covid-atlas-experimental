export const loadGeojsonToGeoda = async (data, url, gda_proxy) => {
  const arrayBuffer = await data.arrayBuffer();

  gda_proxy.ReadGeojsonMap('/geojson/county_usfacts.geojson'.split('/').slice(-1,)[0], {
      result: arrayBuffer,
  });
}