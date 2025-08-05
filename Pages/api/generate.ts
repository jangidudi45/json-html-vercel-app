import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable-serverless';

export const config = {
  api: {
    bodyParser: false,
  },
};

function getOptionLabel(i: number) {
  return String.fromCharCode(65 + i);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new formidable.IncomingForm();
  form.uploadDir = "/tmp";
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) return res.status(400).send("Upload failed.");

    const rawData = fs.readFileSync(files.file.filepath, "utf8");
    const json = JSON.parse(rawData);

    const templatePath = path.join(process.cwd(), "public", "template.html");
    let html = fs.readFileSync(templatePath, "utf8");

    const injected = json.map((q: any, i: number) => {
      const options = [1, 2, 3, 4].map(j => {
        const key = `option_${j}`;
        if (!q[key]) return "";
        const correct = q.answer === String(j) ? "correct" : "";
        return `<div class="option-card ${correct}" data-option="${getOptionLabel(j - 1)}">${q[key]}</div>`;
      }).join("");

      return `
<div class="question-card">
  <div class="question-header">
    <div class="question-number"><i class="fas fa-question-circle"></i> Question ${i + 1}</div>
  </div>
  <div class="question-box">${q.question}</div>
  <div class="options-container">${options}</div>
  <div class="question-box" style="background: #e6ffe6; margin-top: 1rem;">
    <strong>Solution:</strong><br>${q.solution_text}
  </div>
</div>`;
    }).join("");

    html = html.replace(/<div class="question-card">[\s\S]*?<\/div>(\s*<!-- END -->)?/, injected);

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  });
}
