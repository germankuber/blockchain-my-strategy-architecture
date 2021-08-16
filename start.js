var nrc = require('node-run-cmd');

var options = { cwd: 'c:/'};
nrc.run('brownie console --network mainnet-fork',options);