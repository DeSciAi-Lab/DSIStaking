# DSI Staking dApp

A decentralized application for staking DSI tokens on the Binance Smart Chain Testnet.

## Contract Address

The staking contract is deployed at: `0x7f3da7d22228ED743CF3f346bC59Dc1b6186188d` on BSC Testnet.

## Features

- Connect wallet using Web3Modal
- Stake DSI tokens for different durations
- View all active stakes
- Claim unlocked tokens
- Real-time updates of staking status
- Responsive UI using Chakra UI

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask wallet with BSC Testnet configured

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd staking_webapp
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm start
# or
yarn start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Usage

1. Connect your wallet using the "Connect Wallet" button
2. Ensure you have DSI tokens in your wallet
3. Enter the amount you want to stake
4. Select the staking duration
5. Click "Stake Tokens" to stake your tokens
6. Use "Claim Unlocked Tokens" to claim any tokens that have completed their staking period

## Network Configuration

Make sure to add Binance Smart Chain Testnet to your MetaMask:

- Network Name: BSC Testnet
- RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
- Chain ID: 97
- Currency Symbol: BNB
- Block Explorer URL: https://testnet.bscscan.com
