import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";

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
      where: { status: "PUBLISHED" },
      include: { category: true },
      orderBy: { publishedAt: "desc" },
    });

    const serializedPosts = posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      summary: post.summary || "",
      publishedAt: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      category: post.category ? { name: post.category.name } : null,
    }));

    return { props: { posts: serializedPosts } };
  } catch (error) {
    console.error("Error loading posts:", error);
    return { props: { posts: [] } };
  }
};

export default function BlogIndex({ posts }: { posts: Post[] }) {
  return (
    <div className="min-h-screen bg-[#05080d] text-white">
      <Head>
        <title>Blog - SeenYT</title>
        <meta name="description" content="SeenYT blog for YouTube creator workflows, niche research, production, SEO, and AI coaching." />
      </Head>
      <Header />
      <main className="px-4 pb-20 pt-32 sm:px-6">
        <section className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-200">
            Creator resources
          </div>
          <h1 className="text-4xl font-black sm:text-6xl">Blog & tài nguyên SeenYT</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-400">
            Bài viết về nghiên cứu ngách, sản xuất video, tối ưu SEO và vận hành kênh YouTube bằng workflow.
          </p>
        </section>

        {posts.length === 0 ? (
          <div className="mx-auto mt-14 max-w-2xl rounded-xl border border-white/10 bg-white/[0.04] p-8 text-center text-slate-400">
            Chưa có bài viết nào được xuất bản.
          </div>
        ) : (
          <section className="mx-auto mt-14 grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-cyan-300/50">
                {post.category && (
                  <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-200">
                    {post.category.name}
                  </span>
                )}
                <h2 className="mt-4 text-2xl font-black text-white">{post.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">{post.summary}</p>
                <div className="mt-5 text-sm font-bold text-slate-500">
                  {new Date(post.publishedAt).toLocaleDateString("vi-VN")}
                </div>
              </Link>
            ))}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
