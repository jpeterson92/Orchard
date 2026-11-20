// Primary navigation (product spec §4, design system §6 "Navigation and icons"): a bottom tab bar on phone, the same
// destinations in the top bar from 600 px. The selected one is a restrained orange with a short underline.
import { NavLink } from "react-router";
import { BrowseIcon, CalendarIcon, TodayIcon } from "./icons";
import { SearchField } from "./Search";

const DESTINATIONS = [
  { to: "/", label: "Today", Icon: TodayIcon, end: true },
  { to: "/browse", label: "Browse", Icon: BrowseIcon, end: false },
  { to: "/calendar", label: "Calendar", Icon: CalendarIcon, end: true },
] as const;

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** In the masthead from 600 px; the tab bar takes over below. */
export function TopNav() {
  return (
    <nav aria-label="Main" className="hidden flex-1 sm:ml-4 sm:block">
      <ul className="flex gap-6">
        {DESTINATIONS.map(({ to, label, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex min-h-11 items-center rounded-sm font-medium ${focus} ${
                  isActive
                    ? "text-accent after:absolute after:inset-x-0 after:bottom-1.5 after:h-0.5 after:rounded-full after:bg-accent"
                    : "text-ink"
                }`
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Search stays in thumb reach. On reading and comparison pages it shares the navigation row. */
export function TabBar({ compactSearch }: { compactSearch: boolean }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 border-t border-rule bg-canvas pb-[env(safe-area-inset-bottom)] sm:hidden">
      {!compactSearch && (
        <div className="mx-auto max-w-2xl px-4 pt-2">
          <SearchField className="w-full" />
        </div>
      )}
      <nav aria-label="Main">
        <ul className="mx-auto flex max-w-2xl">
          {DESTINATIONS.map(({ to, label, Icon, end }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex h-14 flex-col items-center justify-center gap-0.5 rounded-sm text-xs font-medium ${focus} ${
                    isActive
                      ? "relative text-accent after:absolute after:bottom-0.5 after:h-0.5 after:w-5 after:rounded-full after:bg-current"
                      : "text-ink-secondary"
                  }`
                }
              >
                <Icon />
                {label}
              </NavLink>
            </li>
          ))}
          {compactSearch && (
            <li className="flex-1">
              <SearchField compact />
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}
