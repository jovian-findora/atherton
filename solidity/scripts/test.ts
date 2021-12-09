import { network, ethers } from 'hardhat'
import { AthertonERC20Token, AthertonTreasury, AthertonUSDToken, MockUSDT, MockWETH, TokenEvalutorUniswapV2 } from '../typechain';
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
    const groundingPair = '0x4eb169da21ace2E7Ed5Da2e41319B09d51e6E4d7';

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

    // Deploy USDT
    // const USDT = await ethers.getContractFactory('MockUSDT');
    // // const usdt = await USDT.deploy() as MockUSDT;
    // const usdt = USDT.attach('0xCA8cd6cfeC163c0d57127e7eCAC1E2E13463F69B') as MockUSDT;
    // console.log( "USDT: " + usdt.address );
    // await usdt.mint( deployer.address, e18('1000000000'));

    // // Deploy wETH
    // const WETH = await ethers.getContractFactory('MockWETH');
    // // const weth = await WETH.deploy() as MockWETH;
    // const weth = WETH.attach('0x5fA4cCe6a02Edf559EdC799021c35CfAC27ad0a8') as MockWETH;
    // console.log( "WETH: " + weth.address );
    // await weth.mint( deployer.address, e18('1000000000'));

    await treasury.setFloatingToken( true, ather.address, evaluator.address, groundingPair ); console.log( "Registered ATHER as floating token");

    // await treasury.setFloatingToken( true, ather.address, evaluator.address, groundingPair ); console.log( "Registered ATHER as floating token");
    // await treasury.setStableToken( true, atherUSD.address ); console.log( "Registered ATHERUSD as stable token");
    
    // await atherUSD.approve(treasury.address, e18('10000000')); console.log('Treasury approved');
    // await treasury.deposit(atherUSD.address, e18('1000000')); console.log('deposited');
    // await treasury.incurUnsecuredUSD('0x104D0e74cCC05C8d78d07D324E6613650c4DA225', e18('1000000'));
    
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})