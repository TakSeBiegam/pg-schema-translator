import Editor from "@monaco-editor/react";
import { Parser, ParserField } from "graphql-js-tree";
import { useState } from "react";
import { toast } from "react-toastify";
import { convertGraph } from "@pg-converter/utils";
import React from "react";

export default function Home() {
  const [content, setContent] = useState<string | undefined>();
  const [parsedContent, setParsedContent] = useState<string | undefined>();

  const handleParase = () => {
    if (!content) return;

    let nodes: ParserField[] = [];
    try {
      nodes = Parser.parse(content).nodes.filter(
        (node) => node.name !== "schema"
      );
    } catch (error) {
      toast("schema is not valid", { type: "error" });
      return;
    }

    if (!nodes || !nodes.length) {
      toast("schema is not valid", { type: "error" });
      return;
    }

    setParsedContent(convertGraph("schema", nodes));
  };
  const handleClear = () => {
    setContent("");
    setParsedContent("");
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        alignItems: "center",
        gap: "1rem",
        padding: "2rem",
      }}
    >
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          width: "100%",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <Editor
          value={content}
          onChange={(e) => setContent(e)}
          height="90vh"
          options={{
            fontSize: 32,
          }}
          defaultLanguage="graphql"
          defaultValue="type your schema"
        />
        <Editor
          value={parsedContent}
          height="90vh"
          defaultLanguage="graphql"
          defaultValue=""
          options={{ readOnly: true, fontSize: 32 }}
        />
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={handleParase}
          style={{ padding: "0.5rem 2.5rem", textTransform: "uppercase" }}
        >
          Parse schema
        </button>
        <button
          onClick={handleClear}
          style={{ padding: "0.5rem 2.5rem", textTransform: "uppercase" }}
        >
          Clear editors
        </button>
      </div>
    </div>
  );
}
