import { network, ethers } from 'hardhat';
import { AthertonTreasury } from '../typechain/AthertonTreasury';
import { abi as AthertonTreasuryABI } from "../build/contracts/AthertonTreasury.json";
const provider = ethers.providers.getDefaultProvider();

async function main() {

    console.log('');
    console.log(`Network: ${network.name} (${network.config.chainId})`);

    const [ deployer ] = await ethers.getSigners();
    const dao = deployer;
    console.log(`Deploying contracts with the account: ${deployer.address}`);
    console.log(`DAO address: ${dao.address}`);

    // // Deploy ATHER
    const treasuryAddress = '0x1603C5464f7cB317aB8f3856785b541f63f6Fc8C';
    const treasury = new ethers.Contract(treasuryAddress, AthertonTreasuryABI, deployer) as AthertonTreasury;
    const borrower = '0x9E1D355D72e119c833354D348606c8b5D2Fec506';
    await treasury.incurUnsecured(borrower, "1000000000");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})