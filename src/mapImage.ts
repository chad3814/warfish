import {getBoard} from "./details";

export async function getMapImage(gameId: number) {
    const board = await getBoard(gameId);
    const url = new URL(`http://as1.warfish.net/b${board.id}i0g0s0.png`);
    let res = await fetch(url);
    if (res.ok) {
        const data = await res.arrayBuffer();
        return {
            width: board.width,
            height: board.height,
            mimeType: 'image/png',
            data,
        };
    }
    url.pathname = url.pathname.replace('.png', '.jpg');
    res = await fetch(url);
    if (res.ok) {
        const data = await res.arrayBuffer();
        return {
            width: board.width,
            height: board.height,
            mimeType: 'image/jpg',
            data,
        };
    }
    url.pathname = url.pathname.replace('.jpg', '.gif');
    res = await fetch(url);
    if (res.ok) {
        const data = await res.arrayBuffer();
        return {
            width: board.width,
            height: board.height,
            mimeType: 'image/gif',
            data,
        };
    }
    throw new Error('UnableToFindMap');
};