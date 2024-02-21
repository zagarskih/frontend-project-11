const updateFeed = (state, feed) => {
  const links = state.posts.map(({ link }) => link);
  const newPosts = feed.posts.filter((post) => !links.includes(post.link));
  if (newPosts.length === 0) {
    console.log('No new posts found');
    return;
  }
  const feedLinks = state.feeds.map(({ link }) => link);
  if (!feedLinks.includes(feed.link)) {
    state.feeds = [feed, ...state.feeds];
  }
  state.posts = [...newPosts, ...state.posts];
  state.validation = true;
  state.loadingStatus = 'success';
  state.isError = false;
};

export default updateFeed;