// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// TODO-hightlight :: main logic

contract StakingWarmup {

    address public immutable staking;
    address public immutable sATHER;

    constructor ( address _staking, address _sATHER ) {
        require( _staking != address(0) );
        staking = _staking;
        require( _sATHER != address(0) );
        sATHER = _sATHER;
    }

    function retrieve( address _staker, uint _amount ) external {
        require( msg.sender == staking );
        IERC20( sATHER ).transfer( _staker, _amount );
    }
}