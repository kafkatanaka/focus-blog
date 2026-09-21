export type CobwYoutubeStatus = 'not_started' | 'in_progress' | 'rendered' | 'published';

export type CobwArticleStatus =
  | 'not_created'
  | 'generating'
  | 'draft'
  | 'review'
  | 'published'
  | 'failed';

export type CobwRegistryIdea = {
  cobw_id: string;
  title: string;
  category: string;
  premise: string;
  idea_status?: string;
  youtube_status: CobwYoutubeStatus;
  youtube_video_id: string | null;
  youtube_url: string | null;
  youtube_published_at: string | null;
};

export type CobwRegistry = {
  schema_version: number;
  generated_at: string;
  ideas: CobwRegistryIdea[];
};

export type CobwLocalIdea = {
  cobwId: string;
  sourceTitle: string;
  sourceCategory: string;
  sourcePremise: string;
  youtubeStatus: CobwYoutubeStatus;
  youtubeUrl: string | null;
  youtubeVideoId: string | null;
  articleStatus: CobwArticleStatus;
  articleSlug: string | null;
  articleUrl: string | null;
  articleTitle: string | null;
  seoTitle: string | null;
  lastSyncedAt: string | null;
};

export type CobwSyncState = {
  schemaVersion: number;
  registryUrl: string;
  lastSyncedAt: string | null;
  ideas: Record<string, CobwLocalIdea>;
};

export type CobwSharedEvidence = {
  sourceId: string;
  title: string;
  publisher?: string;
  url: string;
  publishedAt?: string;
  claim: string;
};

export type CobwVideoPublishedPayload = {
  cobw_id: string;
  youtube_video_id: string;
  youtube_url: string;
  published_at?: string;
};
