export interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
  cover_image?: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
  published?: boolean;
  cover_image?: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  published?: boolean;
  cover_image?: string;
}
