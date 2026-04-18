import AsideBar from "@/Components/AsideBar";
import Posts from "@/Components/Posts";
import Stories from "@/Components/Stories";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/nextAuth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  return (
    <main className=" flex w-full h-full md:gap-4 overflow-hidden">
      <section className="w-full md:w-2/3 ">
        <div>
          <Stories />
        </div>
        <Posts />
      </section>
      <section className="hidden md:flex w-1/3 border-l border-l-zinc-700">
        <AsideBar />
      </section>
    </main>
  );
}
