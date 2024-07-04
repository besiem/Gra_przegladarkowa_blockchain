const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  ethereumAddress: String,
  privateKey: String,
  level: {
    type: Number,
    default: 1
  },
  cryptocurrency: {
    type: Number,
    default: 0
  },
  minedCryptos: {
    Dogecoin: { type: Number, default: 0 },
    ShibaInu: { type: Number, default: 0 },
    TerraClassic: { type: Number, default: 0 },
    VeChain: { type: Number, default: 0 },
    Stellar: { type: Number, default: 0 },
    Tron: { type: Number, default: 0 },
    Dash: { type: Number, default: 0 },
    Zcash: { type: Number, default: 0 },
    Chainlink: { type: Number, default: 0 },
    Uniswap: { type: Number, default: 0 },
    Litecoin: { type: Number, default: 0 },
    BitcoinCash: { type: Number, default: 0 },
    Cardano: { type: Number, default: 0 },
    Polkadot: { type: Number, default: 0 },
    Solana: { type: Number, default: 0 },
    Avalanche: { type: Number, default: 0 },
    Ethereum: { type: Number, default: 0 },
    BinanceCoin: { type: Number, default: 0 },
    Bitcoin: { type: Number, default: 0 },
    Tether: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
