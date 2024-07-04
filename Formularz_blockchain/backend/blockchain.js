const Web3 = require('web3');
const web3 = new Web3('https://mainnet.infura.io/v3/c8cb7be98fb04a3a91e9ffd50ae7d71c');

const account = web3.eth.accounts.create();
console.log('New Ethereum Account:', account);
