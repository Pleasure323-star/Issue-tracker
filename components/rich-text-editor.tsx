"use client";

import {
  useCallback,
  useId,
  useRef,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { Textarea } from "@/components/ui/textarea";
import { wrapSelection, type WrapKind } from "@/lib/rich-text";

type RichTextEditorProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  rows?: number;
  footer?: ReactNode;
  "aria-label"?: string;
} & Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange" | "children"
>;

function ToolbarButton({
  label,
  title,
  disabled,
  onClick,
}: {
  label: string;
  title: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="rounded px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
    >
      {label}
    </button>
  );
}

export function RichTextEditor({
  id,
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  required,
  minLength,
  maxLength,
  rows = 6,
  footer,
  "aria-label": ariaLabel,
  className = "",
  ...rest
}: RichTextEditorProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyWrap = useCallback(
    (kind: WrapKind) => {
      const el = textareaRef.current;
      if (!el || disabled) return;
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const next = wrapSelection(value, start, end, kind);
      onChange(next.value);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(next.selectionStart, next.selectionEnd);
      });
    },
    [disabled, onChange, value],
  );

  return (
    <div className="space-y-1.5">
      <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/20">
        <div
          className="flex flex-wrap gap-0.5 border-b border-slate-200 bg-slate-50 px-1.5 py-1"
          role="toolbar"
          aria-label="Formatting"
        >
          <ToolbarButton
            label="Bold"
            title="Bold"
            disabled={disabled}
            onClick={() => applyWrap("bold")}
          />
          <ToolbarButton
            label="Italic"
            title="Italic"
            disabled={disabled}
            onClick={() => applyWrap("italic")}
          />
          <ToolbarButton
            label="Underline"
            title="Underline"
            disabled={disabled}
            onClick={() => applyWrap("underline")}
          />
          <ToolbarButton
            label="Bullet"
            title="Bulleted list"
            disabled={disabled}
            onClick={() => applyWrap("ul")}
          />
          <ToolbarButton
            label="Numbered"
            title="Numbered list"
            disabled={disabled}
            onClick={() => applyWrap("ol")}
          />
          <ToolbarButton
            label="Code"
            title="Inline code"
            disabled={disabled}
            onClick={() => applyWrap("code")}
          />
          <ToolbarButton
            label="Block"
            title="Code block"
            disabled={disabled}
            onClick={() => applyWrap("codeBlock")}
          />
          <ToolbarButton
            label="Link"
            title="Link"
            disabled={disabled}
            onClick={() => applyWrap("link")}
          />
        </div>
        <Textarea
          {...rest}
          ref={textareaRef}
          id={fieldId}
          name={name}
          value={value}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={`rounded-none border-0 shadow-none focus:border-transparent focus:ring-0 ${className}`}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      {footer}
    </div>
  );
}
