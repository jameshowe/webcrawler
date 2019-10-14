module.exports = {
  /**
   * Converts a JS Map to a POJO
   * @param {Map} map
   * @returns {Object} object
   */
  mapToObject(map) {
    const obj = {};
    map.forEach((v,k) => { obj[k] = v });
    return obj;
  }
}