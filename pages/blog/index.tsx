import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface Post {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  category: { name: string } | null;
}

export const getServerSideProps: GetServerSideProps<{ posts: Post[] }> = async () => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
    });

    const serializedPosts = posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      summary: post.summary || '',
      publishedAt: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      category: post.category ? { name: post.category.name } : null,
    }));

    return { props: { posts: serializedPosts } };
  } catch (error) {
    console.error('Error loading posts:', error);
    return { props: { posts: [] } };
  }
};

const BlogIndex: React.FC<{ posts: Post[] }> = ({ posts }) => {
  return (
    <section className="min-h-screen bg-[#0A1929] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-6xl font-black text-center text-[#CDAD5A] mb-12 uppercase tracking-wider">BLOG & TÀI NGUYÊN SEENYT</h1>
        {posts.length === 0 ? (
          <p className="text-center text-[#CDAD5A] text-2xl">Chưa có bài viết nào được xuất bản</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block bg-gray-900 rounded-xl p-8 hover:border-[#CDAD5A] border-2 border-transparent transition-all shadow-xl hover:shadow-[#CDAD5A]/40">
                <h2 className="text-2xl font-bold text-white mb-4">{post.title}</h2>
                {post.category && (
                  <span className="inline-block px-3 py-1 bg-[#008080] text-white text-xs font-bold rounded-full mb-3">
                    {post.category.name}
                  </span>
                )}
                <p className="text-gray-400 mb-4">{post.summary}</p>
                <span className="text-sm text-gray-500">{new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
                <span className="text-[#008080] ml-4 font-bold">Đọc thêm →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogIndex;
