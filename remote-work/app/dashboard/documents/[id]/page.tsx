"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface DocumentData {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

export default function DocumentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const [, setDocument] = useState<DocumentData | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setDocument(data);
        setTitle(data.title);
        setContent(data.content || "");
        setLoading(false);
      } else {
        router.push("/dashboard/documents");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleSave = async () => {
    if (!params.id) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/documents/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      if (response.ok) {
        setSaving(false);
        // Show success message briefly
        setTimeout(() => {
          setSaving(false);
        }, 1000);
      }
    } catch (error) {
      console.error("Error saving document:", error);
      setSaving(false);
    }
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!params.id || !content) return;

    const autoSaveInterval = setInterval(() => {
      handleSave();
    }, 30000);

    return () => clearInterval(autoSaveInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, title, params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600 dark:text-gray-400">Loading document...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/documents"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Documents
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-6 py-4 text-2xl font-bold border-b border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:outline-none"
          placeholder="Document title..."
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 px-6 py-4 text-gray-900 dark:text-white bg-transparent resize-none focus:outline-none"
          placeholder="Start writing your document..."
        />
      </div>

      {saving && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Saving...
        </div>
      )}
    </div>
  );
}

