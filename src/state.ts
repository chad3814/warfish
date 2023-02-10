import Cache from './cache';

type stateCardPlayer = {
    num: string;
    id: string;
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
const SIXTY_SECONDS = 60 * 1000;

async function getState(gameId: number) {
    if (!Object.hasOwn(process.env, 'WARFISH_COOKIE')) {
        throw new Error('NoWarfishCookie');
    }
    const url = new URL(`http://warfish.net/war/services/rest?_method=warfish.tables.getState&_format=json&gid=${gameId}&sections=cards,board,details,players`);
    const options = {
        headers: {
            Cookie: process.env['WARFISH_COOKIE'] ?? ''
        }
    }
    const res = await fetch(url, options);
    if (!res.ok) {
        throw new Error('StateFetchFailed');
    }
    const state = await res.json();
    if (state.stat !== 'ok') {
        throw new Error('WarfishStatError');
    }


    // Cards
    const cards = {
        setsTraded: parseInt(state._content.cards.cardsetstraded, 10),
        nextSetsWorth: state._content.cards.nextcardsworth,
        cardsDiscarded: parseInt(state._content.cards.numdiscard, 10),
        nextSetWorth: parseInt(state._content.cards.worth, 10),
        playerCounts: state._content.cards._content.player.map((p: stateCardPlayer) => {
            return {
                seat: p.id,
                numberOfCards: p.num,
            };
        }),
    };
    cache.add('warfish-state-cards', String(gameId), cards, SIXTY_SECONDS);


    // Players
    const players = state._content.players._content.player.map((p: statePlayersPlayer) => {
        return {
            name: p.name,
            colorId: parseInt(p.colorid, 10),
            isTurn: p.isturn === '1',
            isAlive: p.active === '1',
            teamId: parseInt(p.teamid, 10),
            reserveUnits: parseInt(p.units, 10),
            profileId: p.profileid,
            seat: parseInt(p.id, 10),
        };
    });
    cache.add('warfish-state-players', String(gameId), players, SIXTY_SECONDS);


    // Stage
    const stage = parseInt(state._content.details.stage, 10);
    cache.add('warfish-state-stage', String(gameId), stage, SIXTY_SECONDS);


    // Territories
    const territories = state._content.board._content.area.map((a: stateBoardArea) => {
        return {
            territoryId: parseInt(a.id, 10),
            seat: parseInt(a.playerid, 10),
            units: parseInt(a.units, 10),
        };
    });
    cache.add('warfish-state-territories', String(gameId), territories, SIXTY_SECONDS);
};

export async function getCards(gameId: number) {
    const hasCards = cache.has('warfish-state-cards', String(gameId));
    if (!hasCards) {
        await getState(gameId);
    }
    return cache.get('warfish-state-cards', String(gameId));
};

export async function getPlayers(gameId: number) {
    const hasPlayers = cache.has('warfish-state-players', String(gameId));
    if (!hasPlayers) {
        console.warn('players not cached');
        await getState(gameId);
    }
    return cache.get('warfish-state-players', String(gameId));
};

export async function getStage(gameId: number) {
    const hasStage = cache.has('warfish-state-stage', String(gameId));
    if (!hasStage) {
        await getState(gameId);
    }
    return cache.get('warfish-state-stage', String(gameId));
};

export async function getTerritories(gameId: number) {
    const hasTerritories = cache.has('warfish-state-territories', String(gameId));
    if (!hasTerritories) {
        await getState(gameId);
    }
    return cache.get('warfish-state-territories', String(gameId));
};