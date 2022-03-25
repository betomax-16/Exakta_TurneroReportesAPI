export function diacriticSensitiveRegex(string: string): string {
    return string.replace(/[a|A]/g, '[a,á,à,ä,â]')
       .replace(/[e|E]/g, '[e,é,ë,è,ê]')
       .replace(/[i|I]]/g, '[i,í,ï,ì,î]')
       .replace(/[o|O]/g, '[o,ó,ö,ò,ô]')
       .replace(/[u|U]/g, '[u,ü,ú,ù,û]');
}