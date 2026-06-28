"use client";

import { useEffect, useRef, useState } from "react";

const projectTypes = [
  "Audiobook narration",
  "Single chapter / sample",
  "Character / video game voice",
  "Commercial / promo",
  "Other",
];

/**
 * Custom dropdown that matches the form's underline-input aesthetic.
 * Replaces native <select> so the open menu doesn't fall back to the
 * browser's default styling.
 *
 * Keyboard: Space/Enter to open, ↑↓ to navigate, Enter to choose,
 * Esc to dismiss. Click outside to close.
 *
 * Form integration: a hidden input carries the value so FormData picks
 * it up like any other field.
 */
function ProjectTypeSelect() {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, projectTypes.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setValue(projectTypes[activeIdx]);
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, activeIdx]);

  return (
    <div className="relative" ref={wrapRef}>
      <label htmlFor="project_type_btn" className="eyebrow block mb-1">
        Project type
      </label>
      <input type="hidden" name="project_type" value={value} />
      <button
        id="project_type_btn"
        ref={btnRef}
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open && value) {
            setActiveIdx(projectTypes.indexOf(value));
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full bg-transparent border-b border-abyss/30 focus:border-kelp outline-none py-3 text-base text-abyss text-left flex items-center justify-between transition-colors"
      >
        <span className={value ? "" : "text-driftwood/60"}>
          {value || "Pick one"}
        </span>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          aria-hidden="true"
          className={`text-driftwood transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Project type"
          className="dropdown-menu absolute z-20 left-0 right-0 top-full mt-3 bg-shell border border-mist rounded-2xl py-2 overflow-hidden"
        >
          {projectTypes.map((type, i) => {
            const selected = value === type;
            const active = activeIdx === i;
            return (
              <li key={type} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    setValue(type);
                    setOpen(false);
                    btnRef.current?.focus();
                  }}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`w-full text-left px-5 py-2.5 text-abyss text-base flex items-center justify-between transition-colors ${
                    active ? "bg-mist/45" : ""
                  } ${selected ? "font-medium" : ""}`}
                >
                  <span>{type}</span>
                  {selected && (
                    <svg
                      width="14"
                      height="10"
                      viewBox="0 0 14 10"
                      fill="none"
                      aria-hidden="true"
                      className="text-kelp"
                    >
                      <path
                        d="M1 5L5 9L13 1"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    if (!fd.get("project_type")) {
      setStatus("err");
      setMessage("Pick a project type so I can route your inquiry right.");
      return;
    }

    setStatus("loading");
    setMessage("");

    const payload = Object.fromEntries(fd.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went sideways.");
      setStatus("ok");
      setMessage(
        "Got it — your message is on its way to Reinita. Expect a reply within a few days."
      );
      form.reset();
    } catch (err) {
      setStatus("err");
      setMessage(err instanceof Error ? err.message : "Try again in a minute.");
    }
  };

  const fieldClass =
    "w-full bg-transparent border-b border-abyss/30 focus:border-kelp outline-none py-3 text-base text-abyss placeholder:text-driftwood/60 transition-colors";

  return (
    <form onSubmit={submit} className="space-y-7" noValidate>
      {/* Honeypot for bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] opacity-0"
        aria-hidden="true"
      />

      <div className="grid gap-7 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="eyebrow block mb-1">
            Your name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className={fieldClass}
            placeholder="Author, producer, casting director…"
          />
        </div>

        <div>
          <label htmlFor="email" className="eyebrow block mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={fieldClass}
            placeholder="you@somewhere.com"
          />
        </div>
      </div>

      <ProjectTypeSelect />

      <div className="grid gap-7 md:grid-cols-2">
        <div>
          <label htmlFor="genre" className="eyebrow block mb-1">
            Genre (optional)
          </label>
          <input
            id="genre"
            name="genre"
            type="text"
            className={fieldClass}
            placeholder="Romantasy, paranormal romance, MG fantasy…"
          />
        </div>
        <div>
          <label htmlFor="deadline" className="eyebrow block mb-1">
            Target start / deadline (optional)
          </label>
          <input
            id="deadline"
            name="deadline"
            type="text"
            className={fieldClass}
            placeholder="ASAP, by March, flexible…"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="eyebrow block mb-1">
          Tell me about the book
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className={fieldClass + " resize-y"}
          placeholder="Word count, royalty / PFH, deadline, sample link, anything else I should know…"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="lift-btn bg-abyss text-shore px-8 py-3.5 text-sm font-medium tracking-wide rounded-full hover:bg-tide disabled:opacity-50"
        >
          {status === "loading" ? "Sending…" : "Send inquiry →"}
        </button>
        {message && (
          <p
            className={`text-sm max-w-md ${
              status === "ok" ? "text-kelp" : "text-red-700"
            }`}
            role="status"
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
