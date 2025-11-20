const gpl_text = "ading2210/edpuzzle-answers: a Javascript bookmarklet that provides many useful utilities for Edpuzzle\nCopyright (C) 2025 ading2210\n\nThis program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.\n\nThis program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.\n\nYou should have received a copy of the GNU Affero General Public License along with this program.If not, see <https://www.gnu.org/licenses/>.";

function http_get(e, t, n = [], o = "GET", i = null) {
    var s = new XMLHttpRequest;
    s.addEventListener("load", t);
    s.open(o, e, !0);
    if (window.__EDPUZZLE_DATA__ && window.__EDPUZZLE_DATA__.token && "edpuzzle.com" == new URL(e).hostname)
        n.push(["authorization", window.__EDPUZZLE_DATA__.token]);
    for (const e of n) s.setRequestHeader(e[0], e[1]);
    s.send(i)
}

function format_text(e, t) {
    let n = e;
    for (let e of Object.keys(t))
        for (; n.includes("{{" + e + "}}");) n = n.replace("{{" + e + "}}", t[e]);
    return n
}

function init() {
    console.info(gpl_text);
    window.real_location = window.location;
    window.__uv && (window.real_location = __uv.location);
    if ("edpuzzle.hs.vc" == window.real_location.hostname)
        alert("To use this, drag this button into your bookmarks bar. Then, run it when you're on an Edpuzzle assignment.");
    else if (/https?:\/\/edpuzzle.com\/(lms\/lti\/)?assignments\/[a-f0-9]{1,30}\/(watch|view)/.test(window.real_location.href))
        http_get("https://cdn.jsdelivr.net/gh/mojhehh/edpuzzle_hacky@main/popup.html", open_popup);
    else if (window.canvasReadyState)
        handle_canvas_url();
    else if (window.schoologyMoreLess)
        handle_schoology_url();
    else
        alert("Please run this script on an Edpuzzle assignment. For reference, the URL should look like this:\nhttps://edpuzzle.com/assignments/{ASSIGNMENT_ID}/watch");
}

function open_popup() {
    const e = window.open("about:blank", "", "width=760, height=450");
    if (!e) {
        alert("Error: Could not open the popup. Please enable popups for edpuzzle.com and try again.");
        return;
    }
    write_popup(e, this.responseText);
    e.addEventListener("beforeunload", function reload() {
        http_get("https://cdn.jsdelivr.net/gh/mojhehh/edpuzzle_hacky@main/popup.html", function() {
            if (!e.closed) {
                write_popup(e, this.responseText);
                e.addEventListener("beforeunload", reload);
            }
        });
    });
}

function write_popup(e, t) {
    e.document.edpuzzle_data = window.__EDPUZZLE_DATA__;
    e.document.gpl_text = gpl_text;
    e.document.write(t);
    let appendToHead = function(tag, content) {
        let el = e.document.createElement(tag);
        el.innerHTML = content;
        e.document.head.append(el);
        return el;
    };
    http_get("https://cdn.jsdelivr.net/gh/mojhehh/edpuzzle_hacky@main/styles/popup.css", function() {
        appendToHead("style", this.responseText);
    });
    http_get("https://cdn.jsdelivr.net/gh/mojhehh/edpuzzle_hacky@main/main.js", function() {
        appendToHead("script", this.responseText);
    });
}

function handle_canvas_url() {
    let e = window.real_location.href.split("/");
    http_get(`/api/v1/courses/${e[4]}/assignments/${e[6]}`, function() {
        http_get(JSON.parse(this.responseText).url, function() {
            let e = JSON.parse(this.responseText).url;
            alert('Please re-run this script in the newly opened tab. If nothing happens after pressing "ok", then allow popups on Canvas and try again.');
            open(e);
        });
    });
}

function handle_schoology_url() {
    http_get(`/external_tool/${window.real_location.href.split("/")[4]}/launch/iframe`, function() {
        alert('Please re-run this script in the newly opened tab. If nothing happens after pressing "ok", then allow popups on Schoology and try again.');
        let e = this.responseText.replace(/<script[\s\S]+?<\/script>/, ""),
            t = document.createElement("div");
        t.innerHTML = e;
        let n = t.querySelector("form"),
            o = document.createElement("input");
        o.setAttribute("type", "hidden");
        o.setAttribute("name", "ext_submit");
        o.setAttribute("value", "Submit");
        n.append(o);
        document.body.append(t);
        n.setAttribute("target", "_blank");
        n.submit();
        t.remove();
    });
}

init();
