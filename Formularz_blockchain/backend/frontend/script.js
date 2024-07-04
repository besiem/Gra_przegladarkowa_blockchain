let token = '';

document.getElementById('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    alert('User registered successfully');
  } else {
    alert('Failed to register user');
  }
});

document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    const data = await response.json();
    token = data.token;
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('tokenDisplay').textContent = `Token: ${token}`;
    await fetchBalance();
    alert('User logged in successfully');
  } else {
    alert('Failed to log in');
  }
});

document.getElementById('mineForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const response = await fetch('http://localhost:3000/mine', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.text();
  document.getElementById('mineResult').textContent = result;
  await fetchBalance();
});

async function fetchBalance() {
  const response = await fetch('http://localhost:3000/balance', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    document.getElementById('balanceDisplay').textContent = `Balance: ${data.balance} cryptocurrency`;
  } else {
    alert('Failed to fetch balance');
  }
}

import { Network, Alchemy } from 'alchemy-sdk';

const settings = {
  apiKey: "K51AQh504U0L9uyaSCJ2cy_iYP7MpZkn",
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

// get the latest block
const latestBlock = alchemy.core.getBlock("latest").then(console.log);