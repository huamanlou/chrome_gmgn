console.log("js inject");

if (typeof GMGN_IS_INJECT == "undefined") {
  GMGN_IS_INJECT = false;
}

(function (xhr) {
  //   console.log("iiiiii", IS_INJECT);
  if (GMGN_IS_INJECT) {
    return;
  }
  //防止重复注入
  GMGN_IS_INJECT = true;
  var XHR = XMLHttpRequest.prototype;
  var send = XHR.send;
  XHR.send = function (postData) {
    this.addEventListener("load", function () {
      //   var myUrl = this._url ? this._url.toLowerCase() : this._url;
      //   console.log("ttttt", this.responseURL);
      if (this.responseType != "blob" && this.responseText) {
        try {
          var text = this.responseText;
          // 发送消息到content.js
          window.postMessage({
            type: "request_data",
            url: this.responseURL,
            text: text,
          });
          //   console.log("注入脚本发送获取list: ", JSON.parse(text));
        } catch (err) {
          console.log("注入脚本error", err);
        }
      }
    });
    return send.apply(this, arguments);
  };
})(XMLHttpRequest);
