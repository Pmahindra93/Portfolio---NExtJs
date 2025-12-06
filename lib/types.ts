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
  cover_image?: string | null
  published: boolean | null
  author_id: string | null
  created_at: string | null
  updated_at: string | null
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
