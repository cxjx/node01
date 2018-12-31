var system = require('system');
var page = require('webpage').create();
page.viewportSize = { width: 1920, height: 10800 };
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36';
page.settings.resourceTimeout = 5000;

if (system.args.length === 1) {
  // console.log('Usage: loadspeed.js <some URL>');
  phantom.exit();
}

var url = system.args[1];
var debug = system.args[2];

var imageContentTypes = [
  'image/png',
  'image/jpeg',
  'image/gif'
];

// if (debug) console.log('[debug] trying to open', url);

var images = [];

page.onResourceRequested = function(requestData, networkRequest) {
  // This callback is invoked when the page requests a resource.
  // The requestData metadata object contains these properties:
  // id : the number of the requested resource
  // method : http method
  // url : the URL of the requested resource
  // time : Date object containing the date of the request
  // headers : list of http headers

  // The networkRequest object contains these functions:
  // abort() : aborts the current network request. Aborting the current network request will invoke onResourceError callback.
  // changeUrl(newUrl) : changes the current URL of the network request. By calling networkRequest.changeUrl(newUrl), we can change the request url to the new url. This is an excellent and only way to provide alternative implementation of a remote resource. (see Example-2)
  // setHeader(key, value)

  // console.log('[onResourceRequested]#'
  //   + '|' + requestData.id
  //   + '|' + requestData.method
  //   + '|' + requestData.url.split('?')[0].split('.').pop()
  //   // + '|' + requestData.url
  // );
  if(/\.(jpe?g|png|gif|svg)(\?.*)?/i.test(requestData.url)){
    images.push({
      contentType: 'onResourceRequested',
      url: requestData.url
    });
    networkRequest.abort();
  }

  // var match = requestData.url.match(/wordfamily.js/g);
  // if (match != null) {
  //   // newWordFamily.js is an alternative implementation of wordFamily.js and is available in local path
  //   networkRequest.changeUrl('newWordFamily.js');
  // }
};
page.onResourceReceived = function(response) {
  // This callback is invoked when a resource requested by the page is received.
  // The response metadata object contains these properties:
  // id : the number of the requested resource
  // url : the URL of the requested resource
  // time : Date object containing the date of the response
  // headers : list of http headers
  // bodySize : size of the received content decompressed (entire content or chunk content)
  // contentType : the content type if specified
  // redirectURL : if there is a redirection, the redirected URL
  // stage : “start”, “end” (FIXME: other value for intermediate chunk?)
  // status : http status code. ex: 200
  // statusText : http status text. ex: OK


  // console.log('[onResourceReceived] ' + JSON.stringify(response.headers));
  var contentTypeHeader = response.headers.filter(function(header) {
    return header.name == 'Content-Type';
  })[0];
  var contentType = contentTypeHeader ? contentTypeHeader.value : '';
  if(imageContentTypes.indexOf(contentType) != -1) {
    images.push({
      contentType: contentType,
      url: response.url
    })
  }
};
page.onResourceError = function(resourceError) {
  // This callback is invoked when a web page was unable to load resource.
  // The resourceError metadata object contains these properties:
  // id : the number of the request
  // url : the resource url
  // errorCode : the error code
  // errorString : the error description

  // console.log('[onResourceError]#'
  //   + '|' + resourceError.id
  //   + '|' + resourceError.errorCode
  //   + '|' + resourceError.errorString
  //   // + '|' + resourceError.url.split('?')[0].split('.').pop()
  //   + '|' + resourceError.url
  // );
};
page.onError = function(msg, trace) {
  // This callback is invoked when there is a JavaScript execution error.

  // var msgStack = ['[onError]#' + msg];
  // if (trace && trace.length) {
  //   msgStack.push('TRACE:');
  //   trace.forEach(function(t) {
  //     msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
  //   });
  // }
  // console.log(msgStack.join('|'));
};
page.onConsoleMessage = function(msg, lineNum, sourceId) {
  // This callback is invoked when there is a JavaScript console message on the web page.

  // console.log('[onConsoleMessage]#'
  //   + '|' + sourceId
  //   + '|' + lineNum
  //   + '|' + msg
  // );
};
page.onResourceTimeout = function(request) {
  // This callback is invoked when a resource requested by the page timeout according to settings.resourceTimeout.
  // The request metadata object contains these properties:
  // id: the number of the requested resource
  // method: http method
  // url: the URL of the requested resource
  // time: Date object containing the date of the request
  // headers: list of http headers
  // errorCode: the error code of the error
  // errorString: text message of the error

  // console.log('[onResourceTimeout]#'
  //   + '|' + request.id
  //   + '|' + request.method
  //   + '|' + request.time
  //   + '|' + request.errorCode
  //   + '|' + request.errorString
  //   + '|' + request.url
  // );
  if(/\.(jpe?g|png|gif)(\?.*)?/i.test(request.url)){
    images.push({
      contentType: 'onResourceTimeout',
      url: request.url
    })
  }

  // system.stderr.write('[data]' + JSON.stringify(images));
  // phantom.exit(408);
};

page.open(url, function(status) {
  // Opens the url and loads it to the page.
  // Once the page is loaded, the optional callback is called using page.onLoadFinished,
  // with the page status ('success' or 'fail') provided to it.

  // console.log('[onLoadFinished]#'
  //   + status
  // );
  system.stderr.setEncoding('utf-8');
  // system.stderr.write('[data]' + JSON.stringify(images));
  system.stderr.write(JSON.stringify(images));
  system.stderr.flush();
  phantom.exit(200);
});
