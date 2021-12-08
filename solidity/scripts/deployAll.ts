import { network, ethers } from 'hardhat';
import {
  AthertonUSDToken,
  AthertonERC20Token,
  AthertonStaking,
  AthertonTreasury,
  TokenEvalutorUniswapV2,
  SAtherton,
} from '../typechain';
const provider = ethers.provider;

// Ethereum 0 address, used when toggling changes in treasury
const zeroAddress = '0x0000000000000000000000000000000000000000';
const settings = {
  reuse: false,
};
const e18 = (v: string) => {
  if (v.indexOf('.') >= 0 || v.indexOf('-') >= 0)  {
    throw new Error('Bad token value, please use integer values');
  }
  return v + '000000000000000000';
};
const contract = async <T>(contractName: string, addr: string, args: any[] = []) => {
  const ContractDef = await ethers.getContractFactory(contractName);
  let contractInst: T ;
  if (!settings.reuse) {
    contractInst = await ContractDef.deploy(...args) as  any;
  } else {
    contractInst = ContractDef.attach(addr) as any;
  }
  return contractInst;
};

async function main() {

    console.log('');
    console.log(`Network: ${network.name} (${network.config.chainId})`);

    const [ deployer ] = await ethers.getSigners();
    const dao = deployer;
    console.log(`Deployer: ${deployer.address}`);
    console.log(`DAO address: ${dao.address}`);

    const currentBlockNumber = await provider.getBlockNumber();
    console.log(`Current block number: ${currentBlockNumber}`);
    console.log('');

    // First block epoch occurs
    const epochLengthInBlocks = 2200;
    const firstEpochBlockEnds = currentBlockNumber + epochLengthInBlocks;
    const initialDistribute = e18('1000');


    // ==========================================================================
    //  Contract creation
    // ==========================================================================

    // const uniswapv2 = '0xbb8d99bfdef77f53d5ee6375ca2895afed520363';
    '0xbb8d99bfdef77f53d5ee6375ca2895afed520363';

    // Ather - AtherUSD grounding lp pair
    const groundingPair = '0x9c58C78122341A4240462bE6f67Ac0236d575e2a';

    // Deploy ATHER
    const ATHER = await ethers.getContractFactory('AthertonERC20Token');
    // const ather = await ATHER.deploy() as AthertonERC20Token;
    const ather = ATHER.attach('0x1bE23924aF2F42dE270335462764ce4530bEa77c') as AthertonERC20Token;
    console.log( "ATHER: " + ather.address );

    // Deploy ATHER
    const ATHERUSD = await ethers.getContractFactory('AthertonUSDToken');
    // const atherUSD = await ATHERUSD.deploy() as AthertonUSDToken;
    const atherUSD = ATHERUSD.attach('0x338C140f0025a9706c965ee1d54B6B00261B8b4D') as AthertonUSDToken;
    console.log( "ATHER-USD: " + atherUSD.address );

    // Deploy sATHER
    const SATHER = await ethers.getContractFactory('sAtherton');
    // const sATHER = await SATHER.deploy() as SAtherton;
    const sATHER = SATHER.attach('0x26944D6EabBCa3F3b13E6e17097c82057B2292a2') as SAtherton;
    console.log( "sATHER: " + sATHER.address );

    const TEvUniswapV2 = await ethers.getContractFactory('TokenEvalutorUniswapV2');
    // const evaluator = await TEvUniswapV2.deploy() as TokenEvalutorUniswapV2;
    const evaluator = TEvUniswapV2.attach('0x8576399754c4e7aeB0EF0D837bB6e96A1746fc22') as TokenEvalutorUniswapV2;
    console.log( "Evaluator: " + evaluator.address );

    // Deploy treasury
    const Treasury = await ethers.getContractFactory('AthertonTreasury'); 
    // const treasury = await Treasury.deploy( ather.address, atherUSD.address, sATHER.address ) as AthertonTreasury;
    const treasury = Treasury.attach('0x5CeAA8baEa348EBaF4B8D68bb9eA57A087FE9701') as AthertonTreasury;
    console.log( "Treasury: " + treasury.address );
    // await ather.setVault(treasury.address); console.log('Treasury set as Vault for ATHER');
    // await atherUSD.setVault(treasury.address); console.log('Treasury set as Vault for ATHER-USD');
    // await sATHER.setVault(treasury.address); console.log('Treasury set as Vault for sAther');

    // Add Ather Pricing Source
    await treasury.setFloatingToken( true, ather.address, evaluator.address, groundingPair ); console.log( "Registered ATHER as floating token");
    await treasury.setStableToken( true, atherUSD.address ); console.log( "Registered ATHERUSD as stable token");

    // Deploy Staking
    const Staking = await ethers.getContractFactory('AthertonStaking');
    const staking = await Staking.deploy( ather.address, sATHER.address, treasury.address, epochLengthInBlocks, firstEpochBlockEnds, initialDistribute ) as AthertonStaking;
    // const staking = Staking.attach('0xa3Cd6D22Fed8990ecDf7E26EdE5D00760708002D') as AthertonStaking;
    console.log( "Staking: " + staking.address );

    // Add default staking contract
    await treasury.setStakingContract(true, staking.address); console.log("Registered staking contract to treasury");
    await treasury.setStakingContract(false, '0xa3Cd6D22Fed8990ecDf7E26EdE5D00760708002D'); console.log("Removed old staking contract");

    // Ather - AtherUSD grounding lp pair
    const v = await evaluator.valuationFloating(ather.address, groundingPair, e18('10'));
    console.log('Valuation of 10 Athers: ', v);
    const v2 = await evaluator.valuationLpToken(groundingPair, e18('10'));
    console.log('Valuation of 10 Athers-AtherUSD LP Token: ', v2);

    // 9112605771316988500 // 763636363636363636
    // ==========================================================================
    //  Hook up all contracts
    // ==========================================================================

    // TEST: Deployer get funds
    // await treasury.incurUnsecured(deployer.address, e18('10000000')); // 10M Ather
    // await treasury.incurUnsecuredUSD(deployer.address, e18('10000000')); // 10M AtherUSD

    // Add default staking contract
    // await treasury.addStakingContract(staking.address);

    process.exit(0);

    // treasury.setAuthority()

    // // queue and toggle AtherUSD as reserve token
    // await treasury.queue('2', atherUSD.address);
    // await treasury.toggle('2', atherUSD.address, zeroAddress);

    // // queue and toggle deployer reserve depositor
    // await treasury.queue('0', deployer.address);
    // await treasury.toggle('0', deployer.address, zeroAddress);

    // // queue and toggle liquidity depositor
    // await treasury.queue('4', deployer.address);
    // await treasury.toggle('4', deployer.address, zeroAddress);

    // Approve staking and staking helper contact to spend deployer's ATHER
    // await ather.approve(staking.address, e18('1000000000'));
    // await ather.approve(stakingHelper.address, e18('1000000000'));

    // await stakingHelper.stake(e18('1000'));

    // ==========================================================================
    //  Initial AtherUSD Bond
    // ==========================================================================

    // // Ather USD bond
    // console.log('Creating AtherUSD bond depository.');
    // const ATHERUSDBond = await ethers.getContractFactory('AthertonBondDepository');
    // const atherUSDBond = await ATHERUSDBond.deploy(dao.address, treasury.address, ather.address, atherUSD.address, zeroAddress) as AthertonBondDepository;
    // // const atherUSDBond = ATHERUSDBond.attach('0xc1c744BDcC5EC4Bb7C289a0CebF9c67aA21a3D08') as AthertonBondDepository;
    // console.log( "AtherUSD Bond: " + atherUSDBond.address );

    // // queue and toggle AtherUSD bond liquidity token
    // console.log('Adding AtherUSD Bond on the approved liquidity asset list');
    // console.log('Setting staking address for this bond');
    // await atherUSDBond.setStaking(staking.address, true);
    // const atherUSDBondTerms = {
    //   bcv: '369', // Control variable
    //   vestingLength: '33110', // Bond vesting length in blocks. 33110 ~ 5 days
    //   minBondPrice: '50000',
    //   maxBondPayout: '5000',
    //   bondFee: '50',
    //   maxBondDebt: '1000000' + '000000000', // 1M ATHER max debt
    //   intialBondDebt: '0',
    // };
    // console.log('Setting bond terms:', atherUSDBondTerms);
    // await atherUSDBond.initializeBondTerms(
    //   atherUSDBondTerms.bcv,
    //   atherUSDBondTerms.vestingLength,
    //   atherUSDBondTerms.minBondPrice,
    //   atherUSDBondTerms.maxBondPayout,
    //   atherUSDBondTerms.bondFee,
    //   atherUSDBondTerms.maxBondDebt,
    //   atherUSDBondTerms.intialBondDebt,
    // );
    // console.log('Approve treasury to use deployer\'s AtherUSD');
    // await atherUSD.approve(treasury.address, e18('1000000000') );
    // console.log('Approve atherUSDBond to use deployer\'s AtherUSD');
    // await atherUSD.approve(atherUSDBond.address, e18('1000000000') );

    // await treasury.deposit(e18('10000'), atherUSD.address, e18('10000'));


    // // Bond Ops

    // // Deposit 1,000,000 AtherUSD to treasury, 600,000 ATHER gets minted to deployer and 8,400,000 are in treasury as excesss reserves
    // await treasury.deposit( e18('1000000'), atherUSD.address, e18('500000') );

    // Bond 1,000 ATHER and Frax in each of their bonds
    // console.log('depositing bond');
    // await atherUSDBond.deposit(e18('10000'), '600000', deployer.address );
    // console.log('depositing bond2');


    // await fraxBond.initializeBondTerms(fraxBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt);

    // // Deposit 9,000,000 DAI to treasury, 600,000 ATHER gets minted to deployer and 8,400,000 are in treasury as excesss reserves
    // await treasury.deposit('9000000' + '000000000000000000', dai.address, '8400000000000000');

    // // Deposit 5,000,000 Frax to treasury, all is profit and goes as excess reserves
    // await treasury.deposit('5000000000000000000000000', frax.address, '5000000000000000');

    // // Stake ATHER through helper
    // await stakingHelper.stake('100000000000');

    // // Bond 1,000 ATHER and Frax in each of their bonds
    // await daiBond.deposit('1000000000000000000000', '60000', deployer.address );
    // await fraxBond.deposit('1000000000000000000000', '60000', deployer.address );
    console.log('');
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})