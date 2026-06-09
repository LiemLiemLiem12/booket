function sortObject(obj: Record<string, any>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const str: string[] = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }

  str.sort();

  for (let i = 0; i < str.length; i++) {
    const currentKey = str[i];

    const value = obj[currentKey];
    if (value !== undefined && value !== null) {
      sorted[currentKey] = encodeURIComponent(String(value)).replace(
        /%20/g,
        '+',
      );
    }
  }

  return sorted;
}

export default sortObject;
