// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/Strings.sol"; // If planning to use on-chain metadata

/**
 * @title GameItem
 * @dev ERC1155 contract for managing multiple types of game items.
 */
contract GameItem is ERC1155, Ownable {
    uint256 public nextTokenId = 1; // Counter for new item types
    address public minterAddress; // Address authorized to mint items

    // Struct to store metadata for each item type
    struct ItemType {
        string name;
        string description;
        // Add other attributes like rarity, attack power, etc.
    }

    // Mapping from token ID to ItemType
    mapping(uint256 => ItemType) public itemTypes;

    // URI for all token types (can be overridden per token type)
    // Example: "https://api.example.com/items/{id}.json"
    // The {id} placeholder is replaced with the token ID in lowercase hexadecimal (e.g. 0000...0001)
    // See: https://eips.ethereum.org/EIPS/eip-1155#metadata
    constructor(string memory baseURI) ERC1155(baseURI) Ownable(msg.sender) {}

    event MinterChanged(address indexed newMinter);

    /**
     * @dev Sets or changes the authorized minter address.
     * Only callable by the contract owner.
     */
    function setMinter(address _newMinter) public onlyOwner {
        minterAddress = _newMinter;
        emit MinterChanged(_newMinter);
    }

    modifier onlyMinterOrOwner() {
        require(msg.sender == owner() || msg.sender == minterAddress, "GameItem: Caller is not owner or minter");
        _;
    }

    /**
     * @dev Creates a new item type.
     * @param name The name of the item type.
     * @param description A description of the item type.
     * @param initialSupply The initial supply to mint for the creator.
     * @param to The address to mint the initial supply to.
     */
    function createItemType(
        string memory name,
        string memory description,
        uint256 initialSupply,
        address to
    ) public onlyOwner {
        uint256 newItemId = nextTokenId++;
        itemTypes[newItemId] = ItemType(name, description);

        if (initialSupply > 0) {
            _mint(to, newItemId, initialSupply, "");
        }
    }

    /**
     * @dev Mints additional items of an existing type.
     * @param tokenId The ID of the item type to mint.
     * @param amount The amount of items to mint.
     * @param to The address to mint the items to.
     */
    function mintItem(address to, uint256 tokenId, uint256 amount, bytes memory data) public onlyMinterOrOwner {
        require(tokenId > 0 && tokenId < nextTokenId, "GameItem: Item type does not exist");
        _mint(to, tokenId, amount, data);
    }

    /**
     * @dev Burns items of an existing type from the caller.
     * @param tokenId The ID of the item type to burn.
     * @param amount The amount of items to burn.
     */
    function burn(uint256 tokenId, uint256 amount) public {
        require(tokenId > 0 && tokenId < nextTokenId, "GameItem: Item type does not exist");
        _burn(msg.sender, tokenId, amount);
    }

    // OPTIONAL: Override if you want to return different URIs for different token IDs.
    // function uri(uint256 tokenId) public view override returns (string memory) {
    //     require(tokenId > 0 && tokenId < nextTokenId, "GameItem: Item type does not exist");
    //     // Example: return string(abi.encodePacked(super.uri(tokenId), Strings.toString(tokenId), ".json"));
    //     return super.uri(tokenId); // Uses the baseURI set in constructor by default
    // }

    // The following functions are overrides required by Solidity.

    function setApprovalForAll(address operator, bool approved) public override(ERC1155) {
        super.setApprovalForAll(operator, approved);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 