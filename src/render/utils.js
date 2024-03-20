export const getPostLinkClassName = (isRead) =>
  (isRead ? ['fw-normal', 'link-secondary'] : ['fw-bold']).join(' ');
