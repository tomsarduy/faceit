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
  return `https://i.pravatar.cc/300?u=${hashedEmail}`;
};

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { id: postId } = params;
    if (!postId) {
      throw new Error("Post ID is required");
    }

    const postsResponse = await fetch(
      `https://dummyjson.com/post/${postId}?select=id,body,userId`
    );

    if (!postsResponse.ok) {
      return Response.json({ error: "Post not found", status: 404 });
    }
    const postsData = (await postsResponse.json()) as ServerPost;

    const userId = postsData.userId;
    const userPromise = await fetch(
      `https://dummyjson.com/users/${userId}?select=id,firstName,lastName,email`
    );
    const userData = (await userPromise.json()) as ServerUser;

    const postsWithUser: ApiPost = {
      id: postsData.id,
      content: postsData.body,
      name: `${userData.firstName} ${userData.lastName}`,
      avatarUrl: getGravatarUrl(userData.email || ""),
    };
    return Response.json(postsWithUser);
  } catch (error) {
    Response.error();
  }
}
