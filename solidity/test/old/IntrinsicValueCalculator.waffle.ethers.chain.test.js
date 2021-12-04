// // const { utils } = require("ethers").utils;
// const { expect } = require("chai");
// const { ethers, waffle } = require("hardhat");
// // const { waffle } = require("hardhat");
// // const { deployContract } = waffle;
// // const { expectRevert, time, BN } = require('@openzeppelin/test-helpers');
// // const { deployContract, loadFixture } = waffle;

// describe(
//   "Test::IntrinsicValueCalculator",
//   function () {

//     const ONE = 1;
//     const HUNDRED = 100;
//     const THOUSAND = 1000;
//     const MILLION = 1000000;
//     const BILLION = 1000000000;

//     // Wallets
//     let deployer;
//     let treasury;

//     let DAITokenContract;
//     let dai;

//     let AthertonERC20TOkenContract;
//     let ather;

//     // Contracts
//     let OLYIntrinsicCalculatorContract;
//     let oivcalc;

//     beforeEach(
//       async function () {
//         [
//           deployer,
//           treasury
//         ] = await ethers.getSigners();

//         console.log( "Test::IntrinsicValueCalculator::beforeEach:01 Loading DAI." );
//         DAITokenContract = await ethers.getContractFactory("DAI");
//         //Add check for events
//         console.log( "Test::IntrinsicValueCalculator::beforeEach:02 Deploying DAI." );
//         dai = await DAITokenContract.connect( deployer ).deploy( 1 );
//         // await dai.deployed();
//         console.log( "Test::IntrinsicValueCalculator:beforeEach:03 DAI address is %s,", dai.address );

//         console.log( "Test::IntrinsicValueCalculator:beforeEach:04 Loading AthertonERC20Token." );
//         AthertonERC20TOkenContract = await ethers.getContractFactory("AthertonERC20TOken");
        
//         console.log( "Test::IntrinsicValueCalculator::beforeEach:05 Deploying AthertonERC20Token." );
//         ather = await AthertonERC20TOkenContract.connect( deployer ).deploy();
//         // await ather.deployed();
//         console.log( "Test::IntrinsicValueCalculator:beforeEach:03 DAI address is %s,", ather.address );

//         console.log( "Test::IntrinsicValueCalculator::beforeEach:06 Loading IntrinsicPriceCalculator." );
//         IntrinsicValueCalculatorContract = await ethers.getContractFactory("IntrinsicValueCalculator");
        
//         console.log( "Test::IntrinsicValueCalculator::beforeEach:07 Deploying IntrinsicValueCalculator." );
//         ivcalc = await IntrinsicValueCalculatorContract.connect( deployer ).deploy();
//         // await oivcalc.deployed();
//         console.log( "Test::IntrinsicValueCalculator:beforeEach:08 DAI address is %s,", ivcalc.address );
//       }
//     );

//     describe(
//       "OLYIntrinsicCalculatorDeployment",
//       function () {
//         it( 
//           "DeploymentSuccess", 
//           async function() {
//             console.log( "Test::IntrinsicValueCalculator::OLYIntrinsicCalculatorDeployment:DeploymentSuccess:01 Minting 1,000,000 ATHER to treasury." );
//             await ather.connect(deployer).mint( treasury.address, ethers.utils.parseUnits( String( MILLION ), "ether" ) );

//             console.log( "Test::IntrinsicValueCalculator::OLYIntrinsicCalculatorDeployment:DeploymentSuccess:02 Checking tresury ATHER balance." );
//             expect( await ather.balanceOf( treasury.address ) ).to.equal( ethers.utils.parseUnits( String( MILLION ), "ether" ) );
//             // await expect( () => ather.connect(deployer).mint( treasury.address, ethers.utils.parseUnits( String( MILLION ), "ether" ) ) )
//             //   .to.changeTokenBalance( ather, treasury, ethers.utils.parseUnits( String( MILLION ), "ether" ) );
            
//             console.log( "Test::IntrinsicValueCalculator::OLYIntrinsicCalculatorDeployment:DeploymentSuccess:03 Minting 1,000,000 DAI to treasury." );
//             await dai.connect(deployer).mint( treasury.address, ethers.utils.parseUnits( String( MILLION ), "ether" ) );

//             console.log( "Test::IntrinsicValueCalculator::OLYIntrinsicCalculatorDeployment:DeploymentSuccess:04 Checking tresury DAI balance." );
//             expect( await dai.balanceOf( treasury.address ) ).to.equal( ethers.utils.parseUnits( String( MILLION ), "ether" ) );
//             // await expect( () => dai.connect(deployer).mint( treasury.address, ethers.utils.parseUnits( String( MILLION ), "ether" ) ) )
//             //   .to.changeTokenBalance( dai, treasury, ethers.utils.parseUnits( String( MILLION ), "ether" ) );

//             console.log( "Test::IntrinsicValueCalculator::OLYIntrinsicCalculatorDeployment:DeploymentSuccess:05 Checking ATHER Intrinsic Price." );
//             expect( await ivcalc.getIntrinsicValue( ather.address, dai.address, treasury.address) ).to.equal( ONE );
//           }
//         );
//       }
//     );

//     // describe(
//     //   "PreAthertonTokenOwnership",
//     //   function () {
//     //     it( 
//     //       "Minting", 
//     //       async function() {
            
//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirm minting enabled.");
//     //         // expect( await poly.connect( deployer ).allowMinting() )
//     //         //   .to.equal( true );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: buyer1 can't mint.");
//     //         // await expect( poly.connect(buyer1).mint( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith("Ownable: caller is not the owner");
            
//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: buyer1 balanceOf.");
//     //         // expect( await poly.connect(deployer).balanceOf(buyer1.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: only owner can mint.");
//     //         // await expect( () => poly.connect(deployer).mint( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) )
//     //         //   .to.changeTokenBalance( poly, deployer, ethers.utils.parseUnits( String( 1000000000 ), "ether" ) );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: totalSupply.");
//     //         // expect( await poly.totalSupply() )
//     //         //   .to.equal( ethers.utils.parseUnits( String( 2000000000 ), "ether" ) );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: owner balanceOf.");
//     //         // expect( await poly.connect(deployer).balanceOf(deployer.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 2000000000 ), "ether" ) ) );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Disable minting.");
//     //         // await poly.connect( deployer ).disableMinting();
            
//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Disabled minting.");
//     //         // expect( await poly.connect( deployer ).allowMinting() ).to.equal( false );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: owner can't mint.");
//     //         // await expect( poly.connect( deployer ).mint( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Minting has been disabled." );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: totalSupply.");
//     //         // expect( await poly.totalSupply() )
//     //         //   .to.equal( ethers.utils.parseUnits( String( 2000000000 ), "ether" ) );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: owner balanceOf.");
//     //         // expect( await poly.connect(deployer).balanceOf(deployer.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 2000000000 ), "ether" ) ) );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: buyer1 can't mint.");
//     //         // await expect( poly.connect(buyer1).mint(ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Ownable: caller is not the owner" );
            
//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: buyer1 balanceOf.");
//     //         // expect( await poly.connect(deployer).balanceOf(buyer1.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );
//     //       }
//     //     );
//     //   }
//     // );

//     // describe(
//     //   "PreAthertonTokenOwnership",
//     //   function () {

//     //     it( 
//     //       "Post-Deployment Transfer", 
//     //       async function() {

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: owner is approvedSeller.");
//     //         // expect( await poly.isApprovedSeller(deployer.address) ).to.equal( true );
            
//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: poly is approvedSeller.");
//     //         // expect( await poly.isApprovedSeller(poly.address) ).to.equal( true );
            
//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await poly.isApprovedSeller( ethers.constants.AddressZero ) ).to.equal( true );
            
//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await poly.isApprovedSeller( buyer1.address ) ).to.equal( false );
            
//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await poly.isApprovedSeller( buyer2.address ) ).to.equal( false );

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: totalSupply.");
//     //         // expect( await poly.totalSupply() ).to.equal( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) );

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: owner balanceOf.");
//     //         // expect( await poly.connect(deployer).balanceOf(deployer.address) ).to.equal( String( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) );

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: buyer1 balanceOf.");
//     //         // expect( await poly.connect(deployer).balanceOf(buyer1.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: buyer2 balanceOf.");
//     //         // expect( await poly.connect(deployer).balanceOf(buyer2.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );
            
//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: Confirm seller approval required.");
//     //         // expect( await poly.requireSellerApproval() ).to.equal( true );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming buyer1 can't transfer to buyer1 because they have no balance.");
//     //         // await expect( poly.connect(buyer1).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreAthertonTokenOwnershi::Minting: Confirming buyer1 can't transfer to buyer2 because they have no balance.");
//     //         // await expect( poly.connect(buyer1).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming buyer2 can't transfer to buyer1 because they have no balance.");
//     //         // await expect( poly.connect(buyer2).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming buyer2 can't transfer to buyer2 because they have no balance.");
//     //         // await expect( poly.connect(buyer2).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming deployer can transfer to buyer1.");
//     //         // await expect( () => poly.connect(deployer).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.changeTokenBalance( poly, buyer1, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );
            
//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming deployer can transfer to buyer1.");
//     //         // await expect( () => poly.connect(deployer).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.changeTokenBalance( poly, buyer2, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: deployer balanceOf.");
//     //         // expect( await poly.connect(deployer).balanceOf(deployer.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 500000000 ), "ether" ) ) );
              
//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: buyer1 balanceOf.");
//     //         // expect( await poly.connect(buyer1).balanceOf(buyer1.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: buyer2 balanceOf.");
//     //         // expect( await poly.connect(buyer2).balanceOf(buyer2.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );

//     //       }
//     //     );

//     //     it( 
//     //       "Approved Seller Transfer", 
//     //       async function() {

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: owner is approvedSeller.");
//     //         // expect( await poly.isApprovedSeller(deployer.address) ).to.equal( true );
            
//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: poly is approvedSeller.");
//     //         // expect( await poly.isApprovedSeller(poly.address) ).to.equal( true );
            
//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await poly.isApprovedSeller( ethers.constants.AddressZero ) ).to.equal( true );
            
//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await poly.isApprovedSeller( buyer1.address ) ).to.equal( false );
            
//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await poly.isApprovedSeller( buyer2.address ) ).to.equal( false );

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: totalSupply.");
//     //         // expect( await poly.totalSupply() ).to.equal( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) );

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: owner balanceOf.");
//     //         // expect( await poly.connect(deployer).balanceOf(deployer.address) ).to.equal( String( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) );

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: buyer1 balanceOf.");
//     //         // expect( await poly.connect(deployer).balanceOf(buyer1.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: buyer2 balanceOf.");
//     //         // expect( await poly.connect(deployer).balanceOf(buyer2.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: Approve buyer1 to sell.");
//     //         // expect( await poly.connect(deployer).addApprovedSeller(buyer1.address) );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming buyer2 can't transfer to buyer1 because they have no balance.");
//     //         // await expect( poly.connect(buyer2).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming deployer can transfer to buyer1.");
//     //         // await expect( () => poly.connect(deployer).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.changeTokenBalance( poly, buyer1, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );

//     //         //   console.log("Test::PreAthertonTokenOwnership::Minting: Confirming deployer can transfer to buyer1.");
//     //         // await expect( () => poly.connect(buyer1).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.changeTokenBalance( poly, buyer2, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );
//     //       }
//     //     );

//     //     it( 
//     //       "Open Transfer", 
//     //       async function() {

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: owner is approvedSeller.");
//     //         // expect( await poly.isApprovedSeller(deployer.address) ).to.equal( true );
            
//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: poly is approvedSeller.");
//     //         // expect( await poly.isApprovedSeller(poly.address) ).to.equal( true );
            
//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await poly.isApprovedSeller( ethers.constants.AddressZero ) ).to.equal( true );
            
//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await poly.isApprovedSeller( buyer1.address ) ).to.equal( false );
            
//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await poly.isApprovedSeller( buyer2.address ) ).to.equal( false );

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: totalSupply.");
//     //         // expect( await poly.totalSupply() ).to.equal( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) );

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: owner balanceOf.");
//     //         // expect( await poly.connect(deployer).balanceOf(deployer.address) ).to.equal( String( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) );

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: buyer1 balanceOf.");
//     //         // expect( await poly.connect(deployer).balanceOf(buyer1.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: buyer2 balanceOf.");
//     //         // expect( await poly.connect(deployer).balanceOf(buyer2.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );
            
//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: Confirm seller approval required.");
//     //         // expect( await poly.requireSellerApproval() ).to.equal( true );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming buyer1 can't transfer to buyer1 because they have no balance.");
//     //         // await expect( poly.connect(buyer1).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreAthertonTokenOwnershi::Minting: Confirming buyer1 can't transfer to buyer2 because they have no balance.");
//     //         // await expect( poly.connect(buyer1).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming buyer2 can't transfer to buyer1 because they have no balance.");
//     //         // await expect( poly.connect(buyer2).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming buyer2 can't transfer to buyer2 because they have no balance.");
//     //         // await expect( poly.connect(buyer2).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming deployer can transfer to buyer1.");
//     //         // await expect( () => poly.connect(deployer).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.changeTokenBalance( poly, buyer1, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );
            
//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Confirming deployer can transfer to buyer1.");
//     //         // await expect( () => poly.connect(deployer).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.changeTokenBalance( poly, buyer2, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: deployer balanceOf.");
//     //         // expect( await poly.connect(deployer).balanceOf(deployer.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 500000000 ), "ether" ) ) );
              
//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: buyer1 balanceOf.");
//     //         // expect( await poly.connect(buyer1).balanceOf(buyer1.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: buyer2 balanceOf.");
//     //         // expect( await poly.connect(buyer2).balanceOf(buyer2.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: Enable open trading of pOLY.");
//     //         // await poly.connect( deployer ).allowOpenTrading();

            
//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: Confirm seller approval required.");
//     //         // expect( await poly.requireSellerApproval() ).to.equal( false );

//     //         // console.log("Test::PreAthertonTokenOwnership::Minting: only owner can mint.");

//     //         // expect( await poly.connect(buyer1).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );
            
//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: buyer1 balanceOf.");
//     //         // expect( await poly.connect(deployer).balanceOf(buyer1.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//     //         // console.log("Test::PreAthertonTokenDeployment::DeploymentSuccess: buyer2 balanceOf.");
//     //         // expect( await poly.connect(deployer).balanceOf(buyer2.address) ).to.equal( String( ethers.utils.parseUnits( String( 500000000 ), "ether" ) ) );
//     //       }
//     //     );
//     //   }
//     // );
//   }
// );