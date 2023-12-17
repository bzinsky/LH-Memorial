"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useIsLoggedIn } from "@/app/loginService";

const links = [
  { to: "/", label: "Home" },
  { to: "/condolences", label: "Condolences" },
  { to: "/memories", label: "Memories" },
  { to: "/photos", label: "Photos" },
  { to: "/videos", label: "Videos" },
];

export function Header() {
  const pathname = usePathname();
  const [isLoggedIn] = useIsLoggedIn();

  return isLoggedIn ? (
    <nav className="sticky top-0 flex justify-center py-6 bg-neutral-900">
      {/* On small screens, make the navbar wrap */}
      <ul className="flex container justify-between flex-wrap">
        {links.map(({ to, label }) => (
          <li key={label + to}>
            {/*If this is the active link, change the color to indigo*/}
            <Link
              href={to}
              className={
                (pathname === to
                  ? "text-white font-semibold border-b-2 border-orange-500"
                  : "text-gray-500 hover:text-gray-400 hover:border-b-2 hover:border-orange-300") +
                " px-4 py-2"
              }
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  ) : (
    <> </>
  );
}
