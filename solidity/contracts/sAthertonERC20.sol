// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./util/ERC20Permit.sol";
import "./util/VaultOwned.sol";



contract sAtherton is ERC20Permit, VaultOwned {

    using SafeMath for uint256;

    constructor() ERC20("Staked Ather", "sATHER") ERC20Permit() {
        
    }

    function mint(address account_, uint256 amount_) public onlyVault() {
        _mint(account_, amount_);
    }

    function burnFrom(address account_, uint256 amount_) public onlyVault() {
        _burn(account_, amount_);
    }

    // ========================================================================
    //  IMPORTANT: sAther cannot be transferred; it is account-locked.
    //             Only the vault is authorized to re-allocate.
    // ========================================================================
    function transfer(address recipient_, uint amount_) public override onlyVault() returns (bool) {
        _transfer(msg.sender, recipient_, amount_);
        return true;
    }
    function transferFrom(address sender_, address recipient_, uint amount_) public override onlyVault() returns (bool) {
        _transfer(sender_, recipient_, amount_);
        return true;
    }

}