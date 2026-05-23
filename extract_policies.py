import re
import os

files = {
    "terms": r"C:\Users\Shaya\.gemini\antigravity\brain\8b098a1c-e6c0-45f6-940c-84c21824ae90\.system_generated\steps\1041\content.md",
    "privacy": r"C:\Users\Shaya\.gemini\antigravity\brain\8b098a1c-e6c0-45f6-940c-84c21824ae90\.system_generated\steps\1043\content.md",
    "cookies": r"C:\Users\Shaya\.gemini\antigravity\brain\8b098a1c-e6c0-45f6-940c-84c21824ae90\.system_generated\steps\1045\content.md",
    "affiliate": r"C:\Users\Shaya\.gemini\antigravity\brain\8b098a1c-e6c0-45f6-940c-84c21824ae90\.system_generated\steps\1047\content.md"
}

def clean_html(html_content):
    # Remove script, style, and meta tags
    html_content = re.sub(r'<(script|style|head|meta|link|header|footer|nav)[^>]*>([\s\S]*?)<\/\1>', '', html_content, flags=re.IGNORECASE)
    # Extract text content from tags
    text = re.sub(r'<[^>]+>', ' ', html_content)
    # Replace multiple spaces/newlines with single ones
    text = re.sub(r'\s+', ' ', text)
    # Let's also do a search for paragraph/header tags to keep line breaks if possible
    return text.strip()

for name, path in files.items():
    if not os.path.exists(path):
        print(f"File not found: {path}")
        continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Let's find headings and sections
    print(f"\n==================== {name.upper()} ====================")
    # Let's try to extract some readable paragraphs or lists.
    # To keep some formatting:
    # Replace block-level elements with newlines
    formatted = re.sub(r'<(p|div|li|h1|h2|h3|h4|h5|h6|tr|section|article)[^>]*>', '\n', content, flags=re.IGNORECASE)
    formatted = re.sub(r'<(script|style|head|meta|link|header|footer|nav)[^>]*>([\s\S]*?)<\/\1>', '', formatted, flags=re.IGNORECASE)
    formatted = re.sub(r'<[^>]+>', ' ', formatted)
    formatted = re.sub(r'[ \t]+', ' ', formatted)
    formatted = re.sub(r'\n\s*\n', '\n\n', formatted)
    
    # Save the cleaned text to a file so we can view it
    out_path = f"cleaned_{name}.txt"
    with open(out_path, 'w', encoding='utf-8') as out_f:
        out_f.write(formatted)
    print(f"Cleaned version saved to {out_path}")
