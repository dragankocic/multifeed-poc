(function () {
    const DEFAULT_PAGE_SIZE = 10;
    const EMPTY_ROW_PATTERN = /no .*found|no .*mapped|no .*configured|no data/i;

    function isEmptyStateRow(row) {
        return row && row.cells.length > 0 && EMPTY_ROW_PATTERN.test(row.textContent || '');
    }

    function createControls() {
        const controls = document.createElement('div');
        controls.className = 'table-pagination';
        controls.innerHTML = `
            <span class="table-pagination-info"></span>
            <div class="table-pagination-actions">
                <button type="button" class="table-pagination-prev">Previous</button>
                <button type="button" class="table-pagination-next">Next</button>
            </div>
        `;
        return controls;
    }

    function setupTablePagination(tbody) {
        if (!tbody || tbody.dataset.paginationReady === 'true') return;
        tbody.dataset.paginationReady = 'true';

        const table = tbody.closest('table');
        if (!table) return;

        let currentPage = 1;
        let isRendering = false;
        const pageSize = Number(tbody.dataset.pageSize) || DEFAULT_PAGE_SIZE;
        const controls = createControls();
        const info = controls.querySelector('.table-pagination-info');
        const prevBtn = controls.querySelector('.table-pagination-prev');
        const nextBtn = controls.querySelector('.table-pagination-next');

        table.insertAdjacentElement('afterend', controls);

        function render() {
            if (isRendering) return;
            isRendering = true;

            const rows = Array.from(tbody.querySelectorAll(':scope > tr'));
            const hasOnlyEmptyState = rows.length <= 1 && rows.some(isEmptyStateRow);
            const totalRows = hasOnlyEmptyState ? 0 : rows.length;
            const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

            if (currentPage > totalPages) currentPage = totalPages;

            rows.forEach((row, index) => {
                if (hasOnlyEmptyState) {
                    row.style.display = '';
                    return;
                }

                const firstIndex = (currentPage - 1) * pageSize;
                const lastIndex = firstIndex + pageSize;
                row.style.display = index >= firstIndex && index < lastIndex ? '' : 'none';
            });

            controls.style.display = rows.length > 0 ? 'flex' : 'none';
            info.textContent = totalRows === 0
                ? 'No results'
                : `Page ${currentPage} of ${totalPages} (${totalRows} items)`;
            prevBtn.disabled = currentPage <= 1;
            nextBtn.disabled = currentPage >= totalPages;

            isRendering = false;
        }

        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage -= 1;
                render();
            }
        });

        nextBtn.addEventListener('click', () => {
            currentPage += 1;
            render();
        });

        const observer = new MutationObserver(() => {
            currentPage = 1;
            requestAnimationFrame(render);
        });

        observer.observe(tbody, {
            childList: true
        });

        render();
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('table tbody').forEach(setupTablePagination);
    });
})();
