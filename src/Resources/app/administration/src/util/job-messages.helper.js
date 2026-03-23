/**
 * @sw-package innovation
 */

const { Criteria } = Shopware.Data;

function toArray(collection) {
    const items = [];
    collection.forEach((item) => items.push(item));

    return items;
}

/** @private */
export default async function fetchJobMessages({ messageRepository, jobId, expectedTotal = 0, pageSize = 250 }) {
    const collected = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
        const criteria = new Criteria(page, pageSize);
        criteria.addFilter(Criteria.equals('jobId', jobId));
        criteria.addSorting(Criteria.sort('createdAt', 'ASC', false));

        // Pagination is intentionally sequential because each request decides whether another page is needed.
        // eslint-disable-next-line no-await-in-loop
        const messages = await messageRepository.search(criteria, Shopware.Context.api);
        const pageItems = toArray(messages);
        collected.push(...pageItems);

        const loadedAllExpected = expectedTotal > 0 && collected.length >= expectedTotal;
        hasMorePages = !loadedAllExpected && pageItems.length === pageSize;
        page += 1;
    }

    return collected;
}
