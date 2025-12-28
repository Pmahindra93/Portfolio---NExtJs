"use client";

import { Post } from "@/types/post";
import { useTheme } from "@/lib/hooks/useTheme";
import { RecentPosts } from "@/app/components/RecentPosts";
import { useRouter } from "next/navigation";

interface BlogPageClientProps {
  posts: Post[];
}

export default function BlogPageClient({ posts }: BlogPageClientProps) {
  const { is90sStyle } = useTheme();
  const router = useRouter();

  const handlePostDeleted = () => {
    router.refresh();
  };

  return (
    <main
      className={`flex-1 p-8 ${
        is90sStyle
          ? 'bg-[#C0C0C0] text-[#000080] font-["Comic_Sans_MS",_cursive]'
          : "bg-background text-foreground"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <RecentPosts posts={posts} onPostDeleted={handlePostDeleted} />
      </div>
    </main>
  );
}
