"use client";

import React from "react";
import { Provider } from "react-redux";
import styles from "./page.module.css";
import { store } from "./store";

interface ReduxProviderProps {
  children: React.ReactNode;
}
// Need a wrapper because this one needs use client
// and cant be used with nextJs metadata
const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <div className={styles.page}>
        <main className={styles.main}>{children}</main>
      </div>
    </Provider>
  );
};

export default ReduxProvider;
