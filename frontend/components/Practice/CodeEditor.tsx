'use client';

import { useEffect, useRef } from 'react';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
}

export default function CodeEditor({ code, language, onChange }: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current) {
      import('monaco-editor').then((monaco) => {
        if (editorRef.current) {
          editorRef.current.dispose();
        }

        editorRef.current = monaco.editor.create(containerRef.current!, {
          value: code,
          language: language,
          theme: 'vs-dark',
          automaticLayout: true,
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        });

        editorRef.current.onDidChangeModelContent(() => {
          onChange(editorRef.current.getValue());
        });
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, [language]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== code) {
      editorRef.current.setValue(code);
    }
  }, [code]);

  return <div ref={containerRef} className="h-full w-full" />;
}
