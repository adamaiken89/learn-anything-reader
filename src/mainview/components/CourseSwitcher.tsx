import { useState, useEffect, useRef } from "react";
import { api } from "../api";
import type { Subject } from "../../bun/types";

interface Props {
  currentSubjectId?: string;
  onSelect: (subject: Subject) => void;
}

export default function CourseSwitcher({ currentSubjectId, onSelect }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.subjects.list().then(setSubjects);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = subjects.find((s) => s.id === currentSubjectId);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2 max-w-[200px]"
      >
        <span className="truncate">{current?.displayName || "Courses"}</span>
        <span className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {subjects.length === 0 && (
            <div className="p-3 text-sm text-gray-500">No courses found</div>
          )}
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => { onSelect(s); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                s.id === currentSubjectId
                  ? "bg-indigo-600/20 text-indigo-300"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <div className="font-medium truncate">{s.displayName}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.modules.length} modules · {s.timeBudgetHours}h</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
