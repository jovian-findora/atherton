// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./util/ERC20Permit.sol";
import "./util/ERC20Mintable.sol";
import "./AthertonModels.sol";

contract AthertonStaking is Ownable {

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    modifier onlyTreasury() { require( msg.sender == treasury, "Not from treasury" ); _; }

    address public immutable ATHER;
    address public immutable SATHER;
    address public immutable treasury;

    event StakeRebased(
        uint epoch,
        uint index,
        uint rebaseAmount,
        bool rebaseNegative,
        uint balanceBeforeRebase,
        uint multiplier
    );

    struct Rebase {
        uint epoch;
        uint index;
        uint rebaseAmount;
        bool rebaseNegative;
        uint balanceBeforeRebase;
        uint multiplier;
        uint blockNumber;
    }
    Rebase[] public rebases;

    struct Epoch {
        uint length;
        uint number;
        uint endBlock;
        uint distribute;
        bool distributeNegative;
    }
    Epoch public epoch;

    struct StakingController {
        uint16 penaltyStartPercent;   // uint (10000 == 100%)
        uint16 penaltyHalfLife;       // in block count
        uint16 penaltyIgnoreAfter;
        uint maxStakingLimit;
        uint rebaseThreshold;
        bool stakingSuspended;
        bool unstakingSuspended;
        bool penaltySuspended;
    }
    StakingController control;

    struct StakerInfo {
        uint stakedAmount;
        uint earlyUnstakePenalty;
        uint totalHitoricallyStaked;
        uint totalHitoricallyUnstaked;
        uint totalHitoricallyRebased;
        uint16 autoRestakePercent;
        uint32 rebasedLast;
        uint32 stakedLast;
        uint32 unstakedLast;
        uint32 memberSince;
        bool rebasedOnce;
        string[] awards;
    }
    mapping( address => StakerInfo ) public stakerInfo;
    
    constructor ( 
        address _ATHER, 
        address _SATHER,
        address _treasury,
        uint _epochLength,
        uint _firstEpochEnds,
        uint _initialDistribute
    ) {
        require( _ATHER != address(0) );
        ATHER = _ATHER;
        require( _SATHER != address(0) );
        SATHER = _SATHER;
        require( _treasury != address(0) );
        treasury = _treasury;
        
        epoch = Epoch({
            number: 0,
            length: _epochLength,
            endBlock: _firstEpochEnds,
            distribute: _initialDistribute,
            distributeNegative: false
        });

        uint maxStakingLimitInMillions = 100;
        uint rebaseThresholdInWholeAther = 1;

        control = StakingController({
            penaltyStartPercent: 5000, // 50%
            penaltyHalfLife: 5760, // ~ 1 day
            penaltyIgnoreAfter: 5760 * 7, // ~ 10 days
            maxStakingLimit: maxStakingLimitInMillions.mul(1e6).mul(1e18), // 100 M
            rebaseThreshold: rebaseThresholdInWholeAther.mul(1e18), // minimum 100 Ather profit needed for rebase
            stakingSuspended: false,
            unstakingSuspended: false,
            penaltySuspended: false
        });

        IERC20( _ATHER ).approve( _treasury, type(uint).max );
        IERC20( _SATHER ).approve( _treasury, type(uint).max );
    }

    /**
        @notice trigger rebase if epoch over
     */
    function epochCheck() public {
        if ( epoch.endBlock > block.number ) {
            return;
        }
        if (epoch.distribute >= control.rebaseThreshold) {
            rebase();
        }
        epoch.endBlock = epoch.endBlock.add( epoch.length );
        epoch.number++;
    }

    function rebase() private {
        if (epoch.distribute < control.rebaseThreshold) {
            return;
        }
        uint balance = contractBalance();
        uint rebaseIndex = rebases.length;
        uint multiplier = ! epoch.distributeNegative ? 
                            balance.add(epoch.distribute).mul(1e18).div(balance)
                          : balance.sub(epoch.distribute).mul(1e18).div(balance);

        rebases.push( Rebase ( {
            epoch: epoch.number,
            index: rebaseIndex,
            rebaseAmount: epoch.distribute,
            rebaseNegative: epoch.distributeNegative,
            balanceBeforeRebase: balance,
            multiplier: multiplier,
            blockNumber: block.number
        }));

        emit StakeRebased(
            epoch.number,
            rebaseIndex,
            epoch.distribute,
            epoch.distributeNegative,
            balance,
            multiplier
        );

        epoch.distribute = 0;
    }

    function rebaseAccount( address _account ) public {
        if (!accountExists(_account)) {
            return;
        }
        StakerInfo memory info = stakerInfo[_account];
        uint amount = stakedBalanceOf(_account);
        if (amount == info.stakedAmount) { // no effective change
            return;
        }
        uint delta = 0;
        if (amount > info.stakedAmount) {
            delta = amount - info.stakedAmount;
            ITreasury( treasury ).rebaseAccount( address(this), _account, delta, true);
            stakerInfo[_account].totalHitoricallyRebased.add(delta);
        } else {
            delta = info.stakedAmount - amount;
            ITreasury( treasury ).rebaseAccount( address(this), _account, delta, false);
            stakerInfo[_account].totalHitoricallyRebased.sub(delta);
        }
        stakerInfo[_account].stakedAmount = amount;
        stakerInfo[_account].rebasedLast = uint32(rebases.length - 1);
    }

    /**
        @notice stake ATHER to enter warmup
        @param _account uint
     */
    function stakeEffect( address _account, uint _amount ) public onlyTreasury() {
        if (stakerInfo[_account].memberSince == 0) {
            stakerInfo[_account] = StakerInfo({
              stakedAmount: 0,
              earlyUnstakePenalty: 0,
              totalHitoricallyStaked: 0,
              totalHitoricallyUnstaked: 0,
              totalHitoricallyRebased: 0,
              autoRestakePercent: 0,
              rebasedLast: 0,
              stakedLast: 0,
              unstakedLast: 0,
              memberSince: uint32(block.number),
              rebasedOnce: false,
              awards: new string[](0)
            });
        }
        rebaseAccount(_account);
        stakerInfo[_account].totalHitoricallyStaked = stakerInfo[_account].totalHitoricallyStaked.add(_amount);
        stakerInfo[_account].stakedLast = uint32(block.number);
    }

    /**
        @notice redeem sATHER for ATHER
        @param _account uint
     */
    function unstakeEffect( address _account, uint _amount ) public onlyTreasury() {
        rebaseAccount(_account);
        stakerInfo[_account].totalHitoricallyUnstaked = stakerInfo[_account].totalHitoricallyUnstaked.add(_amount); 
        stakerInfo[_account].unstakedLast = uint32(block.number);
    }

    function updateDistribute( uint _dividend, bool _isPositive ) public onlyTreasury() {
        if ( _isPositive ) {
            epoch.distribute = epoch.distribute.add(_dividend);
        } else {
            // TODO
        }
    }

    function setAutoRestake( address _account, uint16 _value ) public onlyTreasury() {
        if ( _value == 0) { // ignore setting flag
            return;
        }
        if ( _value == type(uint16).max ) { // disable flag
            _value = 0;
        }
        if ( _value > 10000 ) { // cannot exceed 100%
            _value = 10000;
        }
        stakerInfo[ _account ].autoRestakePercent = _value;
    }

    function stakedBalanceOf(address account) public view returns ( uint ) {
        StakerInfo memory info = stakerInfo[account];
        if (info.memberSince == 0) {
            return 0;
        }
        uint amount = info.stakedAmount;
        uint32 startIndex = info.rebasedOnce ? 0 : info.rebasedLast + 1;
        for ( uint32 i = startIndex; i < rebases.length; i++ ) {
            amount = amount.mul(rebases[i].multiplier).div(1e18);
        }
        return amount;
    }

    function earlyUnstakePenaltyOf(address _account) public view returns ( uint ) {
        StakerInfo memory info = stakerInfo[_account];
        if (info.memberSince == 0 || info.earlyUnstakePenalty == 0 || control.penaltySuspended) {
            return 0;
        }
        uint32 elapsed = uint32(block.number) - info.stakedLast;
        if ( elapsed >= control.penaltyIgnoreAfter ) {
            return 0;
        }
        // Approximate halflife
        uint penalty = info.earlyUnstakePenalty >> (elapsed / control.penaltyHalfLife);
        penalty -= penalty * (elapsed % control.penaltyHalfLife) / control.penaltyHalfLife / 2;
        return penalty;
    }

    function accountRestakePercent(address account) public view returns (uint16) {
        return stakerInfo[account].autoRestakePercent;
    }

    function accountExists(address _account) public view returns ( bool ) {
        return stakerInfo[_account].memberSince > 0;
    }

    function accountInfo(address account) public view returns (StakerInfo memory) {
        return stakerInfo[account];
    }

    function stakingConfig() public view returns (StakingController memory) {
        return control;
    }

    /**
        @notice returns contract ATHER holdings, including bonuses provided
        @return uint
     */
    function contractBalance() public view returns ( uint ) {
        return IERC20( ATHER ).balanceOf( address(this) );
    }
    
    /**
     * @notice set warmup period for new stakers
     * @param _penaltyStartPercent uint16 (10000 == 100%)
     * @param _penaltyHalfLife uint32 (10000 == 100%)
     */
    function setControls(
      uint16 _penaltyStartPercent,
      uint16 _penaltyHalfLife,
      uint16 _penaltyIgnoreAfter,
      uint _maxStakingLimit,
      uint _rebaseThreshold
    ) external onlyOwner() {
        if (_penaltyStartPercent > 0) { control.penaltyStartPercent = _penaltyStartPercent; }
        if (_penaltyHalfLife > 0) { control.penaltyHalfLife = _penaltyHalfLife; }
        if (_penaltyIgnoreAfter > 0) { control.penaltyIgnoreAfter = _penaltyIgnoreAfter; }
        if (_maxStakingLimit > 0) { control.maxStakingLimit = _maxStakingLimit; }
        if (_rebaseThreshold > 0) { control.rebaseThreshold = _rebaseThreshold; }
    }

    // Override epoch end, and rebase staking right away
    function fastForward() external onlyOwner() {
        epoch.endBlock = block.number + 1;
        epochCheck();
    }

    function setStakeSuspension(bool _value) external onlyOwner() {
        control.stakingSuspended = _value;
    }

    function setUnstakeSuspension(bool _value) external onlyOwner() {
        control.stakingSuspended = _value;
    }

    function setEarlyUnstakePenalty(bool _value) external onlyOwner() {
        control.penaltySuspended = _value;
    }

    function forgiveEarlyUnstakePenalty(address _account) external onlyOwner() {
        require( accountExists(_account), "Account does not exist");
        stakerInfo[_account].earlyUnstakePenalty = 0;
    }

}