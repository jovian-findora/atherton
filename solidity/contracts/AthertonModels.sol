// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.0;

interface ITreasury {
    struct TreasuryData {
        uint256 totalReserves; // Risk-free value of all assets
        uint256 totalUnsecured; // Total unsecured ATHER (very highly risky)
        uint256 totalUnsecuredUSD; // Total unsecured ATHERUSD (very highly risky)
    }

    function deposit( address _token, uint _amount ) external returns ( uint send_ );
    
    function recordSales( address _recipient, uint _amount, string memory _details) external;
    function recordProfit( address _recipient, uint _amount, string memory _details) external;
    function recordLoss( address _recipient, uint _amount, string memory _details) external;
    function rebaseAccount( address _stakingContract, address _account, uint _amount, bool _isPositive ) external;
    function stake( address _stakingContract, address _account, uint _amount ) external;
    function unstake( address _stakingContract, address _account, uint _amount ) external;
    function setAutoRestake( address _stakingContract, uint16 _autoRestake ) external;
    
    function incurUnsecured( address _borrower, uint _amount ) external;
    function repayUnsecured( address _borrower, uint _amount ) external;
    function repayUnsecuredOnBehalfOf( address _borrower, address _repayer, uint _amount ) external;
    function incurUnsecuredUSD( address _borrower, uint _amount ) external;
    function repayUnsecuredUSD( address _borrower, uint _amount ) external;
    function repayUnsecuredUSDOnBehalfOf( address _borrower, address _repayer, uint _amount ) external;

    function getTotalReserves() external view returns ( uint );
    function getTreasuryData() external view returns ( TreasuryData memory );
    function auditReserves() external;
    function valueOfToken( address _token, uint _amount ) external view returns ( uint value_ );

    enum MANAGING {
      RESERVE_TOKEN,
      RESERVE_DEPOSITOR,
      LIQUIDITY_TOKEN, 
      LIQUIDITY_DEPOSITOR,
      RECORDING_AUTHORITY
    }
    function setAuthority( MANAGING _managing, address _address, bool value ) external;
    function setBondCalulator( address _token, address _calculator ) external;
    function addStakingContract( address stakingContract_ ) external;
    function removeStakingContract( address stakingContract_ ) external;
}

interface IBond {
    function redeem( address _recipient, bool _stake ) external returns ( uint );
    function pendingPayoutFor( address _depositor ) external view returns ( uint pendingPayout_ );
}

interface ITokenEvaluator {
    function valuationFloating( address _token, address _groundingLpPair, uint _amount ) external view returns ( uint );
    function valuationLpToken( address _token, uint _amount ) external view returns ( uint );
    function valuationComplexLpToken( address _token, address _groundingLpPair, uint _amount ) external view returns ( uint );
}

interface IStaking {
    struct StakingController {
        uint16 penaltyStartPercent;   // uint (10000 == 100%)
        uint32 penaltyHalfLife;       // in block count
        uint maxStakingLimit;
        uint rebaseThreshold;
        bool stakingSuspended;
        bool unstakingSuspended;
    }
    struct StakerInfo {
        uint stakedAmount;
        uint earlyUnstakePenalty;
        uint totalHitoricallyStaked;
        uint totalHitoricallyUnstaked;
        uint totalHitoricallyRebased;
        uint32 rebasedLast;
        uint32 stakedLast;
        uint32 unstakedLast;
        uint32 memberSince;
        bool rebasedOnce;
        string[] awards;
    }
    function rebaseAccount( address account ) external;
    function epochCheck() external;
    function stakeEffect( address _account, uint _amount) external;
    function unstakeEffect( address _account, uint _amount) external;
    function stakedBalanceOf(address account) external view;
    function accountInfo(address account) external view returns (StakerInfo memory);
    function stakingConfig() external view returns (StakingController memory);
    function accountExists(address _account) external view returns ( bool );
    function accountRestakePercent(address _account) external view returns ( uint16 );
    function setAutoRestake(address _account, uint16 _value) external;
    function contractBalance() external view returns ( uint );
    function updateDistribute( uint _dividend, bool _isPositive ) external;
    function setConfig(
      uint16 _penaltyStartPercent,
      uint32 _penaltyHalfLife,
      uint _maxStakingLimit,
      uint _rebaseThreshold
    ) external;
    function setStakeSuspension(bool value) external;
    function setUnstakeSuspension(bool value) external;
}

interface IStakingHelper {
    function stake( uint _amount, address _recipient ) external;
}

interface IATHERERC20 {
    function burnFrom(address account_, uint256 amount_) external;
}

interface IsATHER {
    function rebase( uint256 atherProfit_, uint epoch_) external returns (uint256);
    function circulatingSupply() external view returns (uint256);
    function balanceOf(address who) external view returns (uint256);
    function gonsForBalance( uint amount ) external view returns ( uint );
    function balanceForGons( uint gons ) external view returns ( uint );
    function index() external view returns ( uint );
}

interface IWarmup {
    function retrieve( address staker_, uint amount_ ) external;
}

interface IDistributor {
    function distribute() external returns ( bool );
}
