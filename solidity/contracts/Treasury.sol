// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./util/ERC20Mintable.sol";
import "./AthertonModels.sol";
import "./lp/LPInterface.sol";



contract AthertonTreasury is Ownable {

    using SafeMath for uint;
    using SafeERC20 for IERC20;

    modifier onlyAuthority() { require( isRecordAuthority[msg.sender], "Not authorized" ); _; }
    modifier onlyDirectDepositor() { require( isDirectDepositor[ msg.sender ], "Not an authorized depositor" ); _; }
    modifier isAccepted(address _token) {
        require( isStableToken[ _token ] || isFloatingToken[ _token ] || isLpToken[ _token ], "Not accepted" ); _;
    }
    modifier fromStaking() { require( isStakingContract[ msg.sender ], "Not from a staking contract" ); _; }
    modifier isStaker(address _stakingContract, address _account) {
        require( isStakingContract[ _stakingContract ], "Not a staking contract" );
        require( IStaking(_stakingContract).accountExists(_account), "Not a staker on this staking contract" );
        _;
    }

    struct TreasuryOwnedErc20 {
        address token;
        uint balance;
        uint value;
    }

    struct TreasuryOwnedErc721 {
        address token;
        uint value;
    }

    event StakingContractUpdated( address indexed stakingContract,  bool value );
    event AthertonProfit( address indexed token, uint amount, uint usdValue, uint atherAmount, string details);
    event AthertonLoss( address indexed token, uint amount, uint usdValue, uint atherAmount, string details);
    event DividendPaid( address indexed recipient, uint atherAmount, uint usdValue);
    event DirectDeposit( address indexed token, uint amount, uint usdValue, uint atherAmount );
    event BondCalulatorChange (address indexed token, address calulator);
    event ReservesUpdated( uint indexed totalReserves, TreasuryOwnedErc20[] );
    event ReservesUpdatedErc721( uint indexed totalReserves, address indexed collectionAddress, uint tokenId, bool added, uint estValue);
    event AuthorityChange( address target, bool value);
    event DirectDepositorChange( address target, bool value);
    event IncurUnsecured( address indexed token, address indexed borrower, uint amount, uint balance );
    event RepayUnsecured( address indexed token, address indexed borrower, uint amount, uint balance );
    event IncurUnsecuredUSD( address indexed token, address indexed borrower, uint amount, uint balance );
    event RepayUnsecuredUSD( address indexed token, address indexed borrower, uint amount, uint balance );

    address public immutable ATHER;
    address public immutable ATHERUSD;
    address public immutable SATHER;

    struct TreasuryData {
        uint256 totalReserves; // value of all assets
        uint256 totalReservesHard; // Risk-free value of all assets
        uint256 totalReservesSoft; // Risk-free value of all assets
        uint totalProfit;
        uint totalProfitHard;
        uint totalProfitSoft;
        uint totalLoss;
        uint totalLossHard;
        uint totalLossSoft;
        uint256 totalUnsecured; // Total unsecured ATHER (very highly risky)
        uint256 totalUnsecuredUSD; // Total unsecured ATHERUSD (very highly risky)
    }
    TreasuryData data;

    struct TreasuryController {
        uint32 reserveUpdateLast;
        uint32 reserveUpdateInterval;
        uint8 directDepositPublic;
    }
    TreasuryController control;

    TreasuryOwnedErc20[] public erc20Assets;
    mapping( address => TreasuryOwnedErc721 ) public erc721Assets; // collectionAddress => tokenData

    mapping( address => bool ) public isStableToken; // Stable USD pegged
    mapping( address => bool ) public isFloatingToken; // Floating
    mapping( address => bool ) public isLpToken; // mostly Floating/Stable LP Token (e.g. wETH/USDT)
    mapping( address => bool ) public isComplexLpToken;  // Floating/Floating LP Token (e.g. wETH/wBTC)

    mapping( address => bool ) public isStakingContract;
    mapping( address => bool ) public isBondingContract;

    mapping( address => bool ) public isDirectDepositor;
    mapping( address => bool ) public isRecordAuthority; // Able to modify ATHER/SATHER circulation

    mapping( address => uint ) public unsecuredLoans; // No-collateral loans (very highly risky)
    mapping( address => uint ) public unsecuredLoansUSD; // No-collateral USD loans (very highly risky)

    struct TokenEvaluator { address addr; address pair; }
    mapping( address => TokenEvaluator ) public evaluator; // value calculator for floating & lp tokens

    struct ProfitShare { address addr; uint8 kind; uint16 percent; } // kind (0=staking, 1=bonding)
    mapping( address => ProfitShare ) public profitShare;

    address[] stableTokens;
    address[] floatingTokens;
    address[] lpTokens;
    address[] stakingContracts;
    address[] bondingContracts;

    constructor (
        address _ATHER,
        address _ATHERUSD,
        address _SATHER
    ) {
        require( _ATHER != address(0) );
        ATHER = _ATHER;
        require( _ATHERUSD != address(0) );
        ATHERUSD = _ATHERUSD;
        require( _SATHER != address(0) );
        SATHER = _SATHER;

        isRecordAuthority[address(this)] = true;
        isRecordAuthority[msg.sender] = true;
        isDirectDepositor[msg.sender] = true;

        control = TreasuryController({
            reserveUpdateLast: 0,
            reserveUpdateInterval: 60, // every 30 blocks (or by owner)
            directDepositPublic: 0
        });
    }

    /**
        @notice allow approved address to deposit an asset for ATHER
        @param _token address
        @param _amount uint
     */
    function deposit( address _token, uint _amount ) external isAccepted(_token) onlyDirectDepositor() returns ( uint ) {
        IERC20( _token ).safeTransferFrom( msg.sender, address(this), _amount );
        uint tokenUsdValue = valueOfToken( _token, _amount );
        uint atherMatched = atherValueOf( _token, _amount );
        data.totalReserves = data.totalReserves.add( tokenUsdValue );
        emit DirectDeposit( _token, _amount, tokenUsdValue, atherMatched );
        recordProfit( msg.sender, atherMatched, "direct deposit" );
        return atherMatched;
    }
    function recordProfit( address _token, uint _amount, string memory _details) public onlyAuthority() {
        uint tokenUsdValue = valueOfToken( _token, _amount );
        uint atherAmount = atherValueOf( _token, _amount );
        IERC20Mintable( ATHER ).mint( address(this), atherAmount );
        data.totalProfit = data.totalProfit.add(tokenUsdValue);
        if (isStableToken[_token]) { data.totalProfitHard = data.totalProfitHard.add(tokenUsdValue); }
        else { data.totalProfitSoft = data.totalProfitSoft.add(tokenUsdValue); }
        emit AthertonProfit( _token, _amount, tokenUsdValue, atherAmount, _details);
        bool excludeTreasuryHoldings = true;
        payDividends( atherAmount, excludeTreasuryHoldings );
    }
    function recordLoss( address _token, uint _amount, string memory _details) public onlyAuthority() {
        uint tokenUsdValue = valueOfToken( _token, _amount );
        uint atherValue = atherValueOf( _token, _amount );
        IERC20Mintable( ATHER ).burnFrom( address(this), atherValue );
        data.totalLoss = data.totalLoss.sub(tokenUsdValue);
        if (isStableToken[_token]) { data.totalLossHard = data.totalLossHard.add(tokenUsdValue); }
        else { data.totalLossSoft = data.totalLossSoft.add(tokenUsdValue); }
        emit AthertonLoss( _token, _amount, tokenUsdValue, atherValue, _details);
    }
    function payDividends( uint _atherAmount, bool _excludeTreasuryHoldings ) public onlyAuthority() {
        // Denominator = TreasuryOwndAther + StakingOwned + BondOwned
        uint totalDividendable = _excludeTreasuryHoldings ? 0 : ERC20( ATHER ).balanceOf(address(this));
        for( uint i = 0; i < stakingContracts.length; i++ ) {
            if ( ! isStakingContract[ stakingContracts[ i ] ] ) { continue; }
            totalDividendable.add( ERC20( ATHER ).balanceOf( stakingContracts[ i ] ) );
        }
        uint perAtherDistribute = _atherAmount.mul(1e18).div(totalDividendable); // bump 1e18 for precision
        for( uint i = 0; i < stakingContracts.length; i++ ) {
            if ( ! isStakingContract[ stakingContracts[ i ] ] ) { continue; }
            uint atherBalance = ERC20( ATHER ).balanceOf( stakingContracts[ i ] );
            uint dividend = atherBalance.mul(perAtherDistribute).div(1e18);
            IERC20( ATHER ).transfer(stakingContracts[ i ], dividend );
            IStaking( stakingContracts[ i ] ).updateDistribute( dividend, true );
        }
        // TODO: for bonds   
    }

    // Staking
    function stake( address _stakingContract, uint _amount, uint16 _autoRestake ) external {
        require( isStakingContract[_stakingContract], "Not a staking contract");
        IStaking(_stakingContract).setAutoRestake( msg.sender, _autoRestake );
        IStaking(_stakingContract).epochCheck();
        IStaking(_stakingContract).rebaseAccount( msg.sender );
        IERC20( ATHER ).safeTransferFrom( msg.sender, _stakingContract, _amount );
        IERC20Mintable( SATHER ).mint( msg.sender, _amount );
        IStaking(_stakingContract).stakeEffect( msg.sender, _amount );
    }
    function unstake( address _stakingContract, uint _amount ) external isStaker( _stakingContract, msg.sender ) {
        IStaking(_stakingContract).epochCheck();
        IStaking(_stakingContract).rebaseAccount( msg.sender );
        IERC20( ATHER ).safeTransferFrom( _stakingContract, msg.sender, _amount );
        IERC20Mintable( SATHER ).burnFrom( msg.sender, _amount );
        IStaking(_stakingContract).unstakeEffect( msg.sender, _amount );
    }
    function setAutoRestake( address _stakingContract, uint16 _autoRestake ) external isStaker( _stakingContract, msg.sender ) {
        IStaking(_stakingContract).setAutoRestake( msg.sender, _autoRestake );
    }
    function rebaseAccount( address _stakingContract, address _account, uint _amount, bool _isPositive )
      public fromStaking() isStaker( _stakingContract, _account ) {
        if (_isPositive) {
            uint restakePercent = IStaking( _stakingContract ).accountRestakePercent( _account );
            if ( restakePercent > 0 ) {
                uint restakeAmount = _amount.mul( restakePercent ).div( 1e4 );
                uint payoutAmount = _amount.sub( restakeAmount );
                IERC20( ATHER ).safeTransferFrom( _stakingContract, _account, payoutAmount );
                IERC20Mintable( SATHER ).mint( _account, restakeAmount );
            } else {
                IERC20( ATHER ).safeTransferFrom( _stakingContract, _account, _amount );
            }
        } else {
            IERC20( ATHER ).safeTransferFrom( _stakingContract, address(this), _amount );
            IERC20Mintable( SATHER ).burnFrom( _account, _amount );
        }
    }

    // Liquidity Providing
    // 0 : UNISWAP_V2
    enum LPType {
        UNISWAP_V2
    }



    function incurUnsecured( address _borrower, uint _amount ) external onlyOwner() {
        IERC20Mintable( ATHER ).mint( _borrower, _amount );
        data.totalUnsecured = data.totalUnsecured.add( _amount );
        unsecuredLoans[_borrower] = unsecuredLoans[_borrower].add(_amount);

        emit IncurUnsecured( ATHER, _borrower, _amount, unsecuredLoans[_borrower]);
    }
    function repayUnsecured( address _borrower, uint _amount ) external {
        require( unsecuredLoans[_borrower] >= _amount );
        IATHERERC20( ATHER ).burnFrom(_borrower, _amount);
        data.totalUnsecured = data.totalUnsecured.sub( _amount );
        unsecuredLoans[_borrower] = unsecuredLoans[_borrower].sub(_amount);
        emit RepayUnsecured( ATHER, _borrower, _amount, unsecuredLoans[_borrower]);
    }
    function repayUnsecuredOnBehalfOf( address _borrower, address _repayer, uint _amount ) external {
        require( unsecuredLoans[_borrower] >= _amount );
        IATHERERC20( ATHER ).burnFrom(_repayer, _amount);
        data.totalUnsecured = data.totalUnsecured.sub( _amount );
        unsecuredLoans[_borrower] = unsecuredLoans[_borrower].sub(_amount);
        emit RepayUnsecured( ATHER, _borrower, _amount, unsecuredLoans[_borrower]);
    }
    function incurUnsecuredUSD( address _borrower, uint _amount ) external onlyOwner() {
        IERC20Mintable( ATHERUSD ).mint( _borrower, _amount );
        data.totalUnsecuredUSD = data.totalUnsecuredUSD.add( _amount );
        unsecuredLoansUSD[_borrower] = unsecuredLoansUSD[_borrower].add(_amount);
        emit IncurUnsecuredUSD( ATHERUSD, _borrower, _amount, unsecuredLoansUSD[_borrower]);
    }
    function repayUnsecuredUSD( address _borrower, uint _amount ) external {
        require( unsecuredLoansUSD[_borrower] >= _amount );
        IATHERERC20( ATHERUSD ).burnFrom(_borrower, _amount);
        data.totalUnsecuredUSD = data.totalUnsecuredUSD.sub( _amount );
        unsecuredLoansUSD[_borrower] = unsecuredLoansUSD[_borrower].sub(_amount);
        emit RepayUnsecuredUSD( ATHERUSD, _borrower, _amount, unsecuredLoansUSD[_borrower]);
    }
    function repayUnsecuredUSDOnBehalfOf( address _borrower, address _repayer, uint _amount ) external {
        require( unsecuredLoansUSD[_borrower] >= _amount );
        IATHERERC20( ATHERUSD ).burnFrom(_repayer, _amount);
        data.totalUnsecuredUSD = data.totalUnsecuredUSD.sub( _amount );
        unsecuredLoansUSD[_borrower] = unsecuredLoansUSD[_borrower].sub(_amount);
        emit RepayUnsecuredUSD( ATHERUSD, _borrower, _amount, unsecuredLoansUSD[_borrower]);
    }


    /**
        @notice takes inventory of all tracked assets
        @notice always consolidate to recognized reserves before audit
     */
    function auditReserves() public {
        if (block.number < control.reserveUpdateLast + control.reserveUpdateInterval) {
            return;
        }
        control.reserveUpdateLast = uint32(block.number);
        uint reserves;
        delete erc20Assets;
        for( uint i = 0; i < stableTokens.length; i++ ) {
            if (!isStableToken[stableTokens[ i ]]) { continue; }
            uint balance = IERC20( stableTokens[ i ] ).balanceOf( address(this) );
            uint value = valueOfToken( stableTokens[ i ], balance );
            reserves = reserves.add(value);
            erc20Assets.push(TreasuryOwnedErc20({
                token: stableTokens[ i ],
                balance: balance,
                value: value
            }));
        }
        for( uint i = 0; i < floatingTokens.length; i++ ) {
            if (!isFloatingToken[floatingTokens[ i ]]) { continue; }
            uint balance = IERC20( floatingTokens[ i ] ).balanceOf( address(this) );
            uint value = valueOfToken( floatingTokens[ i ], balance );
            reserves = reserves.add(value);
            erc20Assets.push(TreasuryOwnedErc20({
                token: floatingTokens[ i ],
                balance: balance,
                value: value
            }));
        }
        for( uint i = 0; i < lpTokens.length; i++ ) {
            if (!isLpToken[lpTokens[ i ]]) { continue; }
            uint balance = IERC20( lpTokens[ i ] ).balanceOf( address(this) );
            uint value = valueOfToken( lpTokens[ i ], balance );
            reserves = reserves.add(value);
            erc20Assets.push(TreasuryOwnedErc20({
                token: lpTokens[ i ],
                balance: balance,
                value: value
            }));
        }
        data.totalReserves = reserves;
        if (msg.sender == owner()) { // only calls from owner emit the event to reduce polution
            emit ReservesUpdated( reserves, erc20Assets );    
        }
    }

    /**
        @notice verify queue then set boolean in mapping
        @param _address address
        @param value bool
     */
    function setAuthority( address _address, bool value ) external onlyOwner() {
        isRecordAuthority[_address] = value;
        emit AuthorityChange( _address, value );
    }
    function setDepositor( address _address, bool value ) external onlyOwner() {
        isDirectDepositor[_address] = value;
        emit DirectDepositorChange( _address, value );
    }
    function setStableToken(bool _value, address _token) external onlyOwner() {
        require(ERC20( _token ).decimals() == 18, "treasury can only deal with ERC20 with 18 decimals");
        if ( _value ) {
            isStableToken[ _token ] = true;
            if (!listContains(stableTokens, _token)) {
                stableTokens.push(_token);
            }
        } else {
            require(isStableToken[ _token ], "not a registered stable token");
            isStableToken[ _token ] = false;
        }
    }
    function setFloatingToken(bool _value, address _token, address _evaluator, address _groudingLpPair) external onlyOwner() {
        require(ERC20( _token ).decimals() == 18, "treasury can only deal with ERC20 with 18 decimals");
        if ( _value ) {
            isFloatingToken[ _token ] = true;
            evaluator[ _token ] = TokenEvaluator({
                addr: _evaluator,
                pair: _groudingLpPair
            });
            if (!listContains(floatingTokens, _token)) {
                floatingTokens.push(_token);
            }
        } else {
            require(isStableToken[ _token ], "not a registered floating token");
            isFloatingToken[ _token ] = false;
            delete evaluator[ _token ];
        }
    }
    function setLpToken(bool _value, address _token, address _evaluator, address _groudingLpPair) external onlyOwner() {
        require(ERC20( _token ).decimals() == 18, "treasury can only deal with ERC20 with 18 decimals");
        if (_value) {
            isLpToken[ _token ] = true;
            isComplexLpToken[ _token ] = _groudingLpPair != address(0);
            evaluator[ _token ] = TokenEvaluator({
                addr: _evaluator,
                pair: _groudingLpPair
            });
            if (!listContains(lpTokens, _token)) {
                lpTokens.push(_token);
            }
        } else {
            require(isLpToken[ _token ], "not a registered LP token");
            isLpToken[ _token ] = false;
            isComplexLpToken[ _token ] = false;
            delete evaluator[ _token ];
        }
    }

    function setStakingContract( bool _value, address stakingContract_ ) external onlyOwner() {
        if (_value) {
            require( !isStakingContract[stakingContract_], "already registered" );
            isStakingContract[stakingContract_] = true;
            if (!listContains(stakingContracts, stakingContract_)) {
                stakingContracts.push(stakingContract_);
            }
            isRecordAuthority[stakingContract_] = true;
        } else {
            require( isStakingContract[stakingContract_], "contract not found on registry" );
            delete isStakingContract[stakingContract_];
            isRecordAuthority[stakingContract_] = false;
        }
        emit StakingContractUpdated( stakingContract_, _value );
    }

    /**
        @notice returns all important treasury data
        @return TreasuryData
     */
    function getTreasuryData() public view returns ( TreasuryData memory ) {
        return data;
    }

    /**
        @notice returns USD valuation of asset
        @param _token address
        @param _amount uint
        @return value_ uint
     */
    function valueOfToken( address _token, uint _amount ) public view returns ( uint ) {
        if ( isStableToken[ _token ] ) {
            return _amount; // 1 USD = 1 USD
        }
        address groudingLpPair = evaluator[ _token ].pair;
        if ( isFloatingToken[ _token ] ) {
            return ITokenEvaluator( evaluator[ _token ].addr ).valuationFloating( _token, groudingLpPair, _amount );  
        } else if ( isLpToken[ _token ] ) {
            if ( isComplexLpToken[ _token ] ) {
                return ITokenEvaluator( evaluator[ _token ].addr ).valuationComplexLpToken( _token, groudingLpPair, _amount );
            } else {
                return ITokenEvaluator( evaluator[ _token ].addr ).valuationLpToken( _token, _amount );
            }
        }
        return 0;
    }
    function atherValueOf( address _token, uint _amount ) public view isAccepted(_token) returns ( uint ) {
        uint tokenUsdValue = valueOfToken( _token, _amount );
        return tokenUsdValue.mul( 1e18 ).div( valueOfToken( ATHER, 1e18 ) );
    }

    function getErc20Assets() public view returns (TreasuryOwnedErc20[] memory) {
        return erc20Assets;
    }

    /**
        @notice checks array to ensure against duplicate
        @param _list address[]
        @param _token address
        @return bool
     */
    function listContains( address[] storage _list, address _token ) internal view returns ( bool ) {
        for( uint i = 0; i < _list.length; i++ ) {
            if( _list[ i ] == _token ) {
                return true;
            }
        }
        return false;
    }

}