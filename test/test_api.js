const http = require('http');

function check(url, done) {
  http.get(url, (res) => {
    let body = '';
    res.on('data', (c) => (body += c));
    res.on('end', () => {
      console.log('status', res.statusCode, 'for', url);
      console.log(body.slice(0, 400));
      done();
    });
  }).on('error', (err) => {
    console.error('error', err.message);
    done(err);
  });
}

const tests = [
  'http://localhost:3000/api',
  'http://localhost:3000/api/rnc/101123456',
  'http://localhost:3000/api/search?query=Universidad&limit=5'
];

let idx = 0;
function runNext() {
  if (idx >= tests.length) return process.exit(0);
  check(tests[idx++], (err) => {
    if (err) return process.exit(1);
    setTimeout(runNext, 300);
  });
}

runNext();
