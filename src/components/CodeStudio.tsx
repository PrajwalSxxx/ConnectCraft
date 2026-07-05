import React, { useState } from "react";
import { Folder, FileCode, Copy, Check, FileText, ChevronRight, ChevronDown, Download, Terminal } from "lucide-react";
import { JavaFile } from "../types";

interface CodeStudioProps {
  files: JavaFile[];
}

export default function CodeStudio({ files }: CodeStudioProps) {
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [treeExpanded, setTreeExpanded] = useState<Record<string, boolean>>({
    root: true,
    models: true,
    database: true,
    services: true,
    server: true,
    client: true,
    sql: true,
  });

  const toggleExpand = (dir: string) => {
    setTreeExpanded((prev) => ({ ...prev, [dir]: !prev[dir] }));
  };

  // Find selected file
  const activeFile = files.find((f) => f.path === selectedFilePath) || files[0];

  // Set default file if selected is empty
  React.useEffect(() => {
    if (!selectedFilePath && files.length > 0) {
      setSelectedFilePath(files[0].path);
    }
  }, [files, selectedFilePath]);

  const handleCopy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Organize files into virtual structure
  const structure: Record<string, JavaFile[]> = {
    pom: files.filter((f) => f.name === "pom.xml"),
    sql: files.filter((f) => f.path.startsWith("sql") || f.name.endsWith(".sql")),
    models: files.filter((f) => f.path.includes("models")),
    database: files.filter((f) => f.path.includes("database")),
    services: files.filter((f) => f.path.includes("services")),
    server: files.filter((f) => f.path.includes("server")),
    client: files.filter((f) => f.path.includes("client")),
    readme: files.filter((f) => f.name === "README.md"),
  };

  const getFileIcon = (filename: string) => {
    if (filename === "pom.xml") return <FileCode className="w-4 h-4 text-amber-500" />;
    if (filename.endsWith(".sql")) return <Terminal className="w-4 h-4 text-elegant-gold-light" />;
    if (filename.endsWith(".md")) return <FileText className="w-4 h-4 text-gray-300" />;
    return <FileCode className="w-4 h-4 text-elegant-gold" />;
  };

  const renderFileNode = (file: JavaFile) => (
    <button
      key={file.path}
      onClick={() => {
        setSelectedFilePath(file.path);
      }}
      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all text-left cursor-pointer ${
        selectedFilePath === file.path
          ? "bg-elegant-gold-muted border border-elegant-border-hover text-elegant-gold font-medium"
          : "hover:bg-elegant-card-hover/60 text-elegant-muted hover:text-gray-100"
      }`}
    >
      {getFileIcon(file.name)}
      <span className="truncate">{file.name}</span>
    </button>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-gray-100 font-sans">
      {/* File Tree Sidebar */}
      <div className="lg:col-span-1 bg-elegant-card border border-elegant-border rounded-2xl p-5 shadow-xl h-[560px] overflow-y-auto scrollbar-thin gold-glow">
        <h3 className="font-semibold text-xs text-elegant-gold uppercase tracking-wider mb-4">Java Maven Project Structure</h3>

        <div className="space-y-2">
          {/* README File */}
          {structure.readme.map(renderFileNode)}

          {/* pom.xml */}
          {structure.pom.map(renderFileNode)}

          {/* SQL Directory */}
          <div className="space-y-1">
            <button
              onClick={() => toggleExpand("sql")}
              className="w-full flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white py-1 text-left cursor-pointer"
            >
              {treeExpanded.sql ? <ChevronDown className="w-3.5 h-3.5 text-elegant-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-elegant-muted" />}
              <Folder className="w-4 h-4 text-elegant-gold" />
              <span>sql</span>
            </button>
            {treeExpanded.sql && (
              <div className="pl-5 border-l border-elegant-border/50 space-y-1 mt-0.5">
                {structure.sql.map(renderFileNode)}
              </div>
            )}
          </div>

          {/* Java Package Folders */}
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-elegant-muted/60 tracking-wider pt-2 pl-1 select-none">Source Packages</p>

            {/* Models */}
            <div>
              <button
                onClick={() => toggleExpand("models")}
                className="w-full flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white py-1 text-left cursor-pointer"
              >
                {treeExpanded.models ? <ChevronDown className="w-3.5 h-3.5 text-elegant-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-elegant-muted" />}
                <Folder className="w-4 h-4 text-elegant-gold-light" />
                <span>models</span>
              </button>
              {treeExpanded.models && (
                <div className="pl-5 border-l border-elegant-border/50 space-y-1 mt-0.5">
                  {structure.models.map(renderFileNode)}
                </div>
              )}
            </div>

            {/* Database */}
            <div>
              <button
                onClick={() => toggleExpand("database")}
                className="w-full flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white py-1 text-left cursor-pointer"
              >
                {treeExpanded.database ? <ChevronDown className="w-3.5 h-3.5 text-elegant-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-elegant-muted" />}
                <Folder className="w-4 h-4 text-elegant-gold-light" />
                <span>database</span>
              </button>
              {treeExpanded.database && (
                <div className="pl-5 border-l border-elegant-border/50 space-y-1 mt-0.5">
                  {structure.database.map(renderFileNode)}
                </div>
              )}
            </div>

            {/* Services */}
            <div>
              <button
                onClick={() => toggleExpand("services")}
                className="w-full flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white py-1 text-left cursor-pointer"
              >
                {treeExpanded.services ? <ChevronDown className="w-3.5 h-3.5 text-elegant-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-elegant-muted" />}
                <Folder className="w-4 h-4 text-elegant-gold-light" />
                <span>services</span>
              </button>
              {treeExpanded.services && (
                <div className="pl-5 border-l border-elegant-border/50 space-y-1 mt-0.5">
                  {structure.services.map(renderFileNode)}
                </div>
              )}
            </div>

            {/* Server */}
            <div>
              <button
                onClick={() => toggleExpand("server")}
                className="w-full flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white py-1 text-left cursor-pointer"
              >
                {treeExpanded.server ? <ChevronDown className="w-3.5 h-3.5 text-elegant-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-elegant-muted" />}
                <Folder className="w-4 h-4 text-elegant-gold-light" />
                <span>server</span>
              </button>
              {treeExpanded.server && (
                <div className="pl-5 border-l border-elegant-border/50 space-y-1 mt-0.5">
                  {structure.server.map(renderFileNode)}
                </div>
              )}
            </div>

            {/* Client */}
            <div>
              <button
                onClick={() => toggleExpand("client")}
                className="w-full flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white py-1 text-left cursor-pointer"
              >
                {treeExpanded.client ? <ChevronDown className="w-3.5 h-3.5 text-elegant-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-elegant-muted" />}
                <Folder className="w-4 h-4 text-elegant-gold-light" />
                <span>client</span>
              </button>
              {treeExpanded.client && (
                <div className="pl-5 border-l border-elegant-border/50 space-y-1 mt-0.5">
                  {structure.client.map(renderFileNode)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Code Editor Panel */}
      <div className="lg:col-span-3 bg-elegant-card border border-elegant-border rounded-2xl shadow-xl flex flex-col h-[560px] gold-glow">
        {/* Editor Tab bar */}
        <div className="bg-elegant-card-alt px-5 py-3.5 border-b border-elegant-border/80 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-elegant-gold inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-elegant-gold-light inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-elegant-gold-dark inline-block" />
            <span className="text-xs text-elegant-muted font-mono pl-2 truncate max-w-xs">{activeFile?.path || "CodeStudio"}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-elegant-bg hover:bg-elegant-card-hover border border-elegant-border rounded-lg text-xs font-semibold text-elegant-muted hover:text-white transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-elegant-gold" />
                  <span className="text-elegant-gold font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy File</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor Code Pane */}
        <div className="flex-1 overflow-auto bg-elegant-bg/40 p-5 text-xs font-mono leading-relaxed select-text scrollbar-thin">
          <pre className="text-elegant-gold-light/95 whitespace-pre">
            <code>{activeFile?.content || "// Load file nodes to compile code logs"}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
