"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  fetchPosts,
  selectPostsArray,
  createDummyPost,
  addPost,
} from "../store/posts";
import { type RootState, useAppDispatch, useTypedSelector } from "../store";
import Link from "next/link";
import styles from "./styles.module.css";
import Post from "app/components/post";

export default function PostsList() {
  const dispatch = useAppDispatch();
  const { loading, error, pagination } = useTypedSelector(
    (state: RootState) => state.posts
  );
  // This is memoised because is using reselect, so no need to use Memo or anything
  const posts = useTypedSelector(selectPostsArray);

  // This is a simple way of handling the message
  // and hightlighted post, dont want to have this on the redux store
  const [showMessage, setShowMessage] = useState(false);
  const [highlightedPostId, setHighlightedPostId] = useState<number | null>(
    null
  );
  useEffect(() => {
    if (posts.length < 20 && !loading) {
      dispatch(fetchPosts({ skip: pagination.skip, limit: pagination.limit }));
    }
    // we only want to fetch initial posts once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    const eventSource = new EventSource("/api/events");
    // This should live in a different parent component
    // so that it can be reused everywhere and show the message and so on
    // went for this approach because it's a simple example
    // and there is no events from client to server
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      dispatch(addPost({ ...data }));
      setShowMessage(true);
      setHighlightedPostId(data.id);

      setTimeout(() => {
        // There is a better way of doing this, specially if
        // different posts are created a the same time
        // would have an instance for each post that needs it
        // or maybe use a ref to keep track of the post that was just added
        setHighlightedPostId(null);
        setShowMessage(false);
      }, 5000);
    };

    eventSource.onerror = (error) => {};

    return () => {
      eventSource.close();
    };
  }, [dispatch]);

  const handleScroll = useCallback(() => {
    const documentHeight = document.documentElement.scrollHeight;
    if (
      window.scrollY + window.innerHeight >= documentHeight - 10 &&
      !loading &&
      // keep fetching until no posts left to fetch
      posts.length < pagination.total
    ) {
      dispatch(fetchPosts({ skip: pagination.skip, limit: pagination.limit }));
    }
  }, [
    loading,
    posts.length,
    pagination.total,
    pagination.skip,
    pagination.limit,
    dispatch,
  ]);

  useEffect(() => {
    // can be debounced or throttled
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  if (error) {
    return <div>Error fetching posts: {error}</div>;
  }

  const isInitialLoad = loading === null && posts.length === 0;
  const needsMorePosts = loading && posts.length < 20;

  if (isInitialLoad || needsMorePosts) {
    // if you refresh on posts/x page and come back to posts
    // we dont want to display only one post, need at least 20
    return <p>Loading page...</p>;
  }

  return (
    <>
      {showMessage && <div className={styles.alert}>New post added!</div>}
      <section className={styles.container} data-testid="page-container">
        <header className={styles.header}>
          <button
            onClick={() => dispatch(createDummyPost({ title: "whatever" }))}
          >
            {/* create a dummy post in the server, always with the same id, 
            didn't have time to make it more dynamic */}
            Create Dummy Post
          </button>
        </header>
        <ul>
          {posts.map((post) => (
            <Post
              key={post.id}
              id={post.id}
              avatarUrl={post.avatarUrl}
              name={post.name}
              content={post.content}
              isHighlighted={highlightedPostId === post.id}
            />
          ))}
        </ul>
        {loading && posts.length > 0 && (
          <footer className={styles.footer}>
            <p>Loading more posts...</p>
          </footer>
        )}
        {/* dummy json provides this field with a limit on how many posts to fetch */}
        {!loading && posts.length >= pagination.total && (
          <footer className={styles.footer}>
            <p>No more posts to load</p>
          </footer>
        )}
      </section>
    </>
  );
}
