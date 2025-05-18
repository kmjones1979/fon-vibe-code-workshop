export enum CharacterClass {
  Warrior,
  Mage,
  Rogue,
  Archer,
}

// We can add more character-related types here in the future
// For example, the structure of the metadata fetched from tokenURI
export interface CharacterMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}
