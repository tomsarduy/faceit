import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { RootState } from ".";

interface FetchPostsParams {
  limit?: number;
  skip?: number;
}

export interface PostsState {
  // went for an object to make it easier to update/read single posts
  // even if I have to map it to array in the selector
  // I think is a good pattern from my old redux days
  posts: { [key: number]: ApiPost };
  loading: boolean | null;
  error: string | null;
  pagination: {
    skip: number;
    limit: number;
    total: number;
  };
}
// I could have added more stores and add the actions in another file to keep it tidy
// but I think it's fine for now, project is quite small

export const fetchPosts = createAsyncThunk<
  { posts: ApiPost[]; total: number },
  FetchPostsParams
>("posts/fetchPosts", async ({ limit = 20, skip = 0 }) => {
  const response = await fetch(`/api/posts?limit=${limit}&skip=${skip}`);
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  const data: { posts: ApiPost[]; total: number } = await response.json();
  return data;
});

export const fetchPostById = createAsyncThunk<ApiPost, string | number>(
  "posts/fetchPostById",
  async (id) => {
    const response = await fetch(`/api/posts/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch post");
    }
    const data: ApiPost = await response.json();
    return data;
  }
);

export const createDummyPost = createAsyncThunk<ApiPost, { title: string }>(
  "posts/createPost",
  async (newPostData) => {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPostData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create post");
    }

    const data: ApiPost = await response.json();
    return data;
  }
);

const initialState: PostsState = {
  posts: {},
  loading: null,
  error: null,
  pagination: {
    skip: 0,
    limit: 20,
    total: 0,
  },
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    addPost(state, action) {
      state.posts[action.payload.id] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.posts.forEach((post) => {
          state.posts[post.id] = post;
        });
        state.pagination.total = action.payload.total - 2;
        // need the last id available to mock create post
        state.pagination.skip += state.pagination.limit;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch posts";
      })
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.posts[action.payload.id] = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch post";
      });
  },
});

const selectPostsMap = (state: RootState) => state.posts.posts;

// To make this more efficient, we could use a list of ids
// and an object with posts
// and just update the object with the new posts
// and append the ids to the list
// that would be easier for removing posts/paginate, etc
export const selectPostById = createSelector(
  [selectPostsMap],
  (postMap) => (id: number) => postMap[id] ?? null
);

export const selectPostsArray = createSelector([selectPostsMap], (postsMap) =>
  // Because new posts are to be at the top
  // im using createdAt but it's optional because it
  // not suppoirted by dummyjson
  Object.values(postsMap).sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      if (a.createdAt > b.createdAt) return -1;
      return 1;
    }
    if (a.createdAt) return -1;
    if (b.createdAt) return 1;
    return 0;
  })
);
export const { addPost } = postsSlice.actions;
export default postsSlice.reducer;
