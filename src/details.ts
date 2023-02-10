import Cache from './cache';

type detailsMapColor = {
    id: string;
    name: string;
    red: string;
    green: string;
    blue: string;
};

type detailsMapTerritory = {
    id: string;
    name: string;
    maxunits: string;
    x: string;
    y: string;
    textx: string;
    texty: string;
};

type detailsBoardBorder = {
    a: string;
    b: string;
};

type detailsContinentsContinent = {
    id: string;
    name: string;
    units: string;
    cids: string;
};

type statePlayersPlayer = {
    name: string;
    colorid: string;
    isturn: string;
    active: string;
    teamid: string;
    units: string;
    profileid: string;
    id: string;
};

type stateBoardArea = {
    playerid: string;
    units: string;
    id: string;
};

const cache = new Cache();
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;``

async function getDetails(gameId: number) {
    if (!Object.hasOwn(process.env, 'WARFISH_COOKIE')) {
        throw new Error('NoWarfishCookie');
    }
    const url = new URL(`http://warfish.net/war/services/rest?_method=warfish.tables.getDetails&_format=json&gid=${gameId}&sections=board,rules,map,continents`);
    const options = {
        headers: {
            Cookie: process.env['WARFISH_COOKIE'] ?? ''
        }
    }
    const res = await fetch(url, options);
    if (!res.ok) {
        throw new Error('DetailsFetchFailed');
    }
    const details = await res.json();
    if (details.stat !== 'ok') {
        throw new Error('WarfishStatError');
    }


    // Rules
    const rules = {
        maxUnitsPerTerritory: parseInt(details._content.rules.maxpercountry, 10),
        hasCard: details._content.rules.hascards === '1',
        damageDieAttackMinimum: parseInt(details._content.rules.afdie, 10),
        teamGame: details._content.rules.teamgame === '1',
        maxFortifications: details._content.rules.numtransfers === '-1' ? Number.POSITIVE_INFINITY : parseInt(details._content.rules.numtransfers, 10),
        defenseDieSides: parseInt(details._content.rules.ddie, 10),
        teamTransfers: details._content.rules.teamtransfer === '1',
        bootTime: parseInt(details._content.rules.boottime, 10),
        maxReserveUnits: parseInt(details._content.rules.numreserves, 10),
        fog: parseInt(details._content.rules.fog, 10),
        allowContinuousAttack: details._content.rules.continuousattack === '1',
        maxAttacks: details._content.rules.numattacks === '-1' ? Number.POSITIVE_INFINITY : parseInt(details._content.rules.numattacks, 10),
        keepPossession: details._content.rules.keeppossession === '1',
        allowPretransfer: details._content.rules.pretransfer === '1',
        allowAbandon: details._content.rules.allowabandon === '1',
        allowReturnToPlace: details._content.rules.returntoplace === '1',
        attackDieSides: parseInt(details._content.rules.adie, 10),
        cardScale: details._content.rules.cardscale,
        damageDieDefenseMinimum: parseInt(details._content.rules.dfdie, 10),
        blindAtOncePlay: details._content.rules.baoplay === '1',
        teamPlace: details._content.rules.teamplaceunits === '1',
        allowReturnToAttack: details._content.rules.returntoattack === '1',
    };
    cache.add('warfish-details-rules', String(gameId), rules, THIRTY_DAYS);


    // Map
    const map = {
        numberOfTerritories: parseInt(details._content.map.numterritories, 10),
        filledNumbers: details._content.map.fillednumbers === '1',
        fillMode: parseInt(details._content.map.fillmore, 10),
        logoPosition: {
            x: parseInt(details._content.map.logox, 10),
            y: parseInt(details._content.map.logoy, 10),
        },
        logoUrl: details._content.map.logourl,
        legendPosition: {
            x: parseInt(details._content.map.legendx, 10),
            y: parseInt(details._content.map.legendy, 10),
        },
        height: parseInt(details._content.map.height, 10),
        width: parseInt(details._content.map.width, 10),
        displayTerritoryNames: details._content.map.dispcnames === '1',
        circleMode: details._content.map.circlemode === '1',
        colors: details._content.map._content.color.map((c: detailsMapColor) => {
            return {
                id: parseInt(c.id, 10),
                name: c.name,
                red: parseInt(c.red, 10),
                green: parseInt(c.green, 10),
                blue: parseInt(c.blue, 10),
            };
        }),
        territories: details._content.map._content.territory.map((c: detailsMapTerritory) => {
            return {
                id: parseInt(c.id, 10),
                name: c.name,
                maxUnits: parseInt(c.maxunits, 10),
                x: parseInt(c.x, 10),
                y: parseInt(c.y, 10),
                textOffsetX: parseInt(c.textx, 10),
                textOffsetY: parseInt(c.texty, 10),
            }
        }),
    };
    cache.add('warfish-details-map', String(gameId), map, THIRTY_DAYS);


    // Board
    const board = {
        id: parseInt(details._content.board.boardid, 10),
        height: parseInt(details._content.board.height, 10),
        width: parseInt(details._content.board.width, 10),
        borders: details._content.board._content.border.map((b: detailsBoardBorder) => {
            return {
                from: parseInt(b.a, 10),
                to: parseInt(b.b, 10),
            };
        }),
    };
    cache.add('warfish-details-board', String(gameId), board, THIRTY_DAYS);


    // Continents
    const continents = details._content.continents._content.continent.map((c: detailsContinentsContinent) => {
        return {
            id: parseInt(c.id, 10),
            name: c.name,
            units: parseInt(c.units, 10),
            territoryIds: c.cids.split(',').map((cid: string) => parseInt(cid, 10)),
        };
    });
    cache.add('warfish-details-continents', String(gameId), continents, THIRTY_DAYS);
};

export async function getRules(gameId: number) {
    const hasRules = cache.has('warfish-details-rules', String(gameId));
    if (!hasRules) {
        await getDetails(gameId);
    }
    return cache.get('warfish-details-rules', String(gameId));
};

export async function getMap(gameId: number) {
    const hasMap = cache.has('warfish-details-map', String(gameId));
    if (!hasMap) {
        await getDetails(gameId);
    }
    return cache.get('warfish-details-map', String(gameId));
};

export async function getBoard(gameId: number) {
    const hasBoard = cache.has('warfish-details-board', String(gameId));
    if (!hasBoard) {
        await getDetails(gameId);
    }
    return cache.get('warfish-details-board', String(gameId));
};

export async function getContinents(gameId: number) {
    const hasContinents = cache.has('warfish-details-continents', String(gameId));
    if (!hasContinents) {
        await getDetails(gameId);
    }
    return cache.get('warfish-details-continents', String(gameId));
};