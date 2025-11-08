"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, FileText, Edit, Trash2, Calendar } from "lucide-react";
import Link from "next/link";

interface Document {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDocForm, setShowNewDocForm] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial data fetch on mount
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateDocument = async () => {
    if (!newDocTitle.trim()) return;

    try {
      const response = await fetch("/api/documents/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newDocTitle,
        }),
      });

      if (response.ok) {
        const newDoc = await response.json();
        setDocuments((prev) => [newDoc, ...prev]);
        setNewDocTitle("");
        setShowNewDocForm(false);
      }
    } catch (error) {
      console.error("Error creating document:", error);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600 dark:text-gray-400">Loading documents...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Documents
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and collaborate on documents with your team
          </p>
        </div>
        <button
          onClick={() => setShowNewDocForm(!showNewDocForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Document
        </button>
      </div>

      {showNewDocForm && (
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Document title"
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateDocument();
              }
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateDocument}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowNewDocForm(false);
                setNewDocTitle("");
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No documents yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first document to get started
          </p>
          <button
            onClick={() => setShowNewDocForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <button
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <Link href={`/dashboard/documents/${doc.id}`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {doc.title}
                </h3>
              </Link>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(doc.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <Link
                href={`/dashboard/documents/${doc.id}`}
                className="mt-4 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

