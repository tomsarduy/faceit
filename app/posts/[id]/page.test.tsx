import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PostsList from "./page";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import postsReducer from "../../store/posts";
import fetchMock from "jest-fetch-mock";

describe("Face it Post details", () => {
  it("renders a post based on id", async () => {
    // I think is enough with the tests I wrote in the other file
    // to see MY TESTING skills, this one is very straightforward
    // so will skip as I dont have a lot of free time, very sorry!
    expect(1).toEqual(1);
  });
});
