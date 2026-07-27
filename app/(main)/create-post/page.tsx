import { Metadata } from "next";
import Uploads from "@/Components/Uploads";

export const metadata: Metadata = {
    title: "Create Post · Current",
    description: "Share a new photo or video post with your followers.",
};

export default function CreatePostPage() {
    return <Uploads type="post" />;
}