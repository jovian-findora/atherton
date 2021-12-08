// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../util/ERC20Permit.sol";
import "../util/VaultOwned.sol";



contract MockUSDT is ERC20Permit, VaultOwned {

    using SafeMath for uint256;

    constructor() ERC20("Tether USD", "USDT") {

    }

    function mint(address account_, uint256 amount_) public onlyVault() {
        _mint(account_, amount_);
    }
     
    function burnFrom(address account_, uint256 amount_) public onlyVault() {
        require( account_ ==  _vault, "Only vault-owned tokens may be burnt" );
        _burn(account_, amount_);
    }
}