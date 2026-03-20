/**
 * @sw-package innovation
 */

/** @private */
export default function toArray(collection) {
    if (Array.isArray(collection)) {
        return collection;
    }

    if (!collection) {
        return [];
    }

    if (typeof collection.forEach === 'function') {
        const items = [];
        collection.forEach((item) => items.push(item));

        return items;
    }

    return [];
}
