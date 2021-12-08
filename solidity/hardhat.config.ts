import '@openzeppelin/hardhat-upgrades';
import "@nomiclabs/hardhat-waffle";
import { HardhatUserConfig } from 'hardhat/types';

const accounts = require('./.hardhat.secrets.json');

const config: HardhatUserConfig = {
  defaultNetwork: "Findora Forge",
  networks: {
    "Findora Forge": {
      url: "https://prod-forge.prod.findora.org:8545",
      chainId: 525,
      timeout: 70000,
      accounts: accounts['525'],
    },
  },
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};

export default config;
