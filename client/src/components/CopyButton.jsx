import { useState } from "react";

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden="true" className="icon">
    <path
      d="M9 9h10v10H9zM6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1h-2V5H5v8h1v2z"
      fill="currentColor"
    />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden="true" className="icon">
    <path
      d="M9.2 16.2 4.9 11.9l1.4-1.4 2.9 2.9 7.5-7.5 1.4 1.4z"
      fill="currentColor"
    />
  </svg>
);

function CopyButton({ value, variant = "text", size = "tiny" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      // Ignore if clipboard unavailable
    }
  };

  const className =
    variant === "icon"
      ? "ghost-button ghost-button--icon"
      : size === "tiny"
        ? "ghost-button ghost-button--tiny"
        : "ghost-button";

  return (
    <button
      className={className}
      type="button"
      aria-label="Copy"
      onClick={handleCopy}
    >
      {variant === "icon" ? (copied ? <CheckIcon /> : <CopyIcon />) : copied ? "Copied" : "Copy"}
    </button>
  );
}

export default CopyButton;
