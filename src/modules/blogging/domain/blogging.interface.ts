export type PostStatus = 'draft' | 'published';

export interface AuthorVm {
    id: string;
    username?: string;
    email?: string;
    firstname?: string;
    lastname?: string;
    fullName?: string;
}

export interface CategoryVm {
    id: string;
    title: string;
    description?: string;
    createdAt?: string;
}

export interface PostVm {
    id: string;
    slug: string;
    title: string;
    description?: string;
    content?: string;
    publishedAt?: string;
    author?: AuthorVm;
    categories?: CategoryVm[];
    createdAt?: string;
    updatedAt?: string;
    collaborators?: CollaboratorVm[];
    media?: PostMediaVm[];
    tags?: PostTagVm[];
    versions?: PostVersionVm[];
    status?: PostStatus;
}

export interface CollaboratorVm {
    id: string;
    userId: string;
    username?: string;
    email?: string;
}

export interface PostMediaVm {
    id: string;
    mediaId: string;
    filename?: string;
    type?: string;
    label?: string;
}

export interface PostTagVm {
    id: string;
    label: string;
}

export interface PostVersionVm {
    id: string;
    versionName: string;
    payload?: Record<string, unknown>;
    createdAt?: string;
}

export interface PostAnalyticsSummary {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalCategories: number;
}

export interface PostByCategory {
    categoryId: string;
    categoryTitle: string;
    count: number;
}

export interface RecentPost {
    id: string;
    title: string;
    slug: string;
    publishedAt?: string;
    authorName?: string;
}

export interface PostOverTime {
    date: string;
    count: number;
}

export interface PostAnalyticsVm {
    summary: PostAnalyticsSummary;
    postsByCategory?: PostByCategory[];
    recentPosts?: RecentPost[];
    postsOverTime?: PostOverTime[];
}

export interface CreatePostInterface {
    title: string;
    slug?: string;
    description?: string;
    content?: string;
    categoryIds?: string[];
    tagLabels?: string[];
    publishedAt?: string;
}

export interface UpdatePostInterface {
    title?: string;
    slug?: string;
    description?: string;
    content?: string;
    categoryIds?: string[];
    tagLabels?: string[];
    publishedAt?: string;
}

export interface CreateCategoryInterface {
    title: string;
    description?: string;
}

export interface UpdateCategoryInterface {
    title?: string;
    description?: string;
}

export interface CommitPostInterface {
    versionName?: string;
    payload?: Record<string, unknown>;
}

export interface PostFilterOptions {
    search?: string;
    categoryId?: string;
    status?: PostStatus;
    page?: number;
    limit?: number;
}
