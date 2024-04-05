export default (data) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(data, 'application/xml');
  const titleEl = xmlDoc.querySelector('title');
  const feedTitle = titleEl.textContent;
  const descriptionEl = xmlDoc.querySelector('description');
  const feedDescription = descriptionEl.textContent;
  const items = xmlDoc.querySelectorAll('item');
  const posts = [...items].map((i) => {
    const title = i.querySelector('title').textContent;
    const description = i.querySelector('description').textContent;
    const link = i.querySelector('link').textContent;
    return {
      title,
      description,
      link,
    };
  });

  return {
    title: feedTitle,
    description: feedDescription,
    posts,
  };
};
