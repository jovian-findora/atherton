import { network, ethers } from 'hardhat';
const provider = ethers.provider;

async function main() {

    console.log('');
    console.log(`Network: ${network.name} (${network.config.chainId})`);

    const [ deployer ] = await ethers.getSigners();
    const dao = deployer;
    console.log(`Deploying contracts with the account: ${deployer.address}`);
    console.log(`DAO address: ${dao.address}`);

    const currentBlockNumber = await provider.getBlockNumber();
    console.log(`Current block number: ${currentBlockNumber}`);

    // Initial staking index
    // const initialIndex = '7675210820';

    // First block epoch occurs
    const firstEpochBlock = currentBlockNumber + '';

    // What epoch will be first epoch
    const firstEpochNumber = '1';

    // How many blocks are in each epoch
    const epochLengthInBlocks = '2200';

    // // Initial reward rate for epoch
    // const initialRewardRate = '3000';

    // // Ethereum 0 address, used when toggling changes in treasury
    // const zeroAddress = '0x0000000000000000000000000000000000000000';

    // // Large number for approval for Frax and DAI
    // const largeApproval = '100000000000000000000000000000000';

    // // Initial mint for Frax and DAI (10,000,000)
    // const initialMint = '10000000000000000000000000';

    // // DAI bond BCV
    // const daiBondBCV = '369';

    // // Frax bond BCV
    // const fraxBondBCV = '690';

    // // Bond vesting length in blocks. 33110 ~ 5 days
    // const bondVestingLength = '33110';

    // // Min bond price
    // const minBondPrice = '50000';

    // // Max bond payout
    // const maxBondPayout = '50'

    // // DAO fee for bond
    // const bondFee = '10000';

    // // Max debt bond can take on
    // const maxBondDebt = '1000000000000000';

    // // Initial Bond debt
    // const intialBondDebt = '0'









    // // Deploy ATHER
    // const ATHER = await ethers.getContractFactory('AthertonERC20Token');
    // const ather = await ATHER.deploy();
    // console.log( "ATHER: " + ather.address );

    // // Deploy sATHER
    // const SATHER = await ethers.getContractFactory('sAtherton');
    // const sATHER = await SATHER.deploy();
    // console.log( "sATHER: " + sATHER.address );

    // // Deploy treasury
    // const Treasury = await ethers.getContractFactory('AthertonTreasury'); 
    // const treasury = await Treasury.deploy( dao.address, ather.address, 0 );
    // console.log( "Treasury: " + treasury.address );

    // // Set treasury for ATHER token
    // await ather.setVault(treasury.address);

    // // Deploy Staking
    // const Staking = await ethers.getContractFactory('AthertonStaking');
    // const staking = await Staking.deploy( dao.address, ather.address, sATHER.address, epochLengthInBlocks, firstEpochNumber, firstEpochBlock );
    // console.log( "Staking: " + staking.address );

    // // Deploy wrapped staked ather
    // const WSATHER = await ethers.getContractFactory('wsATHER');
    // const wsATHER = await WSATHER.deploy(staking.address, ather.address, sATHER.address);
    // console.log( "wsATHER: " + wsATHER.address );

    // // Deploy staking warmup
    // const StakingWarmpup = await ethers.getContractFactory('StakingWarmup');
    // const stakingWarmup = await StakingWarmpup.deploy(staking.address, sATHER.address);
    // console.log( "Staking Warmup " + stakingWarmup.address);

    // // Deploy staking helper
    // const StakingHelper = await ethers.getContractFactory('StakingHelper');
    // const stakingHelper = await StakingHelper.deploy(staking.address, ather.address);
    // console.log( "Staking Helper " + stakingHelper.address);

    // // Deploy staking distributor
    // const Distributor = await ethers.getContractFactory('StakingDistributor');
    // const distributor = await Distributor.deploy(treasury.address, ather.address, epochLengthInBlocks, firstEpochBlock);
    // console.log( "Distributor " + distributor.address);

    // // Deploy bonding calc
    // const AthertonBondingCalculator = await ethers.getContractFactory('AthertonBondCalculator');
    // const athertonBondingCalculator = await AthertonBondingCalculator.deploy( ather.address );
    // console.log( "Bond Calculator: " + athertonBondingCalculator.address );

    // // Redeem Helper
    // const RedeemHelper = await ethers.getContractFactory('RedeemHelper');
    // const redeemHelper = await RedeemHelper.deploy();
    // console.log( "Redeem Helper: " + redeemHelper.address );





    // // Deploy DAI bond
    // //@dev changed function call to Treasury of 'valueOfToken' to 'valueOfTokenToken' in BondDepository due to change in Treausry contract
    // const DAIBond = await ethers.getContractFactory('AthertonBondDepository');
    // const daiBond = await DAIBond.deploy(ather.address, dai.address, treasury.address, dao.address, zeroAddress);

    // // Deploy Frax bond
    // //@dev changed function call to Treasury of 'valueOfToken' to 'valueOfTokenToken' in BondDepository due to change in Treausry contract
    // const FraxBond = await ethers.getContractFactory('MockAthertonBondDepository');
    // const fraxBond = await FraxBond.deploy(ather.address, frax.address, treasury.address, dao.address, zeroAddress);

    // // queue and toggle DAI and Frax bond reserve depositor
    // await treasury.queue('0', daiBond.address);
    // await treasury.queue('0', fraxBond.address);
    // await treasury.toggle('0', daiBond.address, zeroAddress);
    // await treasury.toggle('0', fraxBond.address, zeroAddress);

    // // Set DAI and Frax bond terms
    // await daiBond.initializeBondTerms(daiBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt);
    // await fraxBond.initializeBondTerms(fraxBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt);

    // // Set staking for DAI and Frax bond
    // await daiBond.setStaking(staking.address, stakingHelper.address);
    // await fraxBond.setStaking(staking.address, stakingHelper.address);

    // // Initialize sATHER and set the index
    // await sATHER.initialize(staking.address);
    // await sATHER.setIndex(initialIndex);

    // // set distributor contract and warmup contract
    // await staking.setContract('0', distributor.address);
    // await staking.setContract('1', stakingWarmup.address);

    // // Set treasury for ATHER token
    // await ather.setVault(treasury.address);

    // // Add staking contract as distributor recipient
    // await distributor.addRecipient(staking.address, initialRewardRate);

    // // queue and toggle reward manager
    // await treasury.queue('8', distributor.address);
    // await treasury.toggle('8', distributor.address, zeroAddress);

    // // queue and toggle deployer reserve depositor
    // await treasury.queue('0', deployer.address);
    // await treasury.toggle('0', deployer.address, zeroAddress);

    // // queue and toggle liquidity depositor
    // await treasury.queue('4', deployer.address, );
    // await treasury.toggle('4', deployer.address, zeroAddress);

    // // Approve the treasury to spend DAI and Frax
    // await dai.approve(treasury.address, largeApproval );
    // await frax.approve(treasury.address, largeApproval );

    // // Approve dai and frax bonds to spend deployer's DAI and Frax
    // await dai.approve(daiBond.address, largeApproval );
    // await frax.approve(fraxBond.address, largeApproval );

    // // Approve staking and staking helper contact to spend deployer's ATHER
    // await ather.approve(staking.address, largeApproval);
    // await ather.approve(stakingHelper.address, largeApproval);

    // // Deposit 9,000,000 DAI to treasury, 600,000 ATHER gets minted to deployer and 8,400,000 are in treasury as excesss reserves
    // await treasury.deposit('9000000000000000000000000', dai.address, '8400000000000000');

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