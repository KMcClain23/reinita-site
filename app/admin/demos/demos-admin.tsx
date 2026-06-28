"use client";

import { useRef, useState } from "react";

const GENRES = [
  "Romance",
  "Fantasy",
  "Paranormal",
  "Children's fiction",
] as const;

export type Demo = {
  id: string;
  title: string;
  genre: string;
  character: string | null;
  description: string | null;
  audio_url: string;
  r2_key: string | null;
  duration_seconds: number | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export function DemosAdmin({ initialDemos }: { initialDemos: Demo[] }) {
  const [demos, setDemos] = useState<Demo[]>(initialDemos);

  return (
    <div className="space-y-12">
      <div>
        <p className="eyebrow">Manage</p>
        <h1 className="font-display-italic text-4xl text-abyss mt-2">
          Demos.
        </h1>
      </div>

      <AddDemoForm onAdd={(d) => setDemos([d, ...demos])} />

      <div className="border-t border-mist pt-10">
        <h2 className="font-display-italic text-2xl text-abyss mb-6">
          All demos {demos.length > 0 && (
            <span className="text-driftwood text-base ml-2">({demos.length})</span>
          )}
        </h2>
        <DemoList
          demos={demos}
          onDelete={(id) => setDemos(demos.filter((d) => d.id !== id))}
          onPatch={(id, patch) =>
            setDemos(demos.map((d) => (d.id === id ? { ...d, ...patch } : d)))
          }
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Add form
   ───────────────────────────────────────────────────────────── */

function AddDemoForm({ onAdd }: { onAdd: (d: Demo) => void }) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<string>(GENRES[0]);
  const [character, setCharacter] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [published, setPublished] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "saving" | "ok" | "err"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const reset = () => {
    setTitle("");
    setCharacter("");
    setDescription("");
    setFile(null);
    setSortOrder(0);
    setPublished(false);
    setProgress(0);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus("err");
      setMessage("Pick an audio file first.");
      return;
    }

    setStatus("uploading");
    setMessage("");
    setProgress(0);

    try {
      // 1. Get presigned upload URL
      const presignRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });
      if (!presignRes.ok) {
        const err = await presignRes.json().catch(() => ({}));
        throw new Error(err.error || "Upload preparation failed");
      }
      const { uploadUrl, key, publicUrl } = await presignRes.json();

      // 2. Upload file to R2 directly via PUT, with progress
      await uploadToR2(uploadUrl, file, setProgress);

      // 3. Read audio duration from the file before we lose it
      const duration = await getAudioDuration(file);

      // 4. Persist metadata
      setStatus("saving");
      const saveRes = await fetch("/api/admin/demos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          genre,
          character: character || null,
          description: description || null,
          audio_url: publicUrl,
          r2_key: key,
          duration_seconds: duration,
          sort_order: sortOrder,
          published,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error || "Save failed");

      onAdd(saveData.demo as Demo);
      setStatus("ok");
      setMessage(
        published
          ? "Added and published."
          : "Added as draft. Toggle to publish when ready."
      );
      reset();
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      setStatus("err");
      setMessage(err instanceof Error ? err.message : "Failed.");
    }
  };

  const fieldClass =
    "w-full bg-transparent border-b border-abyss/30 focus:border-kelp outline-none py-3 text-base text-abyss placeholder:text-driftwood/60 transition-colors";

  const busy = status === "uploading" || status === "saving";

  return (
    <form
      onSubmit={submit}
      className="bg-shell border border-mist rounded-2xl p-8 space-y-7"
    >
      <h2 className="font-display-italic text-2xl text-abyss">Add a demo</h2>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="eyebrow block mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A Midnight Garden, Ch. 1"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="genre" className="eyebrow block mb-1">
            Genre
          </label>
          <select
            id="genre"
            required
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className={fieldClass}
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="character" className="eyebrow block mb-1">
            Character / voice
          </label>
          <input
            id="character"
            type="text"
            value={character}
            onChange={(e) => setCharacter(e.target.value)}
            placeholder="Adult female, warm"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="sort_order" className="eyebrow block mb-1">
            Sort order
          </label>
          <input
            id="sort_order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="eyebrow block mb-1">
          Blurb
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A short paragraph that sets the scene of this excerpt."
          className={`${fieldClass} resize-none`}
        />
      </div>

      <div>
        <p className="eyebrow mb-2">Audio file</p>
        <FilePicker file={file} onChange={setFile} disabled={busy} />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="published"
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 accent-[#3D7A6B]"
        />
        <label htmlFor="published" className="text-sm text-ink-soft">
          Publish immediately — otherwise it stays as a draft.
        </label>
      </div>

      <div className="flex items-center gap-6 pt-2">
        <button
          type="submit"
          disabled={busy || !file || !title}
          className="lift-btn bg-abyss text-shore px-7 py-3 text-sm font-medium tracking-wide rounded-full hover:bg-tide disabled:opacity-50"
        >
          {status === "uploading"
            ? `Uploading ${progress}%`
            : status === "saving"
            ? "Saving..."
            : status === "ok"
            ? "Saved ✓"
            : "Add demo →"}
        </button>
        {message && (
          <p
            className={`text-sm ${
              status === "err" ? "text-red-700" : "text-kelp"
            }`}
            role={status === "err" ? "alert" : "status"}
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────
   File picker
   ───────────────────────────────────────────────────────────── */

function FilePicker({
  file,
  onChange,
  disabled,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
  disabled?: boolean;
}) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (file) {
    return (
      <div className="flex items-center justify-between gap-4 border border-mist bg-white/40 rounded-xl p-4">
        <div className="min-w-0">
          <p className="text-abyss font-medium truncate">{file.name}</p>
          <p className="text-xs text-driftwood mt-1">
            {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          disabled={disabled}
          className="text-xs text-driftwood hover:text-abyss transition-colors disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (disabled) return;
        const f = e.dataTransfer.files[0];
        if (f && f.type.startsWith("audio/")) onChange(f);
      }}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        drag ? "border-kelp bg-mist/30" : "border-mist"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <p className="text-driftwood text-sm">Drop an audio file here, or</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="mt-3 text-sm text-kelp link-soft"
      >
        choose from your computer
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
        }}
        className="sr-only"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   List + row
   ───────────────────────────────────────────────────────────── */

function DemoList({
  demos,
  onDelete,
  onPatch,
}: {
  demos: Demo[];
  onDelete: (id: string) => void;
  onPatch: (id: string, patch: Partial<Demo>) => void;
}) {
  if (demos.length === 0) {
    return (
      <p className="text-driftwood py-8">
        No demos yet. Add the first one above.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-mist">
      {demos.map((demo) => (
        <DemoRow
          key={demo.id}
          demo={demo}
          onDelete={onDelete}
          onPatch={onPatch}
        />
      ))}
    </ul>
  );
}

function DemoRow({
  demo,
  onDelete,
  onPatch,
}: {
  demo: Demo;
  onDelete: (id: string) => void;
  onPatch: (id: string, patch: Partial<Demo>) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <EditDemoRow
        demo={demo}
        onSave={(updated) => {
          onPatch(demo.id, updated);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  const togglePublish = async () => {
    setBusy(true);
    const next = !demo.published;
    try {
      const res = await fetch("/api/admin/demos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: demo.id, published: next }),
      });
      if (!res.ok) throw new Error("Failed");
      onPatch(demo.id, { published: next });
    } catch {
      alert("Toggle failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (
      !confirm(
        `Delete "${demo.title}"? The audio file in R2 will be removed too.`
      )
    )
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/demos?id=${demo.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      onDelete(demo.id);
    } catch {
      alert("Delete failed. Try again.");
      setBusy(false);
    }
  };

  return (
    <li className="py-5 flex flex-wrap items-center gap-4">
      <audio
        src={demo.audio_url}
        controls
        preload="none"
        className="h-9 max-w-[280px]"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-abyss truncate">{demo.title}</p>
        <p className="text-xs text-driftwood mt-0.5">
          {demo.genre}
          {demo.character ? ` · ${demo.character}` : ""}
          {demo.duration_seconds
            ? ` · ${formatDuration(demo.duration_seconds)}`
            : ""}
        </p>
      </div>
      <button
        onClick={() => setEditing(true)}
        disabled={busy}
        className="text-xs text-driftwood hover:text-abyss transition-colors disabled:opacity-50"
      >
        Edit
      </button>
      <button
        onClick={togglePublish}
        disabled={busy}
        className={`text-xs px-3 py-1.5 rounded-full transition-opacity hover:opacity-80 ${
          demo.published
            ? "bg-kelp/15 text-kelp"
            : "bg-driftwood/15 text-driftwood"
        }`}
      >
        {demo.published ? "Published" : "Draft"}
      </button>
      <button
        onClick={remove}
        disabled={busy}
        className="text-xs text-driftwood hover:text-red-700 transition-colors disabled:opacity-50"
      >
        Delete
      </button>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────
   Edit row — inline form that replaces a DemoRow when editing
   ───────────────────────────────────────────────────────────── */

function EditDemoRow({
  demo,
  onSave,
  onCancel,
}: {
  demo: Demo;
  onSave: (updated: Demo) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(demo.title);
  const [genre, setGenre] = useState<string>(demo.genre);
  const [character, setCharacter] = useState(demo.character ?? "");
  const [description, setDescription] = useState(demo.description ?? "");
  const [sortOrder, setSortOrder] = useState(demo.sort_order);
  const [newAudioFile, setNewAudioFile] = useState<File | null>(null);

  const [status, setStatus] = useState<
    "idle" | "uploading" | "saving" | "err"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    setMessage("");

    try {
      // Start with the existing audio metadata; overwrite if the user
      // picked a replacement file.
      let audioUrl = demo.audio_url;
      let r2Key = demo.r2_key;
      let durationSeconds = demo.duration_seconds;

      if (newAudioFile) {
        setStatus("uploading");
        setProgress(0);

        const presignRes = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: newAudioFile.name,
            contentType: newAudioFile.type,
          }),
        });
        if (!presignRes.ok) {
          const err = await presignRes.json().catch(() => ({}));
          throw new Error(err.error || "Upload preparation failed");
        }
        const { uploadUrl, key, publicUrl } = await presignRes.json();
        await uploadToR2(uploadUrl, newAudioFile, setProgress);
        const dur = await getAudioDuration(newAudioFile);

        audioUrl = publicUrl;
        r2Key = key;
        durationSeconds = dur;
        setStatus("saving");
      }

      const saveRes = await fetch("/api/admin/demos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: demo.id,
          title,
          genre,
          character: character || null,
          description: description || null,
          audio_url: audioUrl,
          r2_key: r2Key,
          duration_seconds: durationSeconds,
          sort_order: sortOrder,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error || "Save failed");

      onSave(saveData.demo as Demo);
    } catch (err) {
      setStatus("err");
      setMessage(err instanceof Error ? err.message : "Failed.");
    }
  };

  const fieldClass =
    "w-full bg-transparent border-b border-abyss/30 focus:border-kelp outline-none py-3 text-base text-abyss placeholder:text-driftwood/60 transition-colors";
  const busy = status === "uploading" || status === "saving";

  return (
    <li className="py-5">
      <form
        onSubmit={submit}
        className="bg-shell border border-mist rounded-2xl p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display-italic text-xl text-abyss">
            Editing &ldquo;{demo.title}&rdquo;
          </h3>
          <span className="text-xs text-driftwood">id: {demo.id.slice(0, 8)}…</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="eyebrow block mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="eyebrow block mb-1">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className={fieldClass}
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="eyebrow block mb-1">Character / voice</label>
            <input
              type="text"
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="eyebrow block mb-1">Sort order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label className="eyebrow block mb-1">Blurb</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${fieldClass} resize-none`}
          />
        </div>

        <div>
          <p className="eyebrow mb-2">Replace audio (optional)</p>
          <FilePicker
            file={newAudioFile}
            onChange={setNewAudioFile}
            disabled={busy}
          />
          {!newAudioFile && (
            <p className="mt-2 text-xs text-driftwood">
              Leave empty to keep the current audio file. If you pick a new
              one, the old file is removed from R2 after the save.
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={busy || !title}
            className="lift-btn bg-abyss text-shore px-6 py-3 text-sm font-medium tracking-wide rounded-full hover:bg-tide disabled:opacity-50"
          >
            {status === "uploading"
              ? `Uploading ${progress}%`
              : status === "saving"
              ? "Saving..."
              : "Save"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="text-sm text-driftwood hover:text-abyss transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          {message && (
            <p className="text-sm text-red-700" role="alert">
              {message}
            </p>
          )}
        </div>
      </form>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────── */

function uploadToR2(
  url: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`R2 upload failed: HTTP ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Network error uploading to R2"));
    xhr.send(file);
  });
}

function getAudioDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    audio.src = url;
    audio.onloadedmetadata = () => {
      const dur = audio.duration;
      URL.revokeObjectURL(url);
      resolve(isFinite(dur) ? Math.round(dur) : null);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
  });
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
