import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { GetStaticProps } from 'next';

interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
}

export const getStaticProps: GetStaticProps<{ posts: Post[] }> = async () => {
  const postsDirectory = path.join(process.cwd(), 'posts');
  let posts: Post[] = [];

  try {
    const filenames = fs.readdirSync(postsDirectory).filter(file => file.endsWith('.mdx'));

    posts = filenames.map((filename) => {
      const filePath = path.join(postsDirectory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);

      if (!data.title || !data.description || !data.date) {
        console.warn(`File ${filename} thiếu frontmatter! Cần title, description, date.`);
      }

      return {
        slug: filename.replace('.mdx', ''),
        title: data.title || '(Thiếu tiêu đề - fix frontmatter)',
        description: data.description || '(Thiếu mô tả - fix frontmatter)',
        date: data.date || '2025-12-22',
      };
    });

    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error loading posts:', error);
  }

  return { props: { posts } };
};

const BlogIndex: React.FC<{ posts: Post[] }> = ({ posts }) => {
  return (
    <section className="min-h-screen bg-[#0A1929] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-6xl font-black text-center text-[#CDAD5A] mb-12 uppercase tracking-wider">BLOG & TÀI NGUYÊN SEENYT</h1>
        {posts.length === 0 ? (
          <p className="text-center text-[#CDAD5A] text-2xl">Chưa có bài viết hoặc lỗi load posts. Check console!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block bg-gray-900 rounded-xl p-8 hover:border-[#CDAD5A] border-2 border-transparent transition-all shadow-xl hover:shadow-[#CDAD5A]/40">
                <h2 className="text-2xl font-bold text-white mb-4">{post.title}</h2>
                <p className="text-gray-400 mb-4">{post.description}</p>
                <span className="text-sm text-gray-500">{new Date(post.date).toLocaleDateString('vi-VN')}</span>
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