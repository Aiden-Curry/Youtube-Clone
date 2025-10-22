import { VideoCard } from "@/components/video-card";

const mockVideos = [
  {
    id: 1,
    title: "Getting Started with Next.js 14 - Complete Tutorial",
    channel: "Web Dev Pro",
    views: "125K views",
    timestamp: "2 days ago",
  },
  {
    id: 2,
    title: "Building Modern UIs with Tailwind CSS",
    channel: "Design Masters",
    views: "89K views",
    timestamp: "5 days ago",
  },
  {
    id: 3,
    title: "TypeScript Best Practices in 2024",
    channel: "Code Academy",
    views: "203K views",
    timestamp: "1 week ago",
  },
  {
    id: 4,
    title: "React Server Components Explained",
    channel: "React Weekly",
    views: "156K views",
    timestamp: "3 days ago",
  },
  {
    id: 5,
    title: "Database Design Fundamentals",
    channel: "Tech Education",
    views: "78K views",
    timestamp: "1 week ago",
  },
  {
    id: 6,
    title: "Advanced Git Techniques",
    channel: "Developer Tools",
    views: "92K views",
    timestamp: "4 days ago",
  },
  {
    id: 7,
    title: "REST API vs GraphQL - Which to Choose?",
    channel: "Backend Bytes",
    views: "134K views",
    timestamp: "2 weeks ago",
  },
  {
    id: 8,
    title: "CSS Grid Layout Masterclass",
    channel: "Frontend Focus",
    views: "67K views",
    timestamp: "6 days ago",
  },
  {
    id: 9,
    title: "Docker for Beginners",
    channel: "DevOps Daily",
    views: "189K views",
    timestamp: "1 week ago",
  },
  {
    id: 10,
    title: "Performance Optimization Tips",
    channel: "Web Performance",
    views: "112K views",
    timestamp: "3 days ago",
  },
  {
    id: 11,
    title: "Understanding Async/Await in JavaScript",
    channel: "JS Mastery",
    views: "145K views",
    timestamp: "5 days ago",
  },
  {
    id: 12,
    title: "Building a Full-Stack App from Scratch",
    channel: "Full Stack Dev",
    views: "234K views",
    timestamp: "2 weeks ago",
  },
];

export default function Home() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Recommended</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockVideos.map((video) => (
          <VideoCard
            key={video.id}
            title={video.title}
            channel={video.channel}
            views={video.views}
            timestamp={video.timestamp}
          />
        ))}
      </div>
    </div>
  );
}
