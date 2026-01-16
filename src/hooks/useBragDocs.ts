import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAppData } from "../context/AppDataContext";
import { BragDocEntry } from "../types";

export function useBragDocs() {
  const { data, saveData } = useAppData();

  const [showBragDocForm, setShowBragDocForm] = useState(false);
  const [bragDocTitle, setBragDocTitle] = useState("");
  const [bragDocText, setBragDocText] = useState("");
  const [bragDocLinks, setBragDocLinks] = useState("");
  const [bragDocPendingImages, setBragDocPendingImages] = useState<string[]>([]);
  const [loadedImages, setLoadedImages] = useState<Record<string, string>>({});
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      if (!data?.bragDocs) return;

      const imageFilenames = data.bragDocs
        .flatMap((entry) => entry.images || [])
        .filter((filename) => !loadedImages[filename]);

      if (imageFilenames.length === 0) return;

      const newImages: Record<string, string> = {};
      for (const filename of imageFilenames) {
        const dataUrl = await invoke<string>("get_image", { filename });
        newImages[filename] = dataUrl;
      }

      setLoadedImages((prev) => ({ ...prev, ...newImages }));
    };

    loadImages();
  }, [data?.bragDocs]);

  const handleBragDocPaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;

          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            setBragDocPendingImages((prev) => [...prev, dataUrl]);
          };
          reader.readAsDataURL(file);
        }
      }
    },
    []
  );

  const removePendingImage = useCallback((index: number) => {
    setBragDocPendingImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addBragDoc = useCallback(async () => {
    if (!data || !bragDocTitle.trim() || !bragDocText.trim()) return;

    const links = bragDocLinks
      .split(",")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const savedImageFilenames: string[] = [];
    for (const dataUrl of bragDocPendingImages) {
      const [header, base64Data] = dataUrl.split(",");
      const mimeMatch = header.match(/data:image\/(\w+)/);
      const extension = mimeMatch ? mimeMatch[1] : "png";

      const filename = await invoke<string>("save_image", {
        base64Data,
        extension,
      });
      savedImageFilenames.push(filename);
    }

    const newEntry: BragDocEntry = {
      id: crypto.randomUUID(),
      title: bragDocTitle.trim(),
      text: bragDocText.trim(),
      links: links.length > 0 ? links : undefined,
      images: savedImageFilenames.length > 0 ? savedImageFilenames : undefined,
      timestamp: new Date().toISOString(),
    };
    const newData = {
      ...data,
      bragDocs: [newEntry, ...(data.bragDocs || [])],
    };
    await saveData(newData);
    setBragDocTitle("");
    setBragDocText("");
    setBragDocLinks("");
    setBragDocPendingImages([]);
    setShowBragDocForm(false);
  }, [data, saveData, bragDocTitle, bragDocText, bragDocLinks, bragDocPendingImages]);

  const deleteBragDoc = useCallback(
    async (id: string) => {
      if (!data) return;
      const entry = data.bragDocs?.find((b) => b.id === id);
      if (entry?.images) {
        for (const filename of entry.images) {
          await invoke("delete_image", { filename });
        }
      }
      const newData = {
        ...data,
        bragDocs: (data.bragDocs || []).filter((b) => b.id !== id),
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const openLightbox = useCallback((imageUrl: string) => {
    setLightboxImage(imageUrl);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxImage(null);
  }, []);

  return {
    showBragDocForm,
    setShowBragDocForm,
    bragDocTitle,
    setBragDocTitle,
    bragDocText,
    setBragDocText,
    bragDocLinks,
    setBragDocLinks,
    bragDocPendingImages,
    setBragDocPendingImages,
    loadedImages,
    lightboxImage,
    handleBragDocPaste,
    removePendingImage,
    addBragDoc,
    deleteBragDoc,
    openLightbox,
    closeLightbox,
  };
}
