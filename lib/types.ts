export interface Post {
  id: string
  title: string
  content: string
  published: boolean
  created_at: string
  updated_at: string
  author_id: string
  cover_image?: string
}

export interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  created_at: string
}

export interface PostImage {
  id: string
  post_id: string
  url: string
  created_at: string
}
