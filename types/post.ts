export interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  author_id: string | null;
  cover_image?: string | null;
  author?: {
    email: string;
  };
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
