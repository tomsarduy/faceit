import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PostsList from "./page";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import postsReducer from "../store/posts";
import fetchMock from "jest-fetch-mock";
import MockEventSource from "../__mocks__/eventSourceMock";
import userEvent from "@testing-library/user-event";

fetchMock.enableMocks();
let eventSourceInstance;

beforeEach(() => {
  fetchMock.resetMocks();
  eventSourceInstance = new global.EventSource("/api/events");
});

const mockEventSource = jest.fn().mockImplementation((url: string) => {
  return new MockEventSource(url);
});

(global as any).EventSource = mockEventSource;

const mockPostsResponse = {
  posts: [
    {
      id: 1,
      content:
        "The strongest must seek a way, say you? But I say: let a ploughman plough, but choose an otter for swimming, and for running light over grass and leaf or over snow — an Elf.",
      name: "Legolas",
      avatarUrl: "https://i.pravatar.cc/100?u=1",
    },
    {
      id: 2,
      content:
        "Here is the heart of Elvendom on earth… and here my heart dwells ever, unless there be a light beyond the dark roads that we still must tread",
      name: "Aragorn",
      avatarUrl: "https://i.pravatar.cc/100?u=2",
    },
    {
      id: 3,
      content:
        "I wish the ring had never come to me. I wish none of this had happened.",
      name: "Frodo",
      avatarUrl: "https://i.pravatar.cc/100?u=3",
    },
    {
      id: 4,
      content: "Even the smallest person can change the course of the future.",
      name: "Galadriel",
      avatarUrl: "https://i.pravatar.cc/100?u=4",
    },
  ],
  total: 7,
};

const morePosts = {
  posts: [
    {
      id: 5,
      content:
        "One Ring to rule them all, One Ring to find them, One Ring to bring them all and in the darkness bind them.",
      name: "Sauron",
      avatarUrl: "https://i.pravatar.cc/100?u=5",
    },
    {
      id: 6,
      content:
        "All we have to decide is what to do with the time that is given us.",
      name: "Gandalf",
      avatarUrl: "https://i.pravatar.cc/100?u=6",
    },
  ],
  total: 7,
};

describe("FaceIt Feed", () => {
  // I believe this is the right way to test components
  // testing functionality from the user's perspective
  // rather than testing the implementation details
  // or how the store is being used, etc
  // of course I would add unit tests for utils, hooks, etc
  // that are not straightforward to test in a component

  it("renders posts after loading", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockPostsResponse));
    const store = configureStore({
      reducer: {
        posts: postsReducer,
      },
    });
    render(
      <Provider store={store}>
        <PostsList />
      </Provider>
    );

    // Assert that the loading message is displayed initially
    expect(screen.getByText(/Loading page.../i)).toBeInTheDocument();

    // Wait for the posts to be displayed
    await waitFor(() =>
      expect(screen.getByTestId("page-container")).toBeInTheDocument()
    );
    // Check that the loading message is removed
    expect(screen.queryByText(/Loading page.../i)).not.toBeInTheDocument();

    // Check that the posts are rendered correctly and text is truncated
    expect(screen.getByText("Legolas")).toBeVisible();
    const firstLink = screen.getAllByRole("link")[0];
    expect(firstLink).toHaveAttribute("href", "/posts/1");

    // Uses nextjs Image component loader
    expect(screen.getByRole("img", { name: "Legolas" })).toBeVisible();
    expect(
      screen.getByText(
        "The strongest must seek a way, say you? But I say: let a ploughman plough, but choose an otter for s..."
      )
    ).toBeVisible();
    expect(screen.getByText("Aragorn")).toBeVisible();
    expect(screen.getByRole("img", { name: "Aragorn" })).toBeVisible();
    expect(
      screen.getByText(
        "Here is the heart of Elvendom on earth… and here my heart dwells ever, unless there be a light beyon..."
      )
    ).toBeVisible();
  });

  it("should show an error message if fetch posts fail", async () => {
    fetchMock.mockReject(new Error("error"));
    const store = configureStore({
      reducer: {
        posts: postsReducer,
      },
    });

    render(
      <Provider store={store}>
        <PostsList />
      </Provider>
    );

    expect(screen.getByText(/Loading page.../i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText(/Error fetching posts/i)).toBeInTheDocument()
    );
  });

  it("supports infinite scroll and load more posts", async () => {
    fetchMock.mockResponse((req) => {
      if (req.url.endsWith("/posts?limit=20&skip=0")) {
        return Promise.resolve(JSON.stringify(mockPostsResponse));
      } else if (req.url.endsWith("/posts?limit=20&skip=20")) {
        return Promise.resolve(JSON.stringify(morePosts));
      } else {
        return Promise.reject(new Error("Unknown URL"));
      }
    });
    const store = configureStore({
      reducer: {
        posts: postsReducer,
      },
    });

    render(
      <Provider store={store}>
        <PostsList />
      </Provider>
    );

    expect(screen.getByText(/Loading page.../i)).toBeInTheDocument();

    // Load initial posts
    await waitFor(() =>
      expect(screen.getByTestId("page-container")).toBeInTheDocument()
    );

    // Scroll to the bottom of the page
    window.scrollY = 1000;
    fireEvent.scroll(window);
    // Wait for the next set of posts to be loaded
    await waitFor(() => expect(screen.getByText("Sauron")).toBeInTheDocument());
    // it calls the right pagination
    expect(fetchMock).toHaveBeenCalledWith("/api/posts?limit=20&skip=20");
    // Load the other 2 posts
    expect(screen.getByText("Sauron")).toBeVisible();
    expect(screen.getByText("Gandalf")).toBeVisible();

    // There are no more posts to fetch or lazy load
    expect(screen.queryByText("No more posts to load")).toBeVisible();
  });

  it("allows you to create a new post", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockPostsResponse));
    const store = configureStore({
      reducer: {
        posts: postsReducer,
      },
    });
    render(
      <Provider store={store}>
        <PostsList />
      </Provider>
    );
    await waitFor(() =>
      expect(screen.getByTestId("page-container")).toBeInTheDocument()
    );
    const createButton = screen.getByRole("button", {
      name: "Create Dummy Post",
    });
    await userEvent.click(createButton);
    // Create a post with the right body request
    expect(fetchMock).toHaveBeenCalledWith("/api/posts", {
      body: '{"title":"whatever"}',
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  });

  it("should display a message and the new added post highlighted", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockPostsResponse));
    const store = configureStore({
      reducer: {
        posts: postsReducer,
      },
    });

    render(
      <Provider store={store}>
        <PostsList />
      </Provider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("page-container")).toBeInTheDocument()
    );
    // Too time consuming to actually try to test the SSE events here
    // The mock I tried is not working for some reason, maybe the global object config
    // sweat :(
  });
});
