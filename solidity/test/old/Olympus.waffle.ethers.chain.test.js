// // const { utils } = require("ethers").utils;
// const { expect } = require("chai");
// const { ethers, waffle } = require("hardhat");
// // const { waffle } = require("hardhat");
// // const { deployContract } = waffle;
// // const { expectRevert, time, BN } = require('@openzeppelin/test-helpers');
// // const { deployContract, loadFixture } = waffle;

// describe(
//   "AthertonERC20TOken",
//   function () {

//     // Wallets
//     let deployer;
//     let buyer1;
//     let buyer2;

//     let DAITokenContract;
//     let dai;

//     // Contracts
//     let AthertonERC20TOkenContract;
//     let ather;

//     beforeEach(
//       async function () {
//         [
//           deployer,
//           buyer1,
//           buyer2
//         ] = await ethers.getSigners();

//         console.log( "Test::AthertonERC20TOken::beforeEach:01 Loading DAI." );
//         DAITokenContract = await ethers.getContractFactory("DAI");
        
//         console.log( "Test::AthertonERC20TOken::beforeEach:02 Deploying DAI." );
//         dai = await DAITokenContract.connect( deployer ).deploy( 1 );
//         // await dai.deployed();
//         console.log( "Test::PreeAthertonSale:beforeEach:03 DAI address is %s,", dai.address );

//         console.log( "Test::AthertonERC20TOken::beforeEach:04 Loading ATHER." );
//         AthertonERC20TOkenContract = await ethers.getContractFactory("AthertonERC20TOken");
        
//         console.log( "Test::AthertonERC20TOken::beforeEach:02 Deploying ATHER." );
//         ather = await AthertonERC20TOkenContract.connect( deployer ).deploy();
//         // await ather.deployed();

//       }
//     );

//     describe(
//       "Deployment",
//       function () {
//         it( 
//           "Success", 
//           async function() {
//             console.log( "Test::AthertonERC20TOken::Deployment::Success:01 token name." );
//             expect( await ather.name() ).to.equal("Atherton");

//             console.log( "Test::AthertonERC20TOken::Deployment::Success:02 token symbol." );
//             expect( await ather.symbol() ).to.equal("ATHER");

//             console.log( "Test::AthertonERC20TOken::Deployment::Success:03 token decimals." );
//             expect( await ather.decimals() ).to.equal(18);

//             console.log( "Test::AthertonERC20TOken::Deployment::Success:04 owner." );
//             expect( await ather.owner() ).to.equal(deployer.address);

//             console.log( "Test::AthertonERC20TOken::Deployment::Success:05 totalSupply." );
//             expect( await ather.totalSupply() ).to.equal( ethers.utils.parseUnits( String( 0 ), "ether" ) );

//             console.log( "Test::AthertonERC20TOken::Deployment::Success:06 owner balanceOf." );
//             expect( await ather.connect(deployer).balanceOf(deployer.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//             console.log( "Test::AthertonERC20TOken::Deployment::Success:07 buyer1 balanceOf." );
//             expect( await ather.connect(deployer).balanceOf(buyer1.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//             console.log( "Test::AthertonERC20TOken::Deployment::Success:08 buyer2 balanceOf." );
//             expect( await ather.connect(deployer).balanceOf(buyer2.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );
//           }
//         );
//       }
//     );

//     describe(
//       "Ownership",
//       function () {
//         it( 
//           "Minting", 
//           async function() {
//             console.log("Test::AthertonERC20TOken::Ownership::Minting:01 buyer1 can't mint.");
//             await expect( ather.connect(buyer1).mint( buyer1.address, ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) )
//               .to.be.revertedWith("Ownable: caller is not the owner");
            
//             console.log("Test::AthertonERC20TOken::Ownership::Minting:02 buyer1 balanceOf.");
//             expect( await ather.connect(deployer).balanceOf(buyer1.address) )
//               .to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//             console.log("Test::AthertonERC20TOken::Ownership::Minting:03 only owner can mint.");
//             await expect( () => ather.connect(deployer).mint( deployer.address, ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) )
//               .to.changeTokenBalance( ather, deployer, ethers.utils.parseUnits( String( 1000000000 ), "ether" ) );

//             console.log("Test::AthertonERC20TOken::Ownership::Minting:04 totalSupply.");
//             expect( await ather.totalSupply() )
//               .to.equal( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) );
//           }
//         );
//       }
//     );

//     // describe(
//     //   "PreAthertonTokenOwnership",
//     //   function () {

//     //     it( 
//     //       "Post-Deployment Transfer", 
//     //       async function() {

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: owner is approvedSeller.");
//     //         // expect( await ather.isApprovedSeller(deployer.address) ).to.equal( true );
            
//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: ather is approvedSeller.");
//     //         // expect( await ather.isApprovedSeller(ather.address) ).to.equal( true );
            
//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await ather.isApprovedSeller( ethers.constants.AddressZero ) ).to.equal( true );
            
//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await ather.isApprovedSeller( buyer1.address ) ).to.equal( false );
            
//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await ather.isApprovedSeller( buyer2.address ) ).to.equal( false );

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: totalSupply.");
//     //         // expect( await ather.totalSupply() ).to.equal( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) );

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: owner balanceOf.");
//     //         // expect( await ather.connect(deployer).balanceOf(deployer.address) ).to.equal( String( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) );

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: buyer1 balanceOf.");
//     //         // expect( await ather.connect(deployer).balanceOf(buyer1.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: buyer2 balanceOf.");
//     //         // expect( await ather.connect(deployer).balanceOf(buyer2.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );
            
//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: Confirm seller approval required.");
//     //         // expect( await ather.requireSellerApproval() ).to.equal( true );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming buyer1 can't transfer to buyer1 because they have no balance.");
//     //         // await expect( ather.connect(buyer1).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreAthertonTokenOwnershi::Minting: Confirming buyer1 can't transfer to buyer2 because they have no balance.");
//     //         // await expect( ather.connect(buyer1).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming buyer2 can't transfer to buyer1 because they have no balance.");
//     //         // await expect( ather.connect(buyer2).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming buyer2 can't transfer to buyer2 because they have no balance.");
//     //         // await expect( ather.connect(buyer2).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming deployer can transfer to buyer1.");
//     //         // await expect( () => ather.connect(deployer).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.changeTokenBalance( ather, buyer1, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );
            
//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming deployer can transfer to buyer1.");
//     //         // await expect( () => ather.connect(deployer).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.changeTokenBalance( ather, buyer2, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: deployer balanceOf.");
//     //         // expect( await ather.connect(deployer).balanceOf(deployer.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 500000000 ), "ether" ) ) );
              
//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: buyer1 balanceOf.");
//     //         // expect( await ather.connect(buyer1).balanceOf(buyer1.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: buyer2 balanceOf.");
//     //         // expect( await ather.connect(buyer2).balanceOf(buyer2.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );

//     //       }
//     //     );

//     //     it( 
//     //       "Approved Seller Transfer", 
//     //       async function() {

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: owner is approvedSeller.");
//     //         // expect( await ather.isApprovedSeller(deployer.address) ).to.equal( true );
            
//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: ather is approvedSeller.");
//     //         // expect( await ather.isApprovedSeller(ather.address) ).to.equal( true );
            
//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await ather.isApprovedSeller( ethers.constants.AddressZero ) ).to.equal( true );
            
//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await ather.isApprovedSeller( buyer1.address ) ).to.equal( false );
            
//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await ather.isApprovedSeller( buyer2.address ) ).to.equal( false );

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: totalSupply.");
//     //         // expect( await ather.totalSupply() ).to.equal( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) );

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: owner balanceOf.");
//     //         // expect( await ather.connect(deployer).balanceOf(deployer.address) ).to.equal( String( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) );

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: buyer1 balanceOf.");
//     //         // expect( await ather.connect(deployer).balanceOf(buyer1.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: buyer2 balanceOf.");
//     //         // expect( await ather.connect(deployer).balanceOf(buyer2.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: Approve buyer1 to sell.");
//     //         // expect( await ather.connect(deployer).addApprovedSeller(buyer1.address) );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming buyer2 can't transfer to buyer1 because they have no balance.");
//     //         // await expect( ather.connect(buyer2).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming deployer can transfer to buyer1.");
//     //         // await expect( () => ather.connect(deployer).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.changeTokenBalance( ather, buyer1, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );

//     //         //   console.log("Test::PreAthertonTokenOwnership::Minting: Confirming deployer can transfer to buyer1.");
//     //         // await expect( () => ather.connect(buyer1).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.changeTokenBalance( ather, buyer2, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );
//     //       }
//     //     );

//     //     it( 
//     //       "Open Transfer", 
//     //       async function() {

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: owner is approvedSeller.");
//     //         // expect( await ather.isApprovedSeller(deployer.address) ).to.equal( true );
            
//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: ather is approvedSeller.");
//     //         // expect( await ather.isApprovedSeller(ather.address) ).to.equal( true );
            
//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await ather.isApprovedSeller( ethers.constants.AddressZero ) ).to.equal( true );
            
//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await ather.isApprovedSeller( buyer1.address ) ).to.equal( false );
            
//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await ather.isApprovedSeller( buyer2.address ) ).to.equal( false );

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: totalSupply.");
//     //         // expect( await ather.totalSupply() ).to.equal( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) );

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: owner balanceOf.");
//     //         // expect( await ather.connect(deployer).balanceOf(deployer.address) ).to.equal( String( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) );

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: buyer1 balanceOf.");
//     //         // expect( await ather.connect(deployer).balanceOf(buyer1.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: buyer2 balanceOf.");
//     //         // expect( await ather.connect(deployer).balanceOf(buyer2.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );
            
//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: Confirm seller approval required.");
//     //         // expect( await ather.requireSellerApproval() ).to.equal( true );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming buyer1 can't transfer to buyer1 because they have no balance.");
//     //         // await expect( ather.connect(buyer1).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreAthertonTokenOwnershi::Minting: Confirming buyer1 can't transfer to buyer2 because they have no balance.");
//     //         // await expect( ather.connect(buyer1).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming buyer2 can't transfer to buyer1 because they have no balance.");
//     //         // await expect( ather.connect(buyer2).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming buyer2 can't transfer to buyer2 because they have no balance.");
//     //         // await expect( ather.connect(buyer2).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming deployer can transfer to buyer1.");
//     //         // await expect( () => ather.connect(deployer).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.changeTokenBalance( ather, buyer1, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );
            
//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming deployer can transfer to buyer1.");
//     //         // await expect( () => ather.connect(deployer).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.changeTokenBalance( ather, buyer2, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: deployer balanceOf.");
//     //         // expect( await ather.connect(deployer).balanceOf(deployer.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 500000000 ), "ether" ) ) );
              
//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: buyer1 balanceOf.");
//     //         // expect( await ather.connect(buyer1).balanceOf(buyer1.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: buyer2 balanceOf.");
//     //         // expect( await ather.connect(buyer2).balanceOf(buyer2.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Enable open trading of pOLY.");
//     //         // await ather.connect( deployer ).allowOpenTrading();

            
//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: Confirm seller approval required.");
//     //         // expect( await ather.requireSellerApproval() ).to.equal( false );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: only owner can mint.");

//     //         // expect( await ather.connect(buyer1).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );
            
//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: buyer1 balanceOf.");
//     //         // expect( await ather.connect(deployer).balanceOf(buyer1.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//     //         // console.log("Test::AthertonERC20TOkenDeployment::DeploymentSuccess: buyer2 balanceOf.");
//     //         // expect( await ather.connect(deployer).balanceOf(buyer2.address) ).to.equal( String( ethers.utils.parseUnits( String( 500000000 ), "ether" ) ) );
//     //       }
//     //     );
//     //   }
//     // );
//   }
// );