// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.0;

contract LibNote {
  event LogNote(
    bytes4   indexed  sig,
    address  indexed  usr,
    bytes32  indexed  arg1,
    bytes32  indexed  arg2,
    bytes             data
  ) anonymous;

  modifier note {
    _;
    // assembly {
    //     // log an 'anonymous' event with a constant 6 words of calldata
    //     // and four indexed topics: selector, caller, arg1 and arg2
    //     let mark := msize()                         // end of memory ensures zero
    //     mstore(0x40, add(mark, 288))              // update free memory pointer
    //     mstore(mark, 0x20)                        // bytes type data offset
    //     mstore(add(mark, 0x20), 224)              // bytes size (padded)
    //     calldatacopy(add(mark, 0x40), 0, 224)     // bytes payload
    //     log4(mark, 288,                           // calldata
    //          shl(224, shr(224, calldataload(0))), // msg.sig
    //          caller(),                              // msg.sender
    //          calldataload(4),                     // arg1
    //          calldataload(36)                     // arg2
    //         )
    // }
  }
}

interface IStableCoin {
    // --- Auth ---
  function rely(address guy) external;
  function deny(address guy) external;

    // --- Token ---
  function transfer(address dst, uint wad) external returns (bool);
  function transferFrom(address src, address dst, uint wad) external returns (bool);
  function mint(address usr, uint wad) external;
  function burn(address usr, uint wad) external;
  function approve(address usr, uint wad) external returns (bool);

    // --- Alias ---
  function push(address usr, uint wad) external;
  function pull(address usr, uint wad) external;
  function move(address src, address dst, uint wad) external;

    // --- Approve by signature ---
  function permit(address holder, address spender, uint256 nonce, uint256 expiry, bool allowed, uint8 v, bytes32 r, bytes32 s) external;
}
