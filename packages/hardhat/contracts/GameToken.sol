// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GameToken
 * @dev ERC20 token for the game's currency.
 */
contract GameToken is ERC20, ERC20Burnable, Ownable {
    /**
     * @dev Mints an initial supply of tokens to the contract deployer.
     * Modify as needed for your tokenomics (e.g., mint to a treasury, vesting contract, etc.)
     */
    constructor(uint256 initialSupply) ERC20("GameToken", "GMTK") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * (10**decimals()));
    }

    /**
     * @dev Allows the owner to mint additional tokens. 
     * Consider who should have this power in a production environment.
     * You might want to remove this or restrict it further (e.g., to a MinterRole).
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // The Ownable modifier restricts the minting function to the contract owner.
    // ERC20Burnable provides `burn` and `burnFrom` functions.
    // Decimals are defaulted to 18 by OpenZeppelin's ERC20.sol.
} 