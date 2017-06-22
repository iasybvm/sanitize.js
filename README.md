# sanitize.js
sanitize module stolen from angular-sanitize.js,  it is an in-browser xss protection mechanize.

It supplies two function: sanitize.sanitize and sanitize.sanitize_url.

1 sanitize(html, svgEnabled)
sanitize can be used to filter dangerous tags in string @html,  and @svgEnabled controls whether svg tag is valid in @html. svgEnabled defaults false.

2 sanitize_url(uri, image)
sanitize_url is used to filtering dangerous attributes of @uri,  and @image controls whether we are filtering an image tag,  default false.  The function considers we are filtering an non-image tag.
