interface ApiPost {
  id: number;
  content: string;
  name: string;
  avatarUrl: string;
  // just using this to sort the posts
  // they don't have a createdAt in the dummy data
  createdAt?: string;
}
