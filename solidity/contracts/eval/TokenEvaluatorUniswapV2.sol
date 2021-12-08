// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../util/MathOther.sol";
import "../lib/UniswapV2.sol";
import "../AthertonModels.sol";


contract TokenEvalutorUniswapV2 is ITokenEvaluator {

    using FixedPoint for *;
    using SafeMath for uint;
    using SafeMath for uint112;

    function valuationFloating( address _token, address _groundingLpPair, uint _amount ) external override view returns ( uint ) {
        (uint r0, uint r1,) = IUniswapV2Pair( _groundingLpPair ).getReserves();
        uint v;
        // Ascertain price base on LP ratio
        if (_token == IUniswapV2Pair( _groundingLpPair ).token0()) {
            v = r1.mul(_amount).div(r0);
        } else {
            v = r0.mul(_amount).div(r1);
        }
        return v;
    }
    function valuationLpToken( address _token, uint _amount ) external override view returns ( uint ) {
        uint totalValue = getTotalValue( _token );
        uint totalSupply = IUniswapV2Pair( _token ).totalSupply();
        return totalValue.mul( FixedPoint.fraction( _amount, totalSupply ).decode112with18() ).div( 1e9 );
    }
    function valuationComplexLpToken( address _token, address _groundingLpPair, uint _amount ) external override view returns ( uint ) {
        // TODO
        return 0;
    }

    function getKValue( address _pair ) public view returns( uint k_ ) {
        uint decimals0 = ERC20( IUniswapV2Pair( _pair ).token0() ).decimals();
        uint decimals1 = ERC20( IUniswapV2Pair( _pair ).token1() ).decimals();
        uint decimals = decimals0.add( decimals1 ).sub( ERC20( _pair ).decimals() );

        (uint reserve0, uint reserve1, ) = IUniswapV2Pair( _pair ).getReserves();
        k_ = reserve0.mul(reserve1).div( 10 ** decimals );
    }

    function getTotalValue( address _pair ) public view returns ( uint _value ) {
        _value = sqrrt(getKValue( _pair )).mul(2);
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
