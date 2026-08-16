function handler(event) {
    var request = event.request;
    if (request.uri.startsWith('/images/')) {
        request.uri = request.uri.replace(/^\/images/, '');
    }
    return request;
}
