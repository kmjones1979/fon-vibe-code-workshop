// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./GameCharacter.sol"; // Import the interface/contract
import "./GameItem.sol"; // Import GameItem for its interface definition

/**
 * @title GameLogic
 * @dev Central contract for managing core game mechanics.
 */
contract GameLogic is Ownable {
    IGameCharacter public gameCharacterContract;
    IGameItem public gameItemContract; // Added GameItem contract state variable

    event GameCharacterContractSet(address indexed contractAddress);
    event GameItemContractSet(address indexed contractAddress); // Added event for GameItem
    event CharacterSuccessfullyMinted(address indexed player, uint256 indexed characterId);
    event ItemSuccessfullyAwarded(address indexed player, uint256 indexed itemId, uint256 amount); // Added event for item awarding

    constructor(address _initialOwner) Ownable(_initialOwner) {}

    /**
     * @dev Sets the address of the GameCharacter contract.
     * Only callable by the contract owner.
     */
    function setGameCharacterContract(address _contractAddress) public onlyOwner {
        gameCharacterContract = IGameCharacter(_contractAddress);
        emit GameCharacterContractSet(_contractAddress);
    }

    /**
     * @dev Sets the address of the GameItem contract.
     * Only callable by the contract owner.
     */
    function setGameItemContract(address _contractAddress) public onlyOwner {
        gameItemContract = IGameItem(_contractAddress);
        emit GameItemContractSet(_contractAddress);
    }

    /**
     * @dev Allows a player to mint a new character with specified attributes.
     * The GameLogic contract must be an authorized minter on the GameCharacter contract.
     * @param _name The name of the character to mint.
     * @param _description The description of the character to mint.
     * @param _class The class of the character to mint.
     * @param _strength Initial strength.
     * @param _dexterity Initial dexterity.
     * @param _intelligence Initial intelligence.
     */
    function playerMintNewCharacter(
        string memory _name,
        string memory _description,
        GameCharacter.CharacterClass _class,
        uint256 _strength,
        uint256 _dexterity,
        uint256 _intelligence
    ) public returns (uint256) {
        require(address(gameCharacterContract) != address(0), "GameLogic: GameCharacter contract not set");

        uint256 newCharacterId = gameCharacterContract.mintCharacter(
            msg.sender,
            _name,
            _description,
            _class,
            _strength,
            _dexterity,
            _intelligence
        );
        
        emit CharacterSuccessfullyMinted(msg.sender, newCharacterId);
        return newCharacterId;
    }

    /**
     * @dev Allows the GameLogic owner to award an item to a player.
     * The GameLogic contract must be an authorized minter on the GameItem contract.
     * @param _player The address of the player to receive the item.
     * @param _itemId The ID of the item type to award.
     * @param _amount The amount of the item to award.
     */
    function adminAwardItem(
        address _player,
        uint256 _itemId,
        uint256 _amount
    ) public onlyOwner { // Restricted to GameLogic owner for now
        require(address(gameItemContract) != address(0), "GameLogic: GameItem contract not set");
        gameItemContract.mintItem(_player, _itemId, _amount, "");
        emit ItemSuccessfullyAwarded(_player, _itemId, _amount);
    }

    // Future game functions will go here:
    // - Starting quests
    // - Combat mechanics
    // - Item usage / crafting
    // - Interactions with GameItem and GameToken contracts
}

// Define the interface for GameCharacter if not fully imported or to reduce bytecode
// For now, direct import of GameCharacter.sol is fine as it includes enums etc.
interface IGameCharacter {
    function mintCharacter(
        address to,
        string memory _name,
        string memory _description,
        GameCharacter.CharacterClass _class,
        uint256 strength,
        uint256 dexterity,
        uint256 intelligence
    ) external returns (uint256);
    // Add other functions from GameCharacter that GameLogic might need to call
}

// Define the interface for GameItem
interface IGameItem {
    function mintItem(address to, uint256 id, uint256 amount, bytes memory data) external;
    // Add other functions from GameItem if GameLogic needs to call them
    // e.g., function createItemType(...) if GameLogic were to manage item types
} 