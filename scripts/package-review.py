"""Package the static build for direct file:// review; requires Python 3."""
from pathlib import Path
from html.parser import HTMLParser
import os
import re
import zipfile

root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
destination = root / 'downloads/Victoria-website-review-build.zip'

def relative(url, page):
    if not url.startswith('/') or url.startswith('//'):
        return url
    path, suffix = re.match(r'([^?#]*)(.*)', url).groups()
    target = dist / path.lstrip('/')
    if target.is_dir():
        target /= 'index.html'
    if not target.is_file():
        raise ValueError(f'Missing local resource: {url} in {page}')
    return Path(os.path.relpath(target, page.parent)).as_posix() + suffix

class PortableHTML(HTMLParser):
    def __init__(self, page):
        super().__init__(convert_charrefs=False)
        self.page, self.parts = page, []

    def handle_starttag(self, tag, attrs):
        raw = self.get_starttag_text()
        def replace(match):
            name, quote, value = match.groups()
            if name == 'srcset':
                value = ', '.join(' '.join([relative(bits[0], self.page), *bits[1:]])
                                  for item in value.split(',') if (bits := item.split()))
            else:
                value = relative(value, self.page)
            return f'{name}={quote}{value}{quote}'
        self.parts.append(re.sub(r'\b(href|src|srcset)=([' + '\"\'' + r'])(.*?)\2', replace, raw))

    handle_startendtag = handle_starttag
    def handle_endtag(self, tag): self.parts.append(f'</{tag}>')
    def handle_data(self, data): self.parts.append(data)
    def handle_entityref(self, name): self.parts.append(f'&{name};')
    def handle_charref(self, name): self.parts.append(f'&#{name};')
    def handle_comment(self, data): self.parts.append(f'<!--{data}-->')
    def handle_decl(self, decl): self.parts.append(f'<!{decl}>')

destination.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in sorted(dist.rglob('*')):
        if not file.is_file(): continue
        data = file.read_bytes()
        if file.suffix == '.html':
            parser = PortableHTML(file)
            parser.feed(data.decode())
            data = ''.join(parser.parts).encode()
        elif file.suffix == '.css':
            data = re.sub(r'url\((/[^)]+)\)', lambda m: f'url({relative(m[1], file)})', data.decode()).encode()
        archive.writestr(file.relative_to(dist).as_posix(), data)
    archive.writestr('START-HERE.txt', 'VICTORIA WEBSITE REVIEW\n\n1. Extract ALL files from this ZIP into one folder.\n2. Open index.html in Chrome, Edge, Firefox or Safari.\n\nKeep the folders together. No installation or server is required.\nEnquiry buttons prepare drafts; they do not send messages automatically.\nThis is an offline review copy. Use the source project to build for deployment.\n')
print(destination)
