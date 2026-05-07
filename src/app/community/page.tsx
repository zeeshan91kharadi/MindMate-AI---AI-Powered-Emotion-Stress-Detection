import { CommunityWall } from "@/components/community/community-wall";
import { Users } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="p-4 md:p-8">
        <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Users/> Anonymous Community Wall</h1>
            <p className="text-muted-foreground">Share your thoughts anonymously with the community.</p>
        </header>
        <CommunityWall />
    </div>
  );
}
