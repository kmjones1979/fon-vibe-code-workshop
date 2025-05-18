// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol"; // For uint to string conversion
import "@openzeppelin/contracts/utils/Base64.sol"; // For Base64 encoding

/**
 * @title GameCharacter
 * @dev ERC721 contract for unique game characters with on-chain metadata.
 */
contract GameCharacter is ERC721, Ownable {
    uint256 private _nextTokenId = 1;
    address public minterAddress;
    string public baseImageURI; // Changed from baseTokenURI to reflect its new purpose

    enum CharacterClass { Warrior, Mage, Rogue, Archer }

    struct CharacterStats {
        string name; // Added
        string description; // Added
        uint256 level;
        uint256 experience;
        CharacterClass class;
        uint256 strength;
        uint256 dexterity;
        uint256 intelligence;
    }

    mapping(uint256 => CharacterStats) public characterStats;

    event CharacterStatsUpdated(uint256 indexed tokenId, CharacterStats stats);
    event MinterChanged(address indexed newMinter);

    constructor(string memory _baseImageURI) ERC721("GameCharacter", "CHAR") Ownable(msg.sender) {
        baseImageURI = _baseImageURI; // Initialize baseImageURI
    }

    function setMinter(address _newMinter) public onlyOwner {
        minterAddress = _newMinter;
        emit MinterChanged(_newMinter);
    }

    modifier onlyMinterOrOwner() {
        require(msg.sender == owner() || msg.sender == minterAddress, "Caller not owner or minter");
        _;
    }

    function mintCharacter(
        address to,
        string memory _name, // Added
        string memory _description, // Added
        CharacterClass _class,
        uint256 _strength,
        uint256 _dexterity,
        uint256 _intelligence
    ) public onlyMinterOrOwner returns (uint256) {
        uint256 newItemId = _nextTokenId;
        _nextTokenId++;
        _safeMint(to, newItemId);

        characterStats[newItemId] = CharacterStats({
            name: _name, // Added
            description: _description, // Added
            level: 1,
            experience: 0,
            class: _class,
            strength: _strength,
            dexterity: _dexterity,
            intelligence: _intelligence
        });
        emit CharacterStatsUpdated(newItemId, characterStats[newItemId]);
        return newItemId;
    }

    function updateCharacterStats(uint256 tokenId, CharacterStats memory newStats) public onlyOwner {
        require(ownerOf(tokenId) != address(0), "Character not owned.");
        characterStats[tokenId] = newStats;
        emit CharacterStatsUpdated(tokenId, newStats);
    }

    function _characterClassToString(CharacterClass _class) internal pure returns (string memory) {
        if (_class == CharacterClass.Warrior) return "Warrior";
        if (_class == CharacterClass.Mage) return "Mage";
        if (_class == CharacterClass.Rogue) return "Rogue";
        if (_class == CharacterClass.Archer) return "Archer";
        return "Unknown";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token URI query for nonexistent token or not owned.");
        CharacterStats memory stats = characterStats[tokenId];

        string memory imageURL = string(abi.encodePacked(baseImageURI, Strings.toString(tokenId), ".png")); // Assuming .png, adjust if needed

        string memory attributes = string(abi.encodePacked(
            '{"trait_type": "Level", "value": ', Strings.toString(stats.level), '},',
            '{"trait_type": "Experience", "value": ', Strings.toString(stats.experience), '},',
            '{"trait_type": "Class", "value": "', _characterClassToString(stats.class), '"},',
            '{"trait_type": "Strength", "value": ', Strings.toString(stats.strength), '},',
            '{"trait_type": "Dexterity", "value": ', Strings.toString(stats.dexterity), '},',
            '{"trait_type": "Intelligence", "value": ', Strings.toString(stats.intelligence), '}'
        ));

        string memory json = string(abi.encodePacked(
            '{"name": "', stats.name, '", ',
            '"description": "', stats.description, '", ',
            '"image": "', imageURL, '", ',
            '"attributes": [', attributes, ']}'
        ));

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }



    // _uint2str is now replaced by Strings.toString from OpenZeppelin
    // function _uint2str(uint256 _i) internal pure returns (string memory str) { ... }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 