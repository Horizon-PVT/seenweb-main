import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ReactMarkdown from 'react-markdown';

interface BlogPost {
  title: string;
  summary: string;
  content: string;
  coverImage: string | null;
  publishedAt: string;
  category: { name: string } | null;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params?.slug as string },
      include: { category: true },
    });

    if (!post || post.status !== 'PUBLISHED') {
      return { notFound: true };
    }

    return {
      props: {
        post: {
          title: post.title,
          summary: post.summary,
          content: post.content,
          coverImage: post.coverImage,
          publishedAt: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
          category: post.category ? { name: post.category.name } : null,
        },
      },
    };
  } catch (error) {
    console.error('Error loading post:', error);
    return { notFound: true };
  }
};

const BlogPost: React.FC<{ post: BlogPost }> = ({ post }) => {
  return (
    <article className="min-h-screen bg-[#0A1929] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/blog"
          className="inline-block mb-8 text-[#CDAD5A] hover:text-[#008080] font-bold text-lg flex items-center gap-2 transition-colors"
        >
          ← Quay lại danh sách blog
        </Link>

        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-96 object-cover rounded-xl mb-8"
          />
        )}

        {post.category && (
          <span className="inline-block px-4 py-2 bg-[#008080] text-white text-sm font-bold rounded-full mb-4">
            {post.category.name}
          </span>
        )}

        <h1 className="text-4xl md:text-5xl font-black text-[#CDAD5A] mb-6 leading-tight">
          {post.title}
        </h1>

        {post.summary && (
          <p className="text-gray-300 mb-8 text-lg italic">
            {post.summary}
          </p>
        )}

        <div className="prose prose-invert prose-lg max-w-none prose-headings:text-[#CDAD5A] prose-headings:font-black prose-a:text-[#008080] prose-a:hover:underline prose-strong:text-[#CDAD5A] prose-blockquote:border-l-[#CDAD5A] prose-blockquote:text-gray-300 prose-code:text-[#CDAD5A] prose-code:bg-gray-800 prose-pre:bg-gray-800">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            Xuất bản: {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
          </p>
        </div>
      </div>
    </article>
  );
};

export default BlogPost;
