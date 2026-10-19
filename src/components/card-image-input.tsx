"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { ChangeEvent } from "react";
import { translate, type Locale } from "@/lib/i18n";

export function CardImageInput({ initialImage = "", locale }: { initialImage?: string; locale: Locale }) {
  const t = (message: string) => translate(locale, message);
  const [imageData, setImageData] = useState(initialImage);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState("");

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError(t("Choose an image file.")); return; }
    if (file.size > 8 * 1024 * 1024) { setError(t("Choose an image under 8 MB.")); return; }
    setError("");
    const reader = new FileReader();
    reader.onerror = () => setError(t("Could not read that image."));
    reader.onload = () => {
      const image = new window.Image();
      image.onerror = () => setError(t("This image could not be opened."));
      image.onload = () => {
        const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
        setImageData(canvas.toDataURL("image/jpeg", .78));
        setRemoveImage(false);
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImageData("");
    setRemoveImage(true);
    setError("");
  }

  return <div className="card-image-field"><span className="field-caption">{t("Card image")} <small>{t("Optional · max 8 MB")}</small></span><input type="hidden" name="imageData" value={imageData} /><input type="hidden" name="removeImage" value={String(removeImage)} />
    <label className="upload-dropzone"><ImagePlus size={17} /><span><b>{t("Choose an image")}</b><small>{t("Compressed and stored with your account")}</small></span><input type="file" accept="image/*" onChange={onFile} aria-label={t("Upload card image")} /></label>
    {imageData && <div className="image-preview-wrap"><Image unoptimized width={800} height={450} className="card-image-preview" src={imageData} alt={t("Selected card image preview")} /><button className="button button-secondary button-small" type="button" onClick={clearImage}><X size={13} />{t("Remove image")}</button></div>}
    {error && <small className="upload-error" role="alert">{error}</small>}
    <small className="sensitive-image-note">{t("Crop out the full card number and CVV before uploading.")}</small>
  </div>;
}
