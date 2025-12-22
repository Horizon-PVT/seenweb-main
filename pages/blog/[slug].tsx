import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import Link from 'next/link';

export async function getStaticPaths() {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const filenames = fs.readdirSync(postsDirectory);
  const paths = filenames.map((filename) => ({
    params: { slug: filename.replace('.mdx', '') },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const filePath = path.join(process.cwd(), 'posts', `${params.slug}.mdx`);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  const mdxSource = await serialize(content);

  return {
    props: {
      frontMatter: data,
      source: mdxSource,
    },
  };
}

const BlogPost: React.FC<{ frontMatter: any; source: any }> = ({ frontMatter, source }) => {
  return (
    <article className="min-h-screen bg-[#0A1929] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Nút quay lại về phần blog trên trang chủ */}
        <Link
          href="/#blog-section"
          className="inline-block mb-8 text-[#CDAD5A] hover:text-[#008080] font-bold text-lg flex items-center gap-2 transition-colors"
        >
          ← Quay lại phần Blog trên trang chủ
        </Link>

        <h1 className="text-4xl md:text-5xl font-black text-[#CDAD5A] mb-6 leading-tight">
          {frontMatter.title}
        </h1>
        <p className="text-gray-300 mb-8 text-lg italic">
          {frontMatter.description}
        </p>
        <div className="prose prose-invert prose-lg max-w-none prose-headings:text-[#CDAD5A] prose-headings:font-black prose-a:text-[#008080] prose-a:hover:underline prose-strong:text-[#CDAD5A] prose-blockquote:border-l-[#CDAD5A] prose-blockquote:text-gray-300">
          <MDXRemote {...source} />
        </div>
      </div>
    </article>
  );
};

export default BlogPost;