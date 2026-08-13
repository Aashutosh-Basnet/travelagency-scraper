import { Link } from "react-router-dom";
import Header from "../../components/static/Navbar";
import Footer from "../../components/static/Footer";
import heroImage from "../../assets/hero.png";

function Landing() {
  return (
    <div className="min-h-screen text-[#181716] bg-[#f8f5ef]">
      <Header />

      <main className="mx-auto w-[min(1180px,calc(100%-2rem))]">
        <section className="pb-16 pt-16 max-md:pt-12">
          <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <div>
              <h1 className="m-0 max-w-[11ch] font-serif text-[clamp(3.4rem,8vw,6.6rem)] leading-[0.95] tracking-[-0.05em]">
                Human stories & ideas
              </h1>
              <p className="mt-5 max-w-[60ch] text-lg leading-8 text-neutral-500">
                A focused editorial platform for modern readers and writers.
                Discover stories, express your ideas, and manage your posts with
                a simple reading-first layout.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/dashboard"
                  className="rounded-full bg-black px-6 py-3.5 font-semibold text-white shadow-[0_10px_24px_rgba(17,17,17,0.12)] transition hover:-translate-y-0.5 no-underline"
                >
                  Start Reading
                </Link>
                <Link
                  to="/register"
                  className="rounded-full border border-black/20 bg-white px-6 py-3.5 font-semibold text-neutral-800 transition hover:bg-neutral-50 no-underline"
                >
                  Create Account
                </Link>
              </div>
            </div>

            <aside className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-xl">
              <img
                src={heroImage}
                alt="Editorial workspace"
                className="aspect-[4/3] w-full object-cover"
              />
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Landing;