import { Link } from "react-router-dom";

function Header() {
  return (
    // display: flex, border: solid 1px black; 
    <header className="sticky flex top-0 z-20 border-b border-black/10 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="inline-flex items-center gap-3 text-inherit no-underline">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-black text-[1.35rem] font-serif text-white">
            M
          </span>
          <span>
            <strong className="block font-serif text-[1.15rem] tracking-[-0.03em]">Medium</strong>
            <span className="text-sm text-neutral-500">Thoughtful stories</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-neutral-500 max-md:justify-start">
          <a className="transition hover:text-neutral-900" href="#stories">
            Stories
          </a>
          <a className="transition hover:text-neutral-900" href="#topics">
            Topics
          </a>
          <a className="transition hover:text-neutral-900" href="#writers">
            Writers
          </a>
          <div className="flex items-center gap-3 max-md:justify-start">
            <Link to="/login" className="text-neutral-500 transition hover:text-neutral-900">
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-black px-4 py-3 font-semibold text-white shadow-[0_10px_24px_rgba(17,17,17,0.12)] transition hover:-translate-y-0.5"
            >
              Get started
            </Link>
          </div>
        </nav>


      </div>
    </header>
  );
}

export default Header;