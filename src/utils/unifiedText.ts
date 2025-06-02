function unifiedText(title: string): string {
  return title.split(' ').join('-').toLowerCase();
}

export default unifiedText;
