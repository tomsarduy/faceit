import sha256 from "crypto-js/sha256";

interface ServerPost {
  id: number;
  body: string;
  userId: number;
}

interface ServerUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

const getGravatarUrl = (email: string) => {
  const hashedEmail = sha256(email).toString().slice(0, 15);
  return `https://i.pravatar.cc/100?u=${hashedEmail}`;
};

export async function GET(request: Request) {
  try {
    const queryParams = new URLSearchParams(request.url);
    const limit = queryParams.get("limit") || "20";
    const skip = queryParams.get("skip") || "0";

    const postsResponse = await fetch(
      `https://dummyjson.com/posts?select=id,body,userId&limit=${limit}&skip=${skip}`
    );

    const postsData = (await postsResponse.json()) as {
      posts: ServerPost[];
      total: number;
    };
    const posts = postsData.posts;

    const userIds = posts.map((post) => post.userId);
    const userPromises = userIds.map(async (id) => {
      const userResponse = await fetch(
        `https://dummyjson.com/users/${id}?select=id,firstName,lastName,email`
      );
      const userData = (await userResponse.json()) as ServerUser;
      return userData;
    });

    // Resolve user requests and attach them to posts
    const usersArray = await Promise.all(userPromises);
    const userMap: {
      [key: number]: {
        name: string;
        avatarUrl: string;
      };
    } = {};
    usersArray.forEach((user) => {
      userMap[user.id] = {
        name: `${user.firstName} ${user.lastName}`,
        avatarUrl: getGravatarUrl(user.email || ""),
      };
    });

    const postsWithUser: ApiPost[] = posts.map((post) => ({
      id: post.id,
      content: post.body,
      name: userMap[post.userId].name,
      avatarUrl: userMap[post.userId].avatarUrl,
    }));
    return Response.json({ posts: postsWithUser, total: postsData.total });

    // return Response.json({ posts: postsWithUser, total: postsData.total });
  } catch (error) {
    console.error(error);
    Response.error();
  }
}

export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    // Simulate adding a random post on the server
    // dont have the time to add a form and all that

    const response = await fetch("https://dummyjson.com/posts/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "lorem",
        userId: 5,
        /* other post data */
      }),
    });

    const data = await response.json();
    // Send the new post to connected clients via SSE
    // This works quite well with nextJs
    if ((globalThis as any).sendSSEData) {
      (globalThis as any).sendSSEData({
        id: 250,
        content:
          "Beneath the shade of a towering oak tree, villagers gathered to chat and share stories. Children played games on the cobblestone streets, while elders watched with fond smiles. It was a place where time seemed to move more slowly, and the simple joys of life were savored.",
        name: "Grace Perry",
        avatarUrl: "https://i.pravatar.cc/300?u=19fcfbcc7b407b4&w=384&q=75",
        createdAt: new Date().toISOString(),
      });
    }
    return Response.json(data);
  } catch (error) {
    return Response.error();
  }
}
