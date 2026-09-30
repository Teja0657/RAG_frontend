/**
 * Strip common markdown syntax down to plain text.
 *
 * The RAG backend's answers are markdown-formatted, but the chat UI has no
 * markdown renderer, so raw symbols (**bold**, * bullets, # headings) were
 * showing up literally. This keeps the wording, drops the syntax.
 */
export function stripMarkdown(text) {
  if (!text) return text;

  return text
    // bold/italic: **text**, __text__, *text*, _text_ -> text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?!\*)/g, '$1')
    .replace(/(?<![_\w])_(?!\s)(.+?)(?<!\s)_(?!_)/g, '$1')
    // inline code: `text` -> text
    .replace(/`([^`]+)`/g, '$1')
    // heading markers: "### Title" -> "Title"
    .replace(/^#{1,6}\s+/gm, '')
    // bullet markers: "* item" / "- item" -> "• item"
    .replace(/^[ \t]*[-*]\s+/gm, '• ');
}
