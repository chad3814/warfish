import Cache from './cache';

type historyMovelogM = {
    id: string;       // history id
    t: string;        // timestamp
    a: 'a' |          // attack
       'b' |          // eliminate player bonus units
       'c' |          // capture territory
       'd' |          // decline
       'e' |          // eliminate player
       'f' |          // transfer
       'g' |          // awarded card
       'h' |          // capture cards
       'i' |          // capture reserve units
       'j' |          // join game
       'k' |          // seat order for blind-at-once round
       'l' |          // blind-at-once territory select
       'm' |          // message
       'n' |          // create new game
       'o' |          // assign seat
       'p' |          // place unit
       'q' |          // blind-at-once transfer
       'r' |          // reshuffle cards
       's' |          // start game
       't' |          // territory select
       'u' |          // use cards
       'v' |          // blind-at-once attack
       'w' |          // win
       'y' |          // neutral territory selected
       'z' |          // bonus units
       'sr' |         // seat surrendered
       'bt' |         // seat booted
       'tg' |         // game terminated
       'tw';          // team win
    s?: string;       // seat
    logver?: string;  // warfish log version
    cid?: string;     // territory id
    num?: string;     // number of units
    ad?: string;      // attack dice
    dd?: string;      // defense dice
    ds?: string;      // defender seat
    m?: string;       // border mods
    al?: string;      // number of attacker units lost
    dl?: string;      // number of defender units lost
    oid?: string;     // blind-at-once order id
    tcid?: string;    // "to" territory id
    fcid?: string;    // "from" territory id
    es?: string;      // eliminated seat
    tid?: string;     // team id
    slist?: string;   // seat list
    clist?: string;   // card list
    cardid?: string;  // card id
};

type HistoryAction = 'ATTACK' | 'ELIMINATION_BONUS' | 'CAPTURE' | 'DECLINE' | 'ELIMINATION' | 'TRANSFER' | 'AWARDED_CARD' | 'CAPTURED_CARDS' |
                     'CAPTURE_RESERVE_UNITS' | 'JOIN' | 'BAO_SEAT_ORDER' | 'BAO_TERRITORY_SELECT' | 'MESSAGE' | 'NEW_GAME' | 'ASSIGN_SEAT' |
                     'PLACE_UNIT' | 'BAO_TRANSFER' | 'RESHUFFLE' | 'START' | 'SELECT_TERRITORY' | 'USE_CARDS' | 'BAO_ATTACK' | 'WIN' |
                     'NEUTRAL_TERRITORY_SELECT' | 'BONUS_UNITS' | 'SURRENDER' | 'BOOTED' | 'GAME_TERMINATED' | 'TEAM_WIN';
type HistoryItem = {
    id: number;
    time: Date;
    action: HistoryAction;
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

type GetAction = (a: string) => HistoryAction;
const getAction: GetAction = (a: string) => {
    switch (a) {
        case 'a': return 'ATTACK';
        case 'b': return 'ELIMINATION_BONUS';
        case 'c': return 'CAPTURE';
        case 'd': return 'DECLINE';
        case 'e': return 'ELIMINATION';
        case 'f': return 'TRANSFER';
        case 'g': return 'AWARDED_CARD';
        case 'h': return 'CAPTURED_CARDS';
        case 'i': return 'CAPTURE_RESERVE_UNITS';
        case 'j': return 'JOIN';
        case 'k': return 'BAO_SEAT_ORDER';
        case 'l': return 'BAO_TERRITORY_SELECT';
        case 'm': return 'MESSAGE';
        case 'n': return 'NEW_GAME';
        case 'o': return 'ASSIGN_SEAT';
        case 'p': return 'PLACE_UNIT';
        case 'q': return 'BAO_TRANSFER';
        case 'r': return 'RESHUFFLE';
        case 's': return 'START';
        case 't': return 'SELECT_TERRITORY';
        case 'u': return 'USE_CARDS';
        case 'v': return 'BAO_ATTACK';
        case 'w': return 'WIN';
        case 'y': return 'NEUTRAL_TERRITORY_SELECT';
        case 'z': return 'BONUS_UNITS';
        case 'sr': return 'SURRENDER';
        case 'bt': return 'BOOTED';
        case 'tg': return 'GAME_TERMINATED';
        case 'tw': return 'TEAM_WIN';
        default:
            throw new Error('UnknownActionCode ' + a);
    }
};

const cache = new Cache();
const THREE_MINUTES = 3 * 60 * 1000;

async function getHistory(gameId: number) {
    if (!Object.hasOwn(process.env, 'WARFISH_COOKIE')) {
        throw new Error('NoWarfishCookie');
    }
    const url = new URL(`http://warfish.net/war/services/rest?_method=warfish.tables.getHistory&_format=json&gid=${gameId}&start=-1&num=1`);
    const options = {
        headers: {
            Cookie: process.env['WARFISH_COOKIE'] ?? ''
        }
    }
    const res = await fetch(url, options);
    if (!res.ok) {
        throw new Error('HistoryFetchFailed');
    }
    const lastHistoryItem = await res.json();
    if (lastHistoryItem.stat !== 'ok') {
        throw new Error('WarfishStatError');
    }

    const total = parseInt(lastHistoryItem._content.movelog.total, 10);
    const history: HistoryItem[] = [];
    for (let i = 0; i < total; i += 1500) {
        url.searchParams.set('start', `${i}`);
        url.searchParams.set('num', '1500');
        const res = await fetch(url, options);
        if (!res.ok) {
            throw new Error('HistoryFetchFailed');
        }
        const historyResponse = await res.json();
        if (historyResponse.stat !== 'ok') {
            throw new Error('WarfishStatError');
        }
        for (const moveItem of historyResponse._content.movelog.m) {
            let action;
            const item: HistoryItem = {
                id: parseInt(moveItem.id, 10),
                action: getAction(moveItem.a),
                time: new Date(parseInt(moveItem.t, 10) * 1000),
            }
            if (Object.hasOwn(moveItem, 'logver')) item.logVersion = parseInt(moveItem.logver, 10);
            if (Object.hasOwn(moveItem, 's')) item.seat = parseInt(moveItem.s, 10);
            if (Object.hasOwn(moveItem, 'ds')) item.defenderSeat = parseInt(moveItem.ds, 10);
            if (Object.hasOwn(moveItem, 'ad')) item.attackerDice = moveItem.ad.split(',').map((d: string) => parseInt(d, 10));
            if (Object.hasOwn(moveItem, 'dd')) item.defenderDice = moveItem.dd.split(',').map((d: string) => parseInt(d, 10));
            if (Object.hasOwn(moveItem, 'al')) item.attackerLost = parseInt(moveItem.al, 10);
            if (Object.hasOwn(moveItem, 'dl')) item.defenderLost = parseInt(moveItem.dl, 10);
            if (Object.hasOwn(moveItem, 'fcid')) item.fromTerritoryId = parseInt(moveItem.fcid, 10);
            if (Object.hasOwn(moveItem, 'tcid')) item.toTerritoryId = parseInt(moveItem.tcid, 10);
            if (Object.hasOwn(moveItem, 'cid')) item.territoryId = parseInt(moveItem.cid, 10);
            if (Object.hasOwn(moveItem, 'num')) item.number = parseInt(moveItem.num, 10);
            if (Object.hasOwn(moveItem, 'oid')) item.baoOrderId = parseInt(moveItem.oid, 10);
            if (Object.hasOwn(moveItem, 'es')) item.eliminatedSeat = parseInt(moveItem.es, 10);
            if (Object.hasOwn(moveItem, 'tid')) item.teamId = parseInt(moveItem.tid, 10);
            if (Object.hasOwn(moveItem, 'slist')) item.seatList = moveItem.slist.split(',').map((s: string) => parseInt(s, 10));
            if (Object.hasOwn(moveItem, 'clist')) item.cardList = moveItem.clist.split(',').map((c: string) => parseInt(c, 10));
            if (Object.hasOwn(moveItem, 'cardid')) item.cardId = parseInt(moveItem.cardid, 10);

            history.push(item);
        }
    }
    cache.add('warfish-history-log', String(gameId), history, THREE_MINUTES);
};

export async function getHistoryLog(gameId: number) {
    const hasHistory = cache.has('warfish-history-log', String(gameId));
    if (!hasHistory) {
        await getHistory(gameId);
    }
    return cache.get('warfish-history-log', String(gameId));
};

