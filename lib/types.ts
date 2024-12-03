export interface Profile {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  title: string
  content: string
  cover_image?: string
  published: boolean
  author_id: string
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface CreatePostInput {
  title: string
  content: string
  cover_image?: string
  published?: boolean
}

export interface UpdatePostInput {
  title?: string
  content?: string
  cover_image?: string
  published?: boolean
}
