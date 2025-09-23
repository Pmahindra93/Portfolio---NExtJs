"use client";

import { useState } from "react";
import MarkdownEditor from "@/components/MarkdownEditor";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { deriveTitleFromContent } from "@/lib/posts";

export default function NewPost() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      toast({
        title: "Error",
        description: "Content is required",
        variant: "destructive",
      });
      return;
    }

    const title = deriveTitleFromContent(trimmedContent, "");

    if (!title) {
      toast({
        title: "Add a title",
        description: "Start your post with a descriptive first line to use as the title.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          title,
          content: trimmedContent,
          published: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create post');
      }

      toast({
        title: "Success!",
        description: "Blog post created successfully",
      });

      router.push("/blog");
      router.refresh();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create blog post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Create New Blog Post</h1>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Post"}
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            Content
          </label>
          <p className="text-sm text-muted-foreground mb-2">
            The first non-empty line becomes the post title.
          </p>
          <MarkdownEditor
            value={content}
            onChange={setContent}
          />
        </div>
      </form>
    </div>
  );
}
