"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./post.module.css";

interface PostProps {
  id: number;
  avatarUrl: string;
  name: string;
  content: string;
  isHighlighted: boolean;
}

const Post: React.FC<PostProps> = ({
  id,
  avatarUrl,
  name,
  content,
  isHighlighted,
}) => {
  return (
    <li>
      <Link href={`/posts/${id}`} data-testid="link">
        <article
          className={styles.post}
          style={
            // highlight the post that was just added
            // of course this would be done with conditional classes or passing props
            // to a styled component
            isHighlighted
              ? {
                  boxShadow: "-1px -2px 11px 11px #3256d98c",
                }
              : {}
          }
        >
          <Image src={avatarUrl} alt={name} width={100} height={100} />
          <section className={styles.content}>
            <h4>{name}</h4>
            <p>
              {content.length > 100 ? `${content.slice(0, 100)}...` : content}
            </p>
          </section>
        </article>
      </Link>
    </li>
  );
};

// Using React.memo to prevent re-renders if props don't change
// This is a good practice to avoid unnecessary re-renders
// in functional components
export default React.memo(Post);
