(function(win){
    win.CY = win.CY || {};
    var CTYPE = "Content-Type", AJSON = "application/json", FUCODE = "application/x-www-form-urlencoded";
    var ajaxSettings = {
        async: true,
        dataType :"json",
        accepts: {
            xml: "application/xml, text/xml",
            html: "text/html",
            script: "text/javascript, application/javascript",
            json: "application/json, text/javascript",
            text: "text/plain",
            _default: "*/*"
        }
    }
    var globalEval = function(data) {
        if (data && /\S/.test(data)) {
            var head = document.getElementsByTagName("head")[0] || document.documentElement
                , script = document.createElement("script");
            script.type = "text/javascript";
            script.text = data;
            head.insertBefore(script, head.firstChild);
            head.removeChild(script);
        }
    }
    var httpData = function (xhr, type, s) {
        var ct = xhr.getResponseHeader("content-type")
            , xml = type == "xml" || !type && ct && ct.indexOf("xml") >= 0
            , data = xml ? xhr.responseXML : xhr.responseText;
        if (xml && data.documentElement.tagName == "parsererror")
            throw "parsererror";
        if (typeof data === "string") {
            if (type == "script")
                globalEval(data);
            if (type == "json")
                data = win["eval"]("(" + data + ")");
        }
        return data;
    }
    var param = function(data) {
        var arr = [], _key;
        for ( _key in data || {}) {
            if (data.hasOwnProperty(_key)) {
                arr.push(_key + "=" + data[_key]);
            }
        }
        return arr.join("&");
    }

    function ajax(url = "", request = {}) {
        var method = (request.method || "GET").toUpperCase();
        var success = request.success || function () {};
        var error = request.error || function () {};
        request = Object.assign({}, ajaxSettings, request);
        request.headers = request.headers || {};
        request.headers ["Accept"] = request.accepts[ request.dataType || "" ] ? request.accepts[ request.dataType ] + ", */*" :  request.accepts._default;
        if (method == 'GET') {
            url += (url.match(/\?/) ? "&" : "?") + param(request.body);
            request.body = null;
            delete request.headers[CTYPE];
        } else if (method == 'POST') {
            if (request.headers[CTYPE] == AJSON) {
                request.body = JSON.stringify(request.body);
            } else {
                request.body = param(request.body);
                request.headers[CTYPE] = FUCODE;
            }
        } else {
            request.body =  JSON.stringify(request.body);
            request.headers[CTYPE] = AJSON;
        }
        return new Promise(function (resolve, reject) {
            var xhr = win.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject();
            var requestDone = false, status, data, ival, runclear, onreadystatechange;
            runclear = function() {
                ival && clearInterval(ival), ival = null;
            }
            onreadystatechange = function (isTimeout) {
                if (xhr.readyState == 0) {
                    runclear();
                } else if (!requestDone && xhr && (xhr.readyState == 4 && (( xhr.status >= 200 && xhr.status < 300 ) || xhr.status == 304) || isTimeout == "timeout")) {
                    requestDone = true;
                    runclear();
                    status = isTimeout == "timeout" ? "timeout" : "success";
                    if (status == "success") {
                        try {
                            data = httpData(xhr, request.dataType, request);
                        } catch (e) {
                            status = "parsererror";
                        }
                    }
                    if (status == "success") {
                        success.call(request,data);
                        resolve(data);
                    } else {
                        error.call(request,{msg: status});
                        reject({msg: status});
                    }
                    isTimeout && xhr.abort();
                    request.async && (xhr = null);
                }
            }
            if (request.username) {
                xhr.open(method, url, request.async, request.username, request.password);
            } else {
                xhr.open(method, url, request.async);
            }
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            request.headers && Object.keys(request.headers).forEach(function(key){
                xhr.setRequestHeader(key, request.headers[key]);
            })
            if (request.beforeSend && request.beforeSend(xhr, request) === false) {
                xhr.abort();
                return false;
            }
            if (request.async) {
                ival = setInterval(onreadystatechange, 13);
                if (request.timeout) {
                    setTimeout(function() {
                        xhr && !requestDone && onreadystatechange("timeout");
                    }, request.timeout);
                }
            }
            try {
                xhr.send(request.body || null);
            } catch(e) {
                error(e);
                reject(e);
            }
            !request.async && onreadystatechange();
        })
    }

    win.CY.ajax = ajax;
    if ( typeof define === "function" && define.amd) {
        define("ajax", [], function () { return ajax; } );
    }
})(window);