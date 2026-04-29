import { Suspense } from "react";
import SearchClient from "./client";

export default function SearchPage() {
  return (
    <Suspense>
      <SearchClient />
    </Suspense>
  );
}
