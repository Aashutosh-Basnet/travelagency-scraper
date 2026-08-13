import { Link } from "react-router-dom";
import { FiBell, FiEdit3, FiMenu } from "react-icons/fi";
import Searchbar from "../ui/Searchbar";

function Header() {
  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex justify-around items-center gap-4 p-3">
        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-black/5 hover:text-neutral-900"
          aria-label="Open menu"
        >
          <FiMenu size={24} />
        </button>

        <Link
          to="/"
          className="inline-flex shrink-0 items-center text-inherit no-underline"
          aria-label="Medium home"
        >
          <span className="font-serif text-[2rem] font-semibold tracking-[-0.06em] text-[#181716] md:text-[2.15rem]">
            Medium
          </span>
        </Link>

        <div className="min-w-0 flex-1 md:max-w-[420px]">
          <Searchbar placeholder="Search" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/register"
            className="inline-flex h-11 items-center gap-3 rounded-full bg-[#181716] px-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10">
              <FiMenu size={14} />
            </span>
            <span>Get app</span>
          </Link>

          <Link
            to="/write"
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-black/5 md:inline-flex"
          >
            <FiEdit3 size={18} />
            <span>Write</span>
          </Link>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 transition hover:bg-black/5 hover:text-neutral-900"
            aria-label="Notifications"
          >
            <FiBell size={20} />
          </button>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#7cb342] text-white"
            aria-label="Account"
          >
            <span className="text-sm font-semibold leading-none">A</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;