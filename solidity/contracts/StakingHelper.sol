// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./AthertonModels.sol";

// TODO-hightlight :: main logic

contract StakingHelper {

    address public immutable staking;
    address public immutable ATHER;

    constructor ( address _staking, address _ATHER ) {
        require( _staking != address(0) );
        staking = _staking;
        require( _ATHER != address(0) );
        ATHER = _ATHER;
    }

    function stake( uint _amount ) external {
        IERC20( ATHER ).transferFrom( msg.sender, address(this), _amount );
        IERC20( ATHER ).approve( staking, _amount );
        IStaking( staking ).stake( _amount, msg.sender );
        IStaking( staking ).claim( msg.sender );
    }
}