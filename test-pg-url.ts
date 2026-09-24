function parseAndFixPgUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  try {
    const match = rawUrl.match(/^(postgres(?:ql)?:\/\/)(.+)(@[\w\.-]+:\d+\/.*)$/i);
    if (match) {
      const prefix = match[1];
      const creds = match[2];
      const suffix = match[3];
      const firstColonIndex = creds.indexOf(':');
      if (firstColonIndex !== -1) {
        const user = creds.substring(0, firstColonIndex);
        const pass = creds.substring(firstColonIndex + 1);
        const encUser = encodeURIComponent(decodeURIComponent(user));
        const encPass = encodeURIComponent(decodeURIComponent(pass));
        return `${prefix}${encUser}:${encPass}${suffix}`;
      }
    }
  } catch (e) {}
  return rawUrl;
}
console.log(parseAndFixPgUrl('postgresql://bivaaxtrader@gmail.com:Mdhasan2k256@@@bivaax-databas-6hf52t:5432/postgres'));
