const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Web3 } = require('web3');
const path = require('path');
const User = require('./models/User');

const app = express();
const port = 3000;

app.use(express.json());

const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/c8cb7be98fb04a3a91e9ffd50ae7d71c'));

mongoose.connect('mongodb://127.0.0.1:27017/blockchain_game')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

const secretKey = 'Q4vZ5fz/6BfzAZmzwtrY7dQCWKQpargoMKXWxCLOaQXmk9WiYezCIA';

app.use(express.static(path.join(__dirname, 'frontend')));

const cryptocurrencyValues = {
  Dogecoin: 1.05,
  ShibaInu: 0.10,
  TerraClassic: 0.50,
  VeChain: 1.20,
  Stellar: 0.25,
  Tron: 0.30,
  Dash: 200,
  Zcash: 150,
  Chainlink: 25,
  Uniswap: 30,
  Litecoin: 180,
  BitcoinCash: 600,
  Cardano: 3.50,
  Polkadot: 25,
  Solana: 45,
  Avalanche: 40,
  Ethereum: 3000,
  BinanceCoin: 500,
  Bitcoin: 50000,
  Tether: 1
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Endpoint do rejestracji
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const account = web3.eth.accounts.create();

    const user = new User({
      username,
      password: hashedPassword,
      ethereumAddress: account.address,
      privateKey: account.privateKey,
      level: 1,
      cryptocurrency: 0,
      createdAt: new Date()
    });

    await user.save();
    res.status(201).send('User registered');
  } catch (error) {
    res.status(400).send('Error registering user');
  }
});

// Endpoint do logowania
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('Invalid username or password');
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).send('Invalid username or password');
    }
    const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Endpoint do profilu użytkownika
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(400).send('User not found');
    }

    const minedCryptos = {};
    let totalCryptoValue = 0;

    for (const [crypto, amount] of Object.entries(user.minedCryptos)) {
      const value = amount * cryptocurrencyValues[crypto];
      totalCryptoValue += value;
      minedCryptos[crypto] = {
        amount,
        value
      };
    }

    const profile = {
      username: user.username,
      createdAt: user.createdAt,
      level: user.level,
      cryptocurrency: user.cryptocurrency,
      minedCryptos,
      totalCryptoValue
    };

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).send('Server error');
  }
});


// Endpoint do listy użytkowników
app.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select('username');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Endpoint do mining
app.post('/mine', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });

    if (!user) {
      return res.status(400).send('User not found');
    }

    const { level } = req.body;

    if (level > user.level) {
      return res.status(400).send('Level locked. Complete the required quests to unlock.');
    }

    const cryptos = Object.keys(cryptocurrencyValues).slice((level - 1) * 4, level * 4);
    const crypto = cryptos[Math.floor(Math.random() * cryptos.length)];
    const cryptoValue = cryptocurrencyValues[crypto];

    // Szansa 50% na wydobycie kryptowaluty
    const success = Math.random() < 0.5;

    // Losowy czas wydobycia
    const miningTime = Math.floor(Math.random() * 3000) + 1000;

    setTimeout(async () => {
      if (success) {
        user.cryptocurrency += cryptoValue;
        user.minedCryptos[crypto] += 1;

        let totalValue = 0;
        for (const [crypto, amount] of Object.entries(user.minedCryptos)) {
          totalValue += amount * cryptocurrencyValues[crypto];
        }

        let levelUpMessage = '';
        // Aktualizacja poziomów
        if (user.level === 1 && totalValue >= 10) {
          user.level = 2;
          levelUpMessage = ' Level 2 unlocked!';
        } else if (user.level === 2 && totalValue >= 70) { // 20 from level 1 + 50 from level 2
          user.level = 3;
          levelUpMessage = ' Level 3 unlocked!';
        } else if (user.level === 3 && totalValue >= 370) { // 100 from level 2 + 200 from level 3
          user.level = 4;
          levelUpMessage = ' Level 4 unlocked!';
        } else if (user.level === 4 && totalValue >= 1020) { // 250 from level 3 + 400 from level 4
          user.level = 5;
          levelUpMessage = ' Level 5 unlocked!';
        }

        await user.save();
        return res.status(200).send(`Mining successful! You earned 1 ${crypto}.${levelUpMessage}`);
      } else {
        return res.status(200).send('Mining failed. Try again.');
      }
    }, miningTime);
  } catch (error) {
    res.status(500).send('Server error');
  }
});


// Endpoint do sprawdzania salda
app.get('/balance', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(400).send('User not found');
    }
    res.status(200).json({ balance: user.cryptocurrency });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

async function sendTransaction(fromAddress, privateKey, toAddress, amount) {
  const tx = {
    from: fromAddress,
    to: toAddress,
    value: web3.utils.toWei(amount, 'ether'),
    gas: 21000,
  };

  const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

  return receipt;
}

// Endpoint do wysyłania transakcji
app.post('/send', authenticateToken, async (req, res) => {
  try {
    const { toUsername, amount } = req.body;
    const user = await User.findOne({ username: req.user.username });
    const recipient = await User.findOne({ username: toUsername });

    if (!user || !recipient) {
      return res.status(400).send('User not found');
    }

    if (user.cryptocurrency < amount) {
      return res.status(400).send('Insufficient cryptocurrency');
    }

    user.cryptocurrency -= amount;
    recipient.cryptocurrency += amount;

    await user.save();
    await recipient.save();

    res.status(200).send('Transaction successful');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Endpoint do wysyłania wiadomości
app.post('/message', authenticateToken, async (req, res) => {
  try {
    const { toUsername, content } = req.body;
    const recipient = await User.findOne({ username: toUsername });

    if (!recipient) {
      return res.status(400).send('User not found');
    }

    // Logika do przechowywania wiadomości (możesz dodać model wiadomości)
    res.status(200).send('Message sent');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
