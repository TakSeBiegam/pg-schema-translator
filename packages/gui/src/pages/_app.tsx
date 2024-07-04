import "@/styles/globals.css";
import type { AppProps } from "next/app";
import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <ToastContainer limit={1} closeOnClick />
      <Component {...pageProps} />
    </div>
  );
}
