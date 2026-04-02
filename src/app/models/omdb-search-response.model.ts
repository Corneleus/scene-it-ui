import { OmdbSearchItem } from './omdb-search-item.model';

export interface OmdbSearchResponse {
  Search?: OmdbSearchItem[];
  Response?: string;
  Error?: string;
}
