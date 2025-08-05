import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return alert("Please upload a JSON file.");
    setDownloading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/generate", {
      method: "POST",
      body: formData,
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "updated_test.html";
    a.click();
    setDownloading(false);
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>📄 JSON to Styled Test Generator</h2>
      <input type="file" accept=".json" onChange={handleFileChange} />
      <button onClick={handleSubmit} disabled={!file || downloading} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
        {downloading ? "Generating..." : "Generate HTML"}
      </button>
    </main>
  );
}
