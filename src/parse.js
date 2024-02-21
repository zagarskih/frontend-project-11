export default (data, link) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'application/xml');
    const titleEl = xmlDoc.getElementsByTagName('title')[0];
    const feedTitle = titleEl.textContent;
    const descriptionEl = xmlDoc.getElementsByTagName('description')[0];
    const feedDescription = descriptionEl.textContent;
    const items = xmlDoc.getElementsByTagName('item');
    const posts = [...items].map((i) => {
      const title = i.querySelector('title').textContent;
      const description = i.querySelector('description').textContent;
      const link = i.querySelector('link').textContent;
      return {
        title,
        description,
        link,
      }
    });

    return {
      title: feedTitle,
      description: feedDescription,
      link,
      posts,
    }
  } catch (error){
    throw new Error('errors.invalidRss');
  }
};
