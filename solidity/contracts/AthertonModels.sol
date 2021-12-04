// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.0;

interface ITreasury {
    function deposit( uint _amount, address _token, uint _profit ) external returns ( bool );
    function valueOfToken( address _token, uint _amount ) external view returns ( uint value_ );
    function mintRewards( address _recipient, uint _amount ) external;
}

interface IBond {
    function redeem( address _recipient, bool _stake ) external returns ( uint );
    function pendingPayoutFor( address _depositor ) external view returns ( uint pendingPayout_ );
}

interface IBondCalculator {
    function valuation( address _pair, uint _amount ) external view returns ( uint );
    function markdown( address _pair ) external view returns ( uint );
}

interface IStaking {
    function stake( uint _amount, address _recipient ) external returns ( bool );
    function unstake( uint _amount, bool _trigger ) external;
    function claim( address _recipient ) external;
    function index() external view returns ( uint );
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
