// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./util/ERC20Permit.sol";
import "./AthertonModels.sol";

// TODO-hightlight :: main logic

contract AthertonStaking is Ownable {

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public immutable ATHER;
    address public immutable sATHER;
    address public DAO;

    struct Epoch {
        uint length;
        uint number;
        uint endBlock;
        uint distribute;
    }
    Epoch public epoch;

    address public distributor;
    
    address public locker;
    uint public totalBonus;
    
    address public warmupContract;
    uint public warmupPeriod;

    uint public forfeitPenalty;
    
    constructor ( 
        address _DAO,
        address _ATHER, 
        address _sATHER, 
        uint _epochLength,
        uint _firstEpochNumber,
        uint _firstEpochBlock
    ) {
        require( _DAO != address(0) );
        DAO = _DAO;
        require( _ATHER != address(0) );
        ATHER = _ATHER;
        require( _sATHER != address(0) );
        sATHER = _sATHER;
        
        epoch = Epoch({
            length: _epochLength,
            number: _firstEpochNumber,
            endBlock: _firstEpochBlock,
            distribute: 0
        });
    }

    struct Claim {
        uint deposit;
        uint gons;
        uint expiry;
        bool lock; // prevents malicious delays
    }
    mapping( address => Claim ) public warmupInfo;

    /**
        @notice stake ATHER to enter warmup
        @param _amount uint
        @return bool
     */
    function stake( uint _amount, address _recipient ) external returns ( bool ) {
        rebase();
        
        IERC20( ATHER ).safeTransferFrom( msg.sender, address(this), _amount );

        Claim memory info = warmupInfo[ _recipient ];
        require( !info.lock, "Deposits for account are locked" );

        warmupInfo[ _recipient ] = Claim ({
            deposit: info.deposit.add( _amount ),
            gons: info.gons.add( IsATHER( sATHER ).gonsForBalance( _amount ) ),
            expiry: epoch.number.add( warmupPeriod ),
            lock: false
        });
        
        IERC20( sATHER ).safeTransfer( warmupContract, _amount );
        return true;
    }

    /**
        @notice retrieve sATHER from warmup
        @param _recipient address
     */
    function claim ( address _recipient ) public {
        Claim memory info = warmupInfo[ _recipient ];
        if ( epoch.number >= info.expiry && info.expiry != 0 ) {
            delete warmupInfo[ _recipient ];
            IWarmup( warmupContract ).retrieve( _recipient, IsATHER( sATHER ).balanceForGons( info.gons ) );
        }
    }

    /**
        @notice forfeit sATHER in warmup and retrieve ATHER
     */
    function forfeit() external {
        Claim memory info = warmupInfo[ msg.sender ];
        delete warmupInfo[ msg.sender ];

        IWarmup( warmupContract ).retrieve( address(this), IsATHER( sATHER ).balanceForGons( info.gons ) );
        if ( forfeitPenalty != 0 ) { // there is penalty for early forfeiture
            uint penalty = info.deposit.mul(forfeitPenalty).div(10000);
            uint returnable = info.deposit.sub(penalty);
            IERC20( ATHER ).safeTransfer( DAO, penalty );
            IERC20( ATHER ).safeTransfer( msg.sender, returnable );
        } else {
            IERC20( ATHER ).safeTransfer( msg.sender, info.deposit );
        }
    }

    /**
        @notice prevent new deposits to address (protection from malicious activity)
     */
    function toggleDepositLock() external {
        warmupInfo[ msg.sender ].lock = !warmupInfo[ msg.sender ].lock;
    }

    /**
        @notice redeem sATHER for ATHER
        @param _amount uint
        @param _trigger bool
     */
    function unstake( uint _amount, bool _trigger ) external {
        if ( _trigger ) {
            rebase();
        }
        IERC20( sATHER ).safeTransferFrom( msg.sender, address(this), _amount );
        IERC20( ATHER ).safeTransfer( msg.sender, _amount );
    }

    /**
        @notice returns the sATHER index, which tracks rebase growth
        @return uint
     */
    function index() public view returns ( uint ) {
        return IsATHER( sATHER ).index();
    }

    /**
        @notice trigger rebase if epoch over
     */
    function rebase() public {
        if( epoch.endBlock <= block.number ) {

            IsATHER( sATHER ).rebase( epoch.distribute, epoch.number );

            epoch.endBlock = epoch.endBlock.add( epoch.length );
            epoch.number++;
            
            if ( distributor != address(0) ) {
                IDistributor( distributor ).distribute();
            }

            uint balance = contractBalance();
            uint staked = IsATHER( sATHER ).circulatingSupply();

            if( balance <= staked ) {
                epoch.distribute = 0;
            } else {
                epoch.distribute = balance.sub( staked );
            }
        }
    }

    /**
        @notice returns contract ATHER holdings, including bonuses provided
        @return uint
     */
    function contractBalance() public view returns ( uint ) {
        return IERC20( ATHER ).balanceOf( address(this) ).add( totalBonus );
    }

    /**
        @notice provide bonus to locked staking contract
        @param _amount uint
     */
    function giveLockBonus( uint _amount ) external {
        require( msg.sender == locker );
        totalBonus = totalBonus.add( _amount );
        IERC20( sATHER ).safeTransfer( locker, _amount );
    }

    /**
        @notice reclaim bonus from locked staking contract
        @param _amount uint
     */
    function returnLockBonus( uint _amount ) external {
        require( msg.sender == locker );
        totalBonus = totalBonus.sub( _amount );
        IERC20( sATHER ).safeTransferFrom( locker, address(this), _amount );
    }

    enum CONTRACTS { DISTRIBUTOR, WARMUP, LOCKER }

    /**
        @notice sets the contract address for LP staking
        @param _contract address
     */
    function setContract( CONTRACTS _contract, address _address ) external onlyOwner() {
        if( _contract == CONTRACTS.DISTRIBUTOR ) { // 0
            distributor = _address;
        } else if ( _contract == CONTRACTS.WARMUP ) { // 1
            require( warmupContract == address( 0 ), "Warmup cannot be set more than once" );
            warmupContract = _address;
        } else if ( _contract == CONTRACTS.LOCKER ) { // 2
            require( locker == address(0), "Locker cannot be set more than once" );
            locker = _address;
        }
    }
    
    /**
     * @notice set warmup period for new stakers
     * @param _warmupPeriod uint
     */
    function setWarmup( uint _warmupPeriod ) external onlyOwner() {
        warmupPeriod = _warmupPeriod;
    }

    /**
     * @notice set warmup period for new stakers
     * @param _penalty uint (10000 == 100%)
     */
    function setForfeitPenalty( uint _penalty ) external onlyOwner() {
        forfeitPenalty = _penalty;
    }

    /* ======= Governance Contingency ======= */
    function setDao(address newDao) external onlyOwner() {
        DAO = newDao;
    }
}