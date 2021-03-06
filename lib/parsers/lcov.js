/**
 * @module lib/parsers/lcov
 */

const fs = require('fs');

function walkFile(str, cb) {
  let data = [];
  let item;

  ['end_of_record'].concat(str.split('\n')).forEach((line) => {
    const allparts = line.trim().split(':');
    const parts = [allparts.shift(), allparts.join(':')];
    let lines, fn;

    switch (parts[0].toUpperCase()) {
      case 'TN':
        item.title = parts[1].trim();
        break;
      case 'SF':
        item.file = parts.slice(1).join(':').trim();
        break;
      case 'FNF':
        item.functions.found = Number(parts[1].trim());
        break;
      case 'FNH':
        item.functions.hit = Number(parts[1].trim());
        break;
      case 'LF':
        item.lines.found = Number(parts[1].trim());
        break;
      case 'LH':
        item.lines.hit = Number(parts[1].trim());
        break;
      case 'DA':
        lines = parts[1].split(',');
        item.lines.details.push({
          line: Number(lines[0]),
          hit: Number(lines[1])
        });
        break;
      case 'FN':
        fn = parts[1].split(',');
        item.functions.details.push({
          name: fn[1],
          line: Number(fn[0])
        });
        break;
      case 'FNDA':
        fn = parts[1].split(',');
        item.functions.details.some((i, k) => {
          if (i.name === fn[1] && i.hit === undefined) {
            item.functions.details[k].hit = Number(fn[0]);
            return true;
          }
        });
        break;
      case 'BRDA':
        fn = parts[1].split(',');
        item.branches.details.push({
          line: Number(fn[0]),
          block: Number(fn[1]),
          branch: Number(fn[2]),
          taken: ((fn[3] === '-') ? 0 : Number(fn[3]))
        });
        break;
      case 'BRF':
        item.branches.found = Number(parts[1]);
        break;
      case 'BRH':
        item.branches.hit = Number(parts[1]);
        break;
    }

    if (line.indexOf('end_of_record') > -1) {
      data.push(item);
      item = {
        lines: {
          found: 0,
          hit: 0,
          details: []
        },
        functions: {
          hit: 0,
          found: 0,
          details: []
        },
        branches: {
          hit: 0,
          found: 0,
          details: []
        }
      };
    }
  });

  data.shift();

  if (data.length) {
    cb(undefined, data);
  } else {
    cb('Failed to parse lcov');
  }
}

/**
 * will clean a lcov string to strip out any unnecessary content
 * @method clean
 * @param  {String} coverage - the coverage string to clean
 * @return {String} - the cleaned version of the coverage string
 */
function clean(coverage) {
  return coverage.substr(coverage.indexOf('TN:'), coverage.lastIndexOf('end_of_record') + 'end_of_record'.length);
}

/**
 * returns a javascript object that represents the coverage data
 * @method parse
 * @param  {String|Path} file - this can either be a string or a path to a file
 * @return {Coverage} - The coverage data structure
 *
 */
function parse(file) {
  return new Promise(function(resolve, reject) {
    if (fs.existsSync(file)) {
      fs.readFile(file, 'utf8', (err, str) => {
        if (err) {
          reject(err);
        }
        return walkFile(clean(str), function(err, result) {
          if (err) return reject(err);
          resolve(result);
        });
      });
    } else {
      return walkFile(clean(file), function(err, result) {
        if (err) return reject(err);
        resolve(result);
      });
    }
  });
}

module.exports = {
  walkFile,
  parse,
  clean
};
