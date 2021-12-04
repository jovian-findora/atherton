// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./AthertonModels.sol";

// TODO-hightlight :: main logic

contract wsATHER is ERC20 {
    using SafeERC20 for ERC20;
    using Address for address;
    using SafeMath for uint;

    address public immutable staking;
    address public immutable ATHER;
    address public immutable sATHER;

    constructor( address _staking, address _ATHER, address _sATHER ) ERC20( 'Wrapped sATHER', 'wsATHER' ) {
        require( _staking != address(0) );
        staking = _staking;
        require( _ATHER != address(0) );
        ATHER = _ATHER;
        require( _sATHER != address(0) );
        sATHER = _sATHER;
    }

    /**
        @notice stakes ATHER and wraps sATHER
        @param _amount uint
        @return uint
     */
    function wrapFromATHER( uint _amount ) external returns ( uint ) {
        IERC20( ATHER ).transferFrom( msg.sender, address(this), _amount );

        IERC20( ATHER ).approve( staking, _amount ); // stake ATHER for sATHER
        IStaking( staking ).stake( _amount, address(this) );

        uint value = wsATHERValue( _amount );
        _mint( msg.sender, value );
        return value;
    }

    /**
        @notice unwrap sATHER and unstake ATHER
        @param _amount uint
        @return uint
     */
    function unwrapToATHER( uint _amount ) external returns ( uint ) {
        _burn( msg.sender, _amount );
        
        uint value = sATHERValue( _amount );
        IERC20( sATHER ).approve( staking, value ); // unstake sATHER for ATHER
        IStaking( staking ).unstake( value, false );

        IERC20( ATHER ).transfer( msg.sender, value );
        return value;
    }

    /**
        @notice wrap sATHER
        @param _amount uint
        @return uint
     */
    function wrapFromSATHER( uint _amount ) external returns ( uint ) {
        IERC20( sATHER ).transferFrom( msg.sender, address(this), _amount );
        
        uint value = wsATHERValue( _amount );
        _mint( msg.sender, value );
        return value;
    }

    /**
        @notice unwrap sATHER
        @param _amount uint
        @return uint
     */
    function unwrapToSATHER( uint _amount ) external returns ( uint ) {
        _burn( msg.sender, _amount );

        uint value = sATHERValue( _amount );
        IERC20( sATHER ).transfer( msg.sender, value );
        return value;
    }

    /**
        @notice converts wATHER amount to sATHER
        @param _amount uint
        @return uint
     */
    function sATHERValue( uint _amount ) public view returns ( uint ) {
        return _amount.mul( IStaking( staking ).index() ).div( 10 ** decimals() );
    }

    /**
        @notice converts sATHER amount to wATHER
        @param _amount uint
        @return uint
     */
    function wsATHERValue( uint _amount ) public view returns ( uint ) {
        return _amount.mul( 10 ** decimals() ).div( IStaking( staking ).index() );
    }

}