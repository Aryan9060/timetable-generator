import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setEditingEntityId, deleteMasterData, fetchMasterData } from '../../store/admin/adminSlice';

function DataTable({ currentEntityConfig, activeEntity }) {
    const dispatch = useDispatch();
    const masterData = useSelector((state) => state.admin.masterData);
    const pagination = useSelector((state) => state.admin.pagination);
    const entities = masterData[activeEntity] || [];
    const currentPagination = pagination[activeEntity] || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
    };

    //* Local state for pagination, search, sort, and filters
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

    //* Fetch data when pagination/search/sort/filters changes
    useEffect(() => {
        if (activeEntity) {
            const params = {
                page,
                limit,
                ...(searchQuery && { search: searchQuery }),
                ...(sortField && { sortBy: sortField, sortOrder }),
                //* Add field filters with filter_ prefix
                ...Object.entries(activeFilters).reduce((acc, [key, value]) => {
                    if (value !== undefined && value !== '') {
                        acc[`filter_${key}`] = String(value);
                    }
                    return acc;
                }, {}),
            };
            dispatch(fetchMasterData({ entityKey: activeEntity, params }));
        }
    }, [dispatch, activeEntity, page, limit, searchQuery, sortField, sortOrder, activeFilters]);



    //! Get filterable fields (boolean and select fields)
    const filterableFields = currentEntityConfig?.fields?.filter(field => 
        field.type === 'boolean' || field.type === 'select' || field.name === 'isActive'
    ) || [];

    //! Get unique values for filter dropdowns
    const getUniqueValues = (fieldName) => {
        const values = new Set();
        entities.forEach(entity => {
            const value = getFieldValue(entity, fieldName);
            if (value !== undefined && value !== null && value !== '') {
                values.add(value);
            }
        });
        return Array.from(values).sort();
    };

    //! Handle filter change
    const handleFilterChange = (fieldName, value) => {
        setActiveFilters(prev => ({
            ...prev,
            [fieldName]: value === '' ? undefined : value
        }));
        setPage(1);
    };

    //! Clear all filters
    const clearAllFilters = () => {
        setSearchQuery('');
        setActiveFilters({});
        setSortField(null);
        setSortOrder('asc');
        setPage(1);
    };

    //! Check if any filters are active
    const hasActiveFilters = searchQuery || Object.values(activeFilters).some(v => v !== undefined && v !== '');

    //! Handle edit entity
    const handleEditEntity = (entity) => {
        dispatch(setEditingEntityId(entity._id || entity.id));
    };

    //! Handle delete entity
    const handleDeleteEntity = (id) => {
        if(window.confirm("Are you sure you want to delete this record?")) {
            dispatch(deleteMasterData({ entityKey: activeEntity, id }));
        }
    };

    //! Helper function to get nested field value
    const getFieldValue = (entity, fieldName) => {
        if (fieldName.includes('.')) {
            const [parent, child] = fieldName.split('.');
            return entity[parent]?.[child];
        }
        return entity[fieldName];
    };

    //! Helper function to format cell value based on field type
    const formatCellValue = (value, field) => {
        if (value === undefined || value === null) return '-';
        
        if (field.type === 'boolean') {
            const isActiveField = field.name === 'isActive';
            if (isActiveField) {
                return value ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                        Active
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                        Inactive
                    </span>
                );
            }
            return value ? 'Yes' : 'No';
        }
        
        if (field.type === 'date' && value) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString();
            }
        }
        
        if (field.type === 'time' && value) {
            return value;
        }
        
        return value;
    };

    //! Handle page change
    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= currentPagination.totalPages) {
            setPage(newPage);
        }
    }, [currentPagination.totalPages, setPage]);

    //! Handle sort
    const handleSort = useCallback((fieldName) => {
        if (sortField === fieldName) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(fieldName);
            setSortOrder('asc');
        }
        setPage(1);
    }, [sortField, setSortField, setSortOrder, setPage]);

    //! Generate page numbers for display
    const getPageNumbers = () => {
        const { currentPage, totalPages } = currentPagination;
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages = [];
        const halfVisible = Math.floor(maxVisible / 2);
        let startPage = Math.max(1, currentPage - halfVisible);
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) pages.push('...');
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }

        return pages;
    };

    if (!currentEntityConfig) return null;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-xl font-semibold text-text">
                    Existing {currentEntityConfig.pluralLabel}
                </h3>
                <div className="flex items-center gap-2 text-sm text-text/60">
                    <span>Total: {currentPagination.totalItems}</span>
                </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-text/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder={`Search ${currentEntityConfig.pluralLabel.toLowerCase()}...`}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-text placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setPage(1);
                                }}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text/40 hover:text-text transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Filter Toggle Button */}
                    {filterableFields.length > 0 && (
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`group relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ease-out shadow-sm hover:shadow-md active:scale-95 ${
                                showFilters || Object.keys(activeFilters).some(k => activeFilters[k] !== undefined)
                                    ? 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-primary/25 hover:shadow-primary/40'
                                    : 'bg-surface text-text/80 hover:bg-surface-hover hover:text-text border border-border/50 hover:border-border'
                            }`}
                        >
                            {/* Filter Icon with Animation */}
                            <span className={`relative transition-transform duration-200 ${showFilters ? 'rotate-180' : 'group-hover:rotate-12'}`}>
                                <svg 
                                    className="h-5 w-5" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                    strokeWidth={showFilters || Object.keys(activeFilters).some(k => activeFilters[k] !== undefined) ? 2.5 : 2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                {/* Active Filter Indicator Dot */}
                                {Object.keys(activeFilters).filter(k => activeFilters[k] !== undefined).length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white dark:border-surface animate-pulse"></span>
                                )}
                            </span>
                            
                            <span>Filters</span>
                            
                            {/* Filter Count Badge */}
                            {Object.keys(activeFilters).filter(k => activeFilters[k] !== undefined).length > 0 && (
                                <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-xs font-bold bg-white/20 text-white rounded-full backdrop-blur-sm">
                                    {Object.keys(activeFilters).filter(k => activeFilters[k] !== undefined).length}
                                </span>
                            )}
                            
                            {/* Expand/Collapse Chevron */}
                            <svg 
                                className={`h-4 w-4 ml-1 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    )}

                    {/* Clear All Button */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-text/70 hover:text-red-500 transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Clear All
                        </button>
                    )}
                </div>

                {/* Expandable Filter Panel */}
                {showFilters && filterableFields.length > 0 && (
                    <div className="p-4 bg-surface border border-border rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filterableFields.map((field) => (
                                <div key={field.name} className="space-y-1">
                                    <label className="text-sm font-medium text-text/70">
                                        {field.label}
                                    </label>
                                    {field.type === 'boolean' || field.name === 'isActive' ? (
                                        <select
                                            value={activeFilters[field.name] ?? ''}
                                            onChange={(e) => handleFilterChange(field.name, e.target.value === '' ? undefined : e.target.value === 'true')}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                        >
                                            <option value="">All</option>
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    ) : field.type === 'select' && field.options ? (
                                        <select
                                            value={activeFilters[field.name] ?? ''}
                                            onChange={(e) => handleFilterChange(field.name, e.target.value === '' ? undefined : e.target.value)}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                        >
                                            <option value="">All {field.label}</option>
                                            {field.options.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <select
                                            value={activeFilters[field.name] ?? ''}
                                            onChange={(e) => handleFilterChange(field.name, e.target.value === '' ? undefined : e.target.value)}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                        >
                                            <option value="">All {field.label}</option>
                                            {getUniqueValues(field.name).map((value) => (
                                                <option key={String(value)} value={String(value)}>
                                                    {String(value)}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm text-left text-text/80">
                    <thead className="text-xs text-text font-medium bg-surface-hover border-b border-border">
                        <tr>
                            {currentEntityConfig.fields.map((field) => (
                                <th 
                                    key={field.name} 
                                    className="px-6 py-4 font-semibold cursor-pointer select-none hover:bg-surface-hover/80 transition-colors"
                                    onClick={() => handleSort(field.name)}
                                >
                                    <div className="flex items-center gap-1">
                                        {field.label}
                                        {sortField === field.name && (
                                            <svg 
                                                className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} 
                                                fill="none" 
                                                viewBox="0 0 24 24" 
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                            </svg>
                                        )}
                                        {sortField !== field.name && (
                                            <svg className="h-4 w-4 text-text/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                            </svg>
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className='bg-surface'>
                        {entities?.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={currentEntityConfig.fields.length + 1}
                                    className="px-6 py-8 text-center text-text/60"
                                >
                                    No {currentEntityConfig.pluralLabel} found.
                                </td>
                            </tr>
                        ) : (
                            entities?.map((entity) => (
                                <tr
                                    key={entity._id || entity.id}
                                    className={`border-b border-border hover:bg-surface-hover transition-colors ${
                                        entity.isActive === false
                                            ? 'bg-red-50/50 dark:bg-red-900/10'
                                            : entity.isActive === true
                                            ? 'bg-green-50/50 dark:bg-green-900/10'
                                            : ''
                                    }`}
                                >
                                    {currentEntityConfig.fields.map((field) => (
                                        <td key={field.name} className="px-6 py-4 text-text/90">
                                            {formatCellValue(getFieldValue(entity, field.name), field)}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEditEntity(entity)}
                                            className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-md hover:bg-primary/20 transition-colors"
                                            title="Edit"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEntity(entity._id || entity.id)}
                                            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100/50 border border-red-200 rounded-md hover:bg-red-100 transition-colors dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-900/50"
                                            title="Delete"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {currentPagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2 text-sm text-text/70">
                        <span>Show</span>
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            className="px-2 py-1 bg-surface border border-border rounded text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>entries per page</span>
                    </div>

                    {/* Page info */}
                    <div className="text-sm text-text/70">
                        Showing <span className="font-medium text-text">{currentPagination.startIndex + 1}</span> to{' '}
                        <span className="font-medium text-text">{currentPagination.endIndex}</span> of{' '}
                        <span className="font-medium text-text">{currentPagination.totalItems}</span> entries
                    </div>

                    {/* Page navigation */}
                    <div className="flex items-center gap-1">
                        {/* Previous button */}
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={!currentPagination.hasPrevPage}
                            className="px-3 py-2 text-sm font-medium rounded-lg border border-border bg-surface text-text/70 hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Page numbers */}
                        <div className="hidden sm:flex items-center gap-1">
                            {getPageNumbers().map((pageNum, idx) => (
                                pageNum === '...' ? (
                                    <span key={`ellipsis-${idx}`} className="px-3 py-2 text-text/40">...</span>
                                ) : (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                            pageNum === currentPagination.currentPage
                                                ? 'bg-primary text-white border-primary'
                                                : 'bg-surface text-text/70 border-border hover:bg-surface-hover'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            ))}
                        </div>

                        {/* Mobile page indicator */}
                        <div className="sm:hidden px-3 py-2 text-sm text-text/70">
                            {currentPagination.currentPage} / {currentPagination.totalPages}
                        </div>

                        {/* Next button */}
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={!currentPagination.hasNextPage}
                            className="px-3 py-2 text-sm font-medium rounded-lg border border-border bg-surface text-text/70 hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Single page with many items - show items per page selector */}
            {currentPagination.totalPages === 1 && currentPagination.totalItems > 10 && (
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-text/70">
                        <span>Show</span>
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            className="px-2 py-1 bg-surface border border-border rounded text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>entries per page</span>
                    </div>
                    <div className="text-sm text-text/70">
                        Showing <span className="font-medium text-text">{currentPagination.startIndex + 1}</span> to{' '}
                        <span className="font-medium text-text">{currentPagination.endIndex}</span> of{' '}
                        <span className="font-medium text-text">{currentPagination.totalItems}</span> entries
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataTable;