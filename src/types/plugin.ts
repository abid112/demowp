export interface Plugin {
  plugin: string;
  title: string;
  file: string;
  type: string;
  description: string;
  fileSize?: string;
  icon?: string;
}

export interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export interface PluginTableProps {
  plugins: Plugin[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
