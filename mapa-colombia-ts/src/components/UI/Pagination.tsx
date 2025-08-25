import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import Button from './Button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    totalItems: number;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    totalItems,
    onItemsPerPageChange
}) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            // Adjust if we're near the beginning
            if (currentPage <= 3) {
                end = 4;
            }

            // Adjust if we're near the end
            if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
            }

            // Add ellipsis if needed
            if (start > 2) {
                pages.push('...');
            }

            // Add middle pages
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            // Add ellipsis if needed
            if (end < totalPages - 1) {
                pages.push('...');
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 px-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
                Mostrando {startItem}-{endItem} de {totalItems} resultados
            </div>

            <div className="flex items-center gap-2">
                {onItemsPerPageChange && (
                    <div className="flex items-center gap-2 mr-4">
                        <label className="text-sm text-gray-600 dark:text-gray-300">
                            Mostrar:
                        </label>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                        >
                            <option value={6}>6</option>
                            <option value={12}>12</option>
                            <option value={24}>24</option>
                            <option value={48}>48</option>
                        </select>
                    </div>
                )}

                <nav className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2"
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                    </Button>

                    {getPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === 'number' ? onPageChange(page) : null}
                            disabled={page === '...'}
                            className={`min-w-[2.5rem] px-2 py-1 rounded-md text-sm font-medium transition-colors ${page === currentPage
                                    ? 'bg-blue-600 text-white'
                                    : page === '...'
                                        ? 'text-gray-400 cursor-default'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <Button
                        variant="outline"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2"
                    >
                        <ChevronRightIcon className="w-4 h-4" />
                    </Button>
                </nav>
            </div>
        </div>
    );
};

export default Pagination;