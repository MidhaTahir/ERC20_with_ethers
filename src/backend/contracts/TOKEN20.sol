// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TOKEN20 is ERC20 {
    constructor() ERC20("TOKEN20", "TK20") {
        _mint(msg.sender, 1000 * 10 ** 18);
    }
}