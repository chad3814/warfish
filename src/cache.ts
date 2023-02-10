const CACHE_VER = 0;

function getKey(cl: string, id: string) {
    return `${CACHE_VER}-${cl}_${id}`;
};

class Cache {
    private _storage = new Map<string, any>();
    private _timers = new Map<string, NodeJS.Timeout>();

    add(cl: string, id: string, value: any, ms: number) {
        const key = getKey(cl, id);
        if (this._timers.has(key)) {
            clearTimeout(this._timers.get(key));
        }
        this._storage.set(key, value);
        this._timers.set(key, setTimeout(() => this.remove(cl, id), ms));
    }
    has(cl: string, id: string) {
        const key = getKey(cl, id);
        return this._storage.has(key);
    }
    get(cl: string, id: string) {
        const key = getKey(cl, id);
        if (!this.has(cl, id)) {
            throw new Error('NoSuchKey')
        }
        return this._storage.get(key);
    }
    remove(cl: string, id: string) {
        const key = getKey(cl, id);
        if (!this.has(cl, id)) {
            return false;
        }
        clearTimeout(this._timers.get(key));
        this._storage.delete(key);
        this._timers.delete(key);
    }
};

export default Cache;