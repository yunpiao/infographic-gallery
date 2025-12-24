export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Serve static assets from the assets binding
    return env.ASSETS.fetch(request);
  },
};
