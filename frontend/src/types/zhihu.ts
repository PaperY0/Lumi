export type ZhihuCategory =
  | 'science'
  | 'communication'
  | 'action'
  | 'realQuestion'
  | 'repair'
  | 'boundaries'
  | 'interestConnection';

export interface ZhihuSearchRequest {
  query: string;
  count?: number;
  sortBy?: string;
}

export interface ZhihuSearchItem {
  title: string;
  contentType: string;
  contentId: string;
  contentText: string;
  url: string;
  commentCount: number;
  voteUpCount: number;
  authorName: string;
  editTime: number;
  authorityLevel: string;
  rankingScore: number;
}

export interface ZhihuSearchData {
  hasMore: boolean;
  searchHashId: string;
  items: ZhihuSearchItem[];
  emptyReason?: string;
}

export interface CuratedZhihuArticle {
  id: string;
  zhihuContentId: string;
  category: ZhihuCategory;
  title: string;
  summary: string;
  contentType: string;
  authorName: string;
  voteUpCount: number;
  commentCount: number;
  url: string;
  tags: string[];
  lumiReason: string;
  stages: string[];
}
