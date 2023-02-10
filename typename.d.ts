
type WarfishPlayerCount = {
    seat: number;
    numberOfCards: number;
};
type WarfishCards = {
    setsTraded: number;
    nextSetsWorth: string;
    cardsDiscarded: number;
    nextSetWorth: number;
    playerCounts: WarfishPlayerCount[],
};
type WarfishPlayer = {
    name: string;
    colorId: number;
    isTurn: boolean;
    isAlive: boolean;
    teamId: number;
    reserveUnits: number;
    profileId: string;
    seat: number;
};
type WarfishPlayers = WarfishPlayer[];
type WarfishTerritory = {
    territoryId: number;
    seat: number;
    units: number;
};
type WarfishTerritories = WarfishTerritory[];
type WarfishRules = {
    maxUnitsPerTerritory: number;     // the maximum number of units in a territory
    hasCard: boolean;                 // does this game have cards?
    damageDieAttackMinimum: number;   // the minimum number on the die for an attack to kill (0-9)
    teamGame: boolean;                // is it a team game?
    maxFortifications: number;        // maximum number of fortifications allowed
    defenseDieSides: number;          // number of sides for defender dice
    teamTransfers: boolean;           // are team transfers allowed?
    bootTime: number;                 // the number of seconds it has to have been a player's turn before they can be booted
    maxReserveUnits: number;          // the maximum number of reserve units allowed
    fog: number;                      // what type of fog is in use
    allowContinuousAttack: boolean;   // are continuous attacks allowed?
    maxAttacks: number;               // the maximum number of attack that can be made per turn
    keepPossession: boolean;          // are you allowed to keep possession of a territory you abandoned
    allowPretransfer: boolean;        // are pre-transfers allowed in BAO play
    allowAbandon: boolean;            // can you abandon a territory (move every unit out)
    allowReturnToPlace: boolean;      // after you've made an attack, can you go back to placing units?
    attackDieSides: number;           // the number of sides for attacker dice
    cardScale: string;                // the number of units for card sets
    damageDieDefenseMinimum: number;  // the minimum number on the die for a defender to kill (0-3)
    blindAtOncePlay: boolean;         // blind-at-once play
    teamPlace: boolean;               // can you place units on your teammates?
    allowReturnToAttack: boolean;     // once you've made a fortify transfer, can you return to attacking?
};
type WarfishPosition = {
    x: number;
    y: number;
};
type WarfishColor = {
    id: number;
    name: string;
    red: number;
    green: number;
    blue: number;
};
type WarfishMapTerritory = {
    id: number; // the number of the territory
    name: string; // the name of the territory
    maxUnits: number; // the maximum number of units allowed in the territory
    x: number; // the (x, y) coordinates of where the flood fill or circle should be places
    y: number;
    textOffsetX: number; // the (x, y) offsets from the above coordinates for where the text should be
    textOffsetY: number;
};
type WarfishMap = {
    numberOfTerritories: number, // the number of territories on this map
    filledNumbers: boolean, // does this map use "filled numbers" mode
    fillMode: boolean, // does this map allow flood fill on a territory
    logoPosition: WarfishPosition; // the (x, y) coordinates of where to logo should be placed
    logoUrl: string, // the logo file to use
    legendPosition: WarfishPosition; // the (x, y) coordinates of where the legend should be places
    height: number, // the height of the map
    width: number, // the width of the map
    displayTerritoryNames: boolean, // should the territory names be displayed on the map?
    circleMode: boolean, // does this map use "circle mode"
    colors: WarfishColor[];
    territories: WarfishMapTerritory[];
}
type WarfishBorder = {
    from: number; // the territory id that you can attack from
    to: number; // to this territory id
};
type WarfishBoard = {
    id: number; // the board id
    height: number; // the height of the map in pixels
    width: number; // the width of the map in pixels
    borders: WarfishBorder[];
};
type WarfishContinents = {
    id: number; // the continent id
    name: string; // the continent name
    units: number; // the number of bonus units you get for having this continent
    territoryIds: number[], // an array of the territory ids that comprise this continent
};
type WarfishAction = 'ATTACK' | 'ELIMINATION_BONUS' | 'CAPTURE' | 'DECLINE' | 'ELIMINATION' | 'TRANSFER' | 'AWARDED_CARD' | 'CAPTURED_CARDS' |
                     'CAPTURE_RESERVE_UNITS' | 'JOIN' | 'BAO_SEAT_ORDER' | 'BAO_TERRITORY_SELECT' | 'MESSAGE' | 'NEW_GAME' | 'ASSIGN_SEAT' |
                     'PLACE_UNIT' | 'BAO_TRANSFER' | 'RESHUFFLE' | 'START' | 'SELECT_TERRITORY' | 'USE_CARDS' | 'BAO_ATTACK' | 'WIN' |
                     'NEUTRAL_TERRITORY_SELECT' | 'BONUS_UNITS' | 'SURRENDER' | 'BOOTED' | 'GAME_TERMINATED' | 'TEAM_WIN';
type WarfishHistoryLogItem = {
    id: number;
    time: Date;
    action: WarfishAction;
    seat?: number;
    logVersion?: number;
    territoryId?: number;
    number?: number;
    attackerDice?: number[];
    defenderDice?: number[];
    defenderSeat?: number;
    attackerLost?: number;
    defenderLost?: number;
    baoOrderId?: number;
    toTerritoryId?: number;
    fromTerritoryId?: number;
    eliminatedSeat?: number;
    teamId?: number;
    seatList?: number[];
    cardList?: number[];
    cardId?: number;
};
type WarfishHistoryLog = WarfishHistoryLogItem[];
type WarfishMapImage = {
    width: number;
    height: number;
    mimeType: string;
    data: ArrayBuffer;
};
declare module "warfish" {
    export const Warfish = {
        getCards: (gameId: number) => Promise<WarfishCards>,
        getPlayers: (gameId: number) => Promise<WarfishPlayers>,
        getStage: (gameId: number) => Promise<number>,
        getTerritories: (gameId: number) => Promise<WarfishTerritories>,
        getRules: (gameId: number) => Promise<WarfishRules>,
        getMap: (gameId: number) => Promise<WarfishMap>,
        getBoard: (gameId: number) => Promise<WarfishBoard>,
        getContinents: (gameId: number) => Promise<WarfishContinents>,
        getHistoryLog: (gameId: number) => Promise<WarfishHistoryLog>,
        getMapImage: (gameId: number) => Promise<WarfishMapImage>,
    }
}