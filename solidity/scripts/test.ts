import { network, ethers } from 'hardhat'
import { AthertonERC20Token, AthertonTreasury, AthertonUSDToken, TokenEvalutorUniswapV2 } from '../typechain';
const provider = ethers.providers.getDefaultProvider();
const e18 = (v: string) => {
  if (v.indexOf('.') >= 0 || v.indexOf('-') >= 0)  {
    throw new Error('Bad token value, please use integer values');
  }
  return v + '000000000000000000';
};

async function main() {

    console.log('');
    console.log(`Network: ${network.name} (${network.config.chainId})`);

    const [ deployer ] = await ethers.getSigners();
    const dao = deployer;
    console.log(`Deployer: ${deployer.address}`);
    const groundingPair = '0x9c58C78122341A4240462bE6f67Ac0236d575e2a';

    const ATHER = await ethers.getContractFactory('AthertonERC20Token');
    const ather = ATHER.attach('0x1bE23924aF2F42dE270335462764ce4530bEa77c') as AthertonERC20Token;
    console.log( "ATHER: " + ather.address );
    const ATHERUSD = await ethers.getContractFactory('AthertonUSDToken'); 
    const atherUSD = ATHERUSD.attach('0x338C140f0025a9706c965ee1d54B6B00261B8b4D') as AthertonUSDToken;
    console.log( "ATHERUSD: " + atherUSD.address );
    const TEvUniswapV2 = await ethers.getContractFactory('TokenEvalutorUniswapV2');
    const evaluator = TEvUniswapV2.attach('0x8576399754c4e7aeB0EF0D837bB6e96A1746fc22') as TokenEvalutorUniswapV2;
    console.log( "Evaluator: " + evaluator.address );
    const Treasury = await ethers.getContractFactory('AthertonTreasury'); 
    const treasury = Treasury.attach('0x5CeAA8baEa348EBaF4B8D68bb9eA57A087FE9701') as AthertonTreasury;
    console.log( "Treasury: " + treasury.address );

    // await treasury.setFloatingToken( true, ather.address, evaluator.address, groundingPair ); console.log( "Registered ATHER as floating token");
    await treasury.setStableToken( true, atherUSD.address ); console.log( "Registered ATHERUSD as stable token");
    
    // await atherUSD.approve(treasury.address, e18('10000000')); console.log('Treasury approved');
    await treasury.deposit(atherUSD.address, e18('1000000')); console.log('deposited');
    
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})