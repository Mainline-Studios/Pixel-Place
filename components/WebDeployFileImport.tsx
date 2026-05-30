'use client';

import { useRef, useState } from 'react';
import {
  formatBytes,
  isAllowedWebDeployFile,
  WEB_DEPLOY_MAX_FILE_BYTES,
  WEB_DEPLOY_MAX_FILES,
  WEB_DEPLOY_MAX_TOTAL_BYTES,
  type WebDeployUploadedFile,
} from '@/lib/webDeployFiles';
import { uploadWebDeployFile } from '@/lib/webDeployUploadApi';

type Props = {
  files: WebDeployUploadedFile[];
  onChange: (files: WebDeployUploadedFile[]) => void;
  disabled?: boolean;
};

export default function WebDeployFileImport({ files, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const totalBytes = files.reduce((n, f) => n + f.size, 0);

  const onPick = async (list: FileList | null) => {
    if (!list?.length || disabled) return;
    setError('');
    const picked = Array.from(list);
    if (files.length + picked.length > WEB_DEPLOY_MAX_FILES) {
      setError(`Maximum ${WEB_DEPLOY_MAX_FILES} files per request.`);
      return;
    }
    let batchTotal = totalBytes;
    for (const file of picked) {
      if (!isAllowedWebDeployFile(file.name)) {
        setError(`Not allowed: ${file.name}. Use HTML, CSS, JS, images, fonts, or .zip archives.`);
        return;
      }
      if (file.size > WEB_DEPLOY_MAX_FILE_BYTES) {
        setError(`${file.name} is too large (max ${formatBytes(WEB_DEPLOY_MAX_FILE_BYTES)}).`);
        return;
      }
      batchTotal += file.size;
      if (batchTotal > WEB_DEPLOY_MAX_TOTAL_BYTES) {
        setError(`Total upload limit is ${formatBytes(WEB_DEPLOY_MAX_TOTAL_BYTES)}.`);
        return;
      }
    }

    setUploading(true);
    const next = [...files];
    try {
      for (const file of picked) {
        const uploaded = await uploadWebDeployFile(file);
        next.push(uploaded);
      }
      onChange(next);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <span style={{ fontSize: 13, display: 'block' }}>Import site files</span>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".html,.htm,.css,.js,.mjs,.json,.svg,.png,.jpg,.jpeg,.webp,.gif,.ico,.txt,.md,.wasm,.woff,.woff2,.zip,.tar,.gz,.map"
        style={{ display: 'none' }}
        disabled={disabled || uploading}
        onChange={(e) => void onPick(e.target.files)}
      />
      <button
        type="button"
        className="btn"
        disabled={disabled || uploading || files.length >= WEB_DEPLOY_MAX_FILES}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? 'Uploading…' : 'Choose files to import'}
      </button>
      <p style={{ margin: 0, fontSize: 12, opacity: 0.7, lineHeight: 1.5 }}>
        Static assets or a .zip (max {WEB_DEPLOY_MAX_FILES} files, {formatBytes(WEB_DEPLOY_MAX_TOTAL_BYTES)} total).
        Moderators download these when reviewing your request.
      </p>
      {files.length > 0 ? (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
          {files.map((f, i) => (
            <li
              key={`${f.storagePath}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid var(--border, #32394e)',
                fontSize: 13,
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <span style={{ opacity: 0.7, flexShrink: 0 }}>{formatBytes(f.size)}</span>
              <button
                type="button"
                className="btn"
                style={{ padding: '2px 8px', fontSize: 11 }}
                disabled={disabled || uploading}
                onClick={() => removeAt(i)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? <p style={{ margin: 0, fontSize: 12, color: '#fca5a5' }}>{error}</p> : null}
    </div>
  );
}
