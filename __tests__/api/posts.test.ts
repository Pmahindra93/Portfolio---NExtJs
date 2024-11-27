import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/posts/route'
import { supabase } from '@/lib/supabase'

// Mock NextResponse
jest.mock('next/server', () => {
  return {
    ...jest.requireActual('next/server'),
    NextResponse: {
      json: (body: any, init?: ResponseInit) => {
        return new Response(JSON.stringify(body), {
          ...init,
          headers: {
            'content-type': 'application/json',
            ...(init?.headers || {})
          }
        })
      }
    }
  }
})

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          returns: jest.fn().mockResolvedValue({
            data: [
              {
                id: '1',
                title: 'Test Post',
                content: 'Test Content',
                published: true,
                created_at: '2023-01-01',
                updated_at: '2023-01-01'
              }
            ],
            error: null
          })
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            returns: jest.fn().mockResolvedValue({
              data: {
                id: '2',
                title: 'New Post',
                content: 'New Content',
                published: false,
                created_at: '2023-01-02',
                updated_at: '2023-01-02'
              },
              error: null
            })
          }))
        }))
      }))
    }))
  }
}))

describe('Posts API', () => {
  describe('GET /api/posts', () => {
    it('returns posts successfully', async () => {
      const req = new Request('http://localhost:3000/api/posts')
      const response = await GET(req)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].title).toBe('Test Post')
    })

    it('handles database errors', async () => {
      // Mock error response
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            returns: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          }))
        }))
      }))

      const req = new Request('http://localhost:3000/api/posts')
      const response = await GET(req)
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data.error).toBe('Error fetching posts')
    })
  })

  describe('POST /api/posts', () => {
    it('creates a post successfully', async () => {
      const req = new Request('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Post',
          content: 'New Content',
          published: false
        })
      })

      const response = await POST(req)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data.title).toBe('New Post')
    })

    it('validates required fields', async () => {
      const req = new Request('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '',
          content: ''
        })
      })

      const response = await POST(req)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Title and content are required')
    })
  })
})
