// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./util/MathOther.sol";
import "./util/Uniswap.sol";
import "./AthertonModels.sol";


// TODO-hightlight :: main logic

contract AthertonBondCalculator is IBondCalculator {

    using FixedPoint for *;
    using SafeMath for uint;
    using SafeMath for uint112;

    address public immutable ATHER;

    constructor( address _ATHER ) {
        require( _ATHER != address(0) );
        ATHER = _ATHER;
    }

    function getKValue( address _pair ) public view returns( uint k_ ) {
        uint token0 = ERC20( IUniswapV2Pair( _pair ).token0() ).decimals();
        uint token1 = ERC20( IUniswapV2Pair( _pair ).token1() ).decimals();
        uint decimals = token0.add( token1 ).sub( ERC20( _pair ).decimals() );

        (uint reserve0, uint reserve1, ) = IUniswapV2Pair( _pair ).getReserves();
        k_ = reserve0.mul(reserve1).div( 10 ** decimals );
    }

    function getTotalValue( address _pair ) public view returns ( uint _value ) {
        _value = sqrrt(getKValue( _pair )).mul(2);
    }

    function valuation( address _pair, uint amount_ ) external view override returns ( uint _value ) {
        uint totalValue = getTotalValue( _pair );
        uint totalSupply = IUniswapV2Pair( _pair ).totalSupply();

        _value = totalValue.mul( FixedPoint.fraction( amount_, totalSupply ).decode112with18() ).div( 1e18 );
    }

    function markdown( address _pair ) external view override returns ( uint ) {
        ( uint reserve0, uint reserve1, ) = IUniswapV2Pair( _pair ).getReserves();

        uint reserve;
        if ( IUniswapV2Pair( _pair ).token0() == ATHER ) {
            reserve = reserve1;
        } else {
            reserve = reserve0;
        }
        return reserve.mul( 2 * ( 10 ** ERC20( ATHER ).decimals() ) ).div( getTotalValue( _pair ) );
    }

    function sqrrt(uint256 a) public pure returns (uint c) {
        if (a > 3) {
            c = a;
            uint b = a.div(2).add(1);
            while (b < c) {
                c = b;
                b = a.div(b).add(b).div(2);
            }
        } else if (a != 0) {
            c = 1;
        }
    }
}
