import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Overview | Creator Analytics" }];
}

export default function Home() {
  return <h1 className="text-2xl font-semibold">Overview</h1>;
}
