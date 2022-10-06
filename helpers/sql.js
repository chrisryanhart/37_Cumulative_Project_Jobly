const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

/* Takes "dataToUpdate" and returns SQL formatted columns and values to be used in a parameterized UPDATE query

* "dataToUpdate" takes data in the format of our companyUpdate.json or userUpdate.json files

* "jsToSql" provides an object of javascript/SQL key/value pairs to convert key names to column names when two or more names are used

*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // extracts keys from columns where a change is needed
  const keys = Object.keys(dataToUpdate);
  console.log(`key length = ${keys}`);
  if (keys.length === 0) throw new BadRequestError("No data");

  console.log('past error handler');
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  // parameterized column values their respective values are returned
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
