# warfish
A node package for getting data from warfish.net

Requires node 18+

Has the following methods, which each take a `gameId` as an argument. They are all asynchronous.
```
Warfish.getCards(gameId: number) => {
    setsTraded: number, // number of sets traded in so far
    nextSetsWorth: string, // text representation of the next ten set values
    cardsDiscarded: number, // the number of cards in the discard pile
    nextSetWorth: number, // the number of units the next set is worth
    playerCounts: Array<{seat: number, numberOfCards: number}> // the number of cards each seat has
 }

Warfish.getPlayers(gameId: number) => Array<{
    name: string, // player name
    colorId: number, // color number
    isTurn: boolean, // is it this person's turn
    isAlive: boolean, // is this person alive
    teamId: number, // team number
    reserveUnits: number, // number of reserve units
    profileId: string, // the username on warfish.net
    seat: number, // their seat number
}>

Warfish.getStage(gameId: number) => number // returns the current game stage number

Warfish.getTerritories(gameId: number) => Array<{
    territoryId:  number, // territory id
    seat: number, // the seat that owns the territory
    units: number, // the number of units in the territory
}>

Warfish.getRules(gameId: number) => {
    maxUnitsPerTerritory: number, // the maximum number of units in a territory
    hasCard: boolean, // does this game have cards?
    damageDieAttackMinimum: number, // the minimum number on the die for an attack to kill (0-9)
    teamGame: boolean, // is it a team game?
    maxFortifications: // maximum number of fortifications allowed
    defenseDieSides: number, // number of sides for defender dice
    teamTransfers: boolean, // are team transfers allowed?
    bootTime: number, // the number of seconds it has to have been a player's turn before they can be booted
    maxReserveUnits: number, // the maximum number of reserve units allowed
    fog: number, // what type of fog is in use
    allowContinuousAttack: boolean, // are continuous attacks allowed?
    maxAttacks: number, // the maximum number of attack that can be made per turn
    keepPossession: boolean, // are you allowed to keep possession of a territory you abandoned
    allowPretransfer: boolean, // are pre-transfers allowed in BAO play
    allowAbandon: boolean, // can you abandon a territory (move every unit out)
    allowReturnToPlace: boolean, // after you've made an attack, can you go back to placing units?
    attackDieSides: number, // the number of sides for attacker dice
    cardScale: string, // the number of units for card sets
    damageDieDefenseMinimum: number, // the minimum number on the die for a defender to kill (0-3)
    blindAtOncePlay: boolean, // blind-at-once play
    teamPlace: boolean, // can you place units on your teammates?
    allowReturnToAttack: boolean, // once you've made a fortify transfer, can you return to attacking?
}

Warfish.getMap(gameId: number) => {
    numberOfTerritories: number, // the number of territories on this map
    filledNumbers: boolean, // does this map use "filled numbers" mode
    fillMode: boolean, // does this map allow flood fill on a territory
    logoPosition: { // the (x, y) coordinates of where to logo should be placed
        x: number,
        y: number,
    },
    logoUrl: string, // the logo file to use
    legendPosition: { // the (x, y) coordinates of where the legend should be places
        x: number,
        y: number,
    },
    height: number, // the height of the map
    width: number, // the width of the map
    displayTerritoryNames: boolean, // should the territory names be displayed on the map?
    circleMode: boolean, // does this map use "circle mode"
    colors: Array<{
        id: number, // the color id
        name: string, // the name of the color
        red: number, // RGB values 0-255
        green: number,
        blue: number,
    }>,
    territories: Array<{
        id: number, // the number of the territory
        name: string, // the name of the territory
        maxUnits: number, // the maximum number of units allowed in the territory
        x: number, // the (x, y) coordinates of where the flood fill or circle should be places
        y: number,
        textOffsetX: number, // the (x, y) offsets from the above coordinates for where the text should be
        textOffsetY: number,
    }>,
}

Warfish.getBoard(gameId: number) => {
    id: number, // the board id
    height: number, // the height of the map in pixels
    width: number, // the width of the map in pixels
    borders: Array<{
        from: number, // the territory id that you can attack from
        to: number, // to this territory id
    }>
}

Warfish.getContinents(gameId: number) => Array<{
    id: number, // the continent id
    name: string, // the continent name
    units: number, // the number of bonus units you get for having this continent
    territoryIds: Array<number>, // an array of the territory ids that comprise this continent
}>

Warfish.getHistoryLog(gameId: number) => Array<{
    id: number;
    time: Date;
    action: 'ATTACK' | 'ELIMINATION_BONUS' | 'CAPTURE' | 'DECLINE' | 'ELIMINATION' | 'TRANSFER' | 'AWARDED_CARD' | 'CAPTURED_CARDS' |
            'CAPTURE_RESERVE_UNITS' | 'JOIN' | 'BAO_SEAT_ORDER' | 'BAO_TERRITORY_SELECT' | 'MESSAGE' | 'NEW_GAME' | 'ASSIGN_SEAT' |
            'PLACE_UNIT' | 'BAO_TRANSFER' | 'RESHUFFLE' | 'START' | 'SELECT_TERRITORY' | 'USE_CARDS' | 'BAO_ATTACK' | 'WIN' |
            'NEUTRAL_TERRITORY_SELECT' | 'BONUS_UNITS' | 'SURRENDER' | 'BOOTED' | 'GAME_TERMINATED' | 'TEAM_WIN',
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
}>

Warfish.getMapImage(gameId: number) => {
    width: number,
    height: number,
    mimeType: string,
    data: ArrayBuffer,
}
```