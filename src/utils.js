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
  },

  /**
   * Extracts keys from a Map instance and sorts alphabetically 
   * @param {Map} map
   * @returns Array of string
   */
  sortMapKeys(map) {
    const keys = Array.from(map.keys());
    keys.sort();
    return keys;
  }
}