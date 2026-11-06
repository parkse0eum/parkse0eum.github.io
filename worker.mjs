// Run before HTML navigation only; images, fonts and bundles keep the direct
// static-asset path. Never serve the site's entry page over plain HTTP.
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.protocol === 'http:') {
      url.protocol = 'https:'
      return Response.redirect(url.toString(), 301)
    }
    const response = await env.ASSETS.fetch(request)
    const headers = new Headers(response.headers)
    headers.set('Strict-Transport-Security', 'max-age=31536000')
    headers.set('Content-Security-Policy', 'upgrade-insecure-requests')
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
  },
}
