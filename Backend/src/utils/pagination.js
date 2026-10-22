/**
 *! Pagination utility for API responses
 */

/**
 *! Create paginated response
 * @param {Array} data - Full dataset
 * @param {number} page - Current page number (1-based)
 * @param {number} limit - Items per page
 * @param {Object} options - Additional options
 * @returns {Object} Paginated response object
 */
export const paginate = (data, page = 1, limit = 20, options = {}) => {
  const { sortBy, sortOrder = "asc", filter } = options;

  let processedData = [...data];

  //* Apply filtering if provided
  if (filter && typeof filter === "function") {
    processedData = processedData.filter(filter);
  }

  //* Apply sorting if provided
  if (sortBy) {
    processedData.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortOrder === "desc") {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });
  }

  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / limit);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedData = processedData.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      startIndex,
      endIndex: Math.min(endIndex, totalItems),
    },
  };
};

/**
 *! Parse pagination parameters from request query
 * @param {Object} query - Express request query object
 * @param {Object} defaults - Default values
 * @returns {Object} Parsed pagination parameters
 */
export const parsePaginationParams = (
  query,
  defaults = { page: 1, limit: 20, maxLimit: 1000 }
) => {
  let page = parseInt(query.page, 10) || defaults.page;
  let limit = parseInt(query.limit, 10) || defaults.limit;

  //* Ensure positive values
  page = Math.max(1, page);
  limit = Math.max(1, Math.min(limit, defaults.maxLimit));

  return { page, limit };
};

/**
 *! Create pagination headers for response
 * @param {Object} pagination - Pagination metadata
 * @returns {Object} Headers object
 */
export const createPaginationHeaders = (pagination) => {
  return {
    "X-Total-Count": pagination.totalItems.toString(),
    "X-Page-Count": pagination.totalPages.toString(),
    "X-Current-Page": pagination.currentPage.toString(),
    "X-Per-Page": pagination.itemsPerPage.toString(),
  };
};

/**
 *! MongoDB pagination helper for mongoose queries
 * @param {Model} model - Mongoose model
 * @param {Object} filter - MongoDB filter query
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {Object} options - Query options (sort, select, populate)
 * @returns {Promise<Object>} Paginated results
 */
export const paginateMongoose = async (
  model,
  filter = {},
  page = 1,
  limit = 20,
  options = {}
) => {
  const { sort = { createdAt: -1 }, select, populate } = options;

  const skip = (page - 1) * limit;

  // Build query
  let query = model.find(filter).sort(sort).skip(skip).limit(limit);

  if (select) query = query.select(select);
  if (populate) query = query.populate(populate);

  // Execute queries in parallel
  const [data, totalItems] = await Promise.all([
    query.exec(),
    model.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      startIndex: skip,
      endIndex: skip + data.length,
    },
  };
};

export default {
  paginate,
  parsePaginationParams,
  createPaginationHeaders,
  paginateMongoose,
};
