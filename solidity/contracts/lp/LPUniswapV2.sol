// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.0;

import "./LPInterface.sol";

contract UniswapV2LP is LPInterface {
    constructor(
      address _treasury,
      address _pair
    ) {

    }
    function provide(address account_, uint256 amount_) external override {

    }
    // function finalize(address account_, uint256 amount_) external override {

    // }
}
