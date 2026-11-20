/**
 * Renders structured resume data (produced by the AI service) into a plain,
 * professional, single-column A4 HTML document: centered name, contact row,
 * and uppercase section headings separated by thin horizontal lines.
 *
 * All text coming from the model is HTML-escaped, so the model never injects markup.
 */

const esc = (value) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")

const asArray = (value) => (Array.isArray(value) ? value : [])
const asText = (value) => (typeof value === "string" ? value.trim() : "")

const FONT_STACKS = {
    sans: "'Segoe UI', Arial, Helvetica, sans-serif",
    serif: "Georgia, 'Times New Roman', serif"
}

const DENSITY = {
    compact: { font: "9.5pt", gap: "8px" },
    normal: { font: "10pt", gap: "11px" },
    relaxed: { font: "10.5pt", gap: "14px" }
}

const ICONS = {
    phone: '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z"/></svg>',
    email: '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v.5l8 5 8-5V6H4zm16 12V9l-8 5-8-5v9h16z"/></svg>',
    location: '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
    link: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>'
}

function renderContact(contact) {
    const items = asArray(contact)
        .map(c => ({ type: ICONS[c?.type] ? c.type : "link", value: asText(c?.value) }))
        .filter(c => c.value)
    if (!items.length) return ""
    return `<div class="contact">${items.map(c => `<span>${ICONS[c.type]}${esc(c.value)}</span>`).join("")}</div>`
}

function renderEntries(entries) {
    return asArray(entries)
        .filter(e => asText(e?.title) || asText(e?.meta))
        .map(e => {
            const bullets = asArray(e.bullets).map(asText).filter(Boolean)
            return `<div class="entry">
                ${asText(e.meta) ? `<div class="meta">${esc(e.meta)}</div>` : ""}
                ${asText(e.title) ? `<div class="entry-title">${esc(e.title)}</div>` : ""}
                ${bullets.length ? `<ul class="bullets">${bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
            </div>`
        }).join("")
}

function renderSection(section, skillColumns) {
    const heading = asText(section?.heading)
    if (!heading) return ""

    let body = ""
    if (section.kind === "skills") {
        const skills = asArray(section.skills).map(asText).filter(Boolean)
        if (skills.length) {
            body = `<ul class="skills" style="column-count:${skillColumns}">${skills.map(s => `<li>${esc(s)}</li>`).join("")}</ul>`
        }
    } else if (section.kind === "entries") {
        body = renderEntries(section.entries)
    } else if (asText(section.text)) {
        body = `<p>${esc(section.text)}</p>`
    }

    if (!body) return ""
    return `<section><h2>${esc(heading)}</h2>${body}</section>`
}

function buildResumeHtml(data = {}) {
    const design = data.design || {}
    const fontStack = FONT_STACKS[design.fontStyle] || FONT_STACKS.sans
    const density = DENSITY[design.density] || DENSITY.normal
    const accent = /^#[0-9a-fA-F]{6}$/.test(design.accentColor || "") ? design.accentColor : "#222222"
    const columns = Math.min(4, Math.max(1, Math.round(Number(design.skillColumns)) || 3))

    const sections = asArray(data.sections).map(s => renderSection(s, columns)).filter(Boolean).join("")

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ${fontStack}; font-size: ${density.font}; line-height: 1.45; color: #222; }
    .name { text-align: center; font-size: 25pt; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: ${accent}; }
    .headline { text-align: center; font-size: 12.5pt; color: #333; margin-top: 2px; }
    .contact { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 14px; margin-top: 14px; padding-bottom: ${density.gap}; border-bottom: 1px solid #555; font-size: 9pt; color: #444; }
    .contact span { display: inline-flex; align-items: center; gap: 5px; }
    section { padding: ${density.gap} 0; border-bottom: 1px solid #555; }
    section:last-of-type { border-bottom: none; }
    h2 { font-size: 11.5pt; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase; color: ${accent}; margin-bottom: 6px; }
    .entry { margin-bottom: 8px; break-inside: avoid; }
    .entry:last-child { margin-bottom: 0; }
    .meta { font-size: 9.5pt; color: #666; }
    .entry-title { font-weight: 700; }
    ul.bullets { margin: 2px 0 0 16px; }
    ul.bullets li { margin-bottom: 1px; }
    ul.skills { list-style: disc; padding-left: 16px; column-gap: 18px; }
    ul.skills li { break-inside: avoid; margin-bottom: 2px; }
</style>
</head>
<body>
    <div class="name">${esc(asText(data.name) || "Your Name")}</div>
    ${asText(data.headline) ? `<div class="headline">${esc(data.headline)}</div>` : ""}
    ${renderContact(data.contact)}
    ${sections}
</body>
</html>`
}

module.exports = { buildResumeHtml }
