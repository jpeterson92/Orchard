// The date every screen follows (product spec §4): the build's date in prerendered HTML, then the phone's own.
import { useEffect, useState } from "react";
import type { AppData } from "../shared/app-data";

const localIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Today's date as YYYY-MM-DD: the build date while prerendered, the device's after hydrating. */
export function useToday(data: AppData): string {
  const [iso, setIso] = useState(data.builtOn);
  useEffect(() => setIso(localIso(new Date())), []);
  return iso;
}
