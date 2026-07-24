import { permanentRedirect } from "next/navigation";

// /arbeiten without a slug: the wall itself lives on "/", so the bare parent
// folds into it (every detail URL advertises /arbeiten/ as a directory, and
// people will try it).
export default function ArbeitenIndex() {
  permanentRedirect("/");
}
