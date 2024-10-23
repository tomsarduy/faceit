"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAppDispatch, useTypedSelector } from "../../store";
import { fetchPostById, selectPostById } from "../../store/posts";
import styles from "./styles.module.css";
import Link from "next/link";

export default function PostDetails() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { error } = useTypedSelector((state) => state.posts);
  const selectPost = useTypedSelector(selectPostById);
  const postId = parseInt(id?.toString() || "");
  const selectedPost = selectPost(postId);

  useEffect(() => {
    if (postId) {
      dispatch(fetchPostById(postId));
    }
  }, [postId, dispatch]);

  if (error) {
    return <div>Error fetching post: {error}</div>;
  }

  if (!selectedPost) {
    return;
  }

  // We can show what we have in the store while
  // loading the latest data and a bigger image

  return (
    <section className={styles.container}>
      <article className={styles.post}>
        <Image
          className={styles.avatar}
          src={selectedPost.avatarUrl}
          alt={selectedPost.name}
          width={300}
          height={300}
        />
        <section className={styles.content}>
          <h1>{selectedPost.name}</h1>
          <p>{selectedPost.content}</p>
        </section>
      </article>
      <Link
        onClick={() => router.back()}
        className={styles.go_back}
        href={`/posts`}
      >
        <span className={styles.arrow}>←</span> Go back
      </Link>
    </section>
  );
}
