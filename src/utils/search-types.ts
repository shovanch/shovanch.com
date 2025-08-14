/**
 * Search and filtering related types
 */

export type SearchParams = {
  tag?: string;
  query?: string;
};

export type FilterOptions = {
  tags?: string[];
  contentType?: 'post' | 'note' | 'all';
  dateRange?: {
    start?: string;
    end?: string;
  };
};
