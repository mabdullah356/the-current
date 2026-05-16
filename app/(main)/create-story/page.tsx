import { Metadata } from "next";
import Uploads from "@/Components/Uploads";

export const metadata: Metadata = {
  title: "Create Story · PixelFeed",
  description: "Share a photo or video story that disappears after 24 hours.",
};

export default function CreateStoryPage() {
  return <Uploads type="story" />;
}