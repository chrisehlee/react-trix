"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var TrixEditor = (function (_super) {
    __extends(TrixEditor, _super);
    function TrixEditor(props) {
        var _this = _super.call(this, props) || this;
        _this.container = null;
        _this.editor = null;
        _this.d = null;
        _this.id = _this.generateId();
        _this.state = {};
        return _this;
    }
    TrixEditor.prototype.generateId = function () {
        var timestamp = Date.now();
        var uniqueNumber = 0;
        (function () {
            if (timestamp <= uniqueNumber) {
                timestamp = ++uniqueNumber;
            }
            else {
                uniqueNumber = timestamp;
            }
        })();
        return "T" + timestamp.toString();
    };
    TrixEditor.prototype.componentDidMount = function () {
        var _this = this;
        var props = this.props;
        this.container = document.getElementById("editor-" + this.id);
        if (this.container) {
            this.container.addEventListener("trix-initialize", function () {
                _this.editor = _this.container.editor;
                if (!_this.editor) {
                    console.error("cannot  find trix editor");
                }
                if (props.onEditorReady && typeof props.onEditorReady == "function") {
                    props.onEditorReady(_this.editor);
                }
            }, false);
            this.container.addEventListener("trix-change", this.handleChange.bind(this), false);
            if (props.uploadURL) {
                this.container.addEventListener("trix-attachment-add", this.handleUpload.bind(this));
            }
        }
        else {
            console.error("editor not found");
        }
    };
    TrixEditor.prototype.componentWillUnmount = function () {
        this.container.removeEventListener("trix-initialize", this.handleChange);
        this.container.removeEventListener("trix-change", this.handleChange);
        if (this.props.uploadURL) {
            this.container.removeEventListener("trix-attachment-add", this.handleUpload);
        }
    };
    TrixEditor.prototype.handleChange = function (e) {
        var props = this.props;
        var text = e.target.innerText;
        if (props.onChange) {
            props.onChange(e.target.innerHTML, text);
        }
    };
    TrixEditor.prototype.handleUpload = function (e) {
        var attachment = e.attachment;
        if (attachment.file) {
            return this.uploadAttachment(attachment);
        }
    };
    TrixEditor.prototype.uploadAttachment = function (attachment) {
        var file, form, xhr;
        file = attachment.file;
        form = new FormData();
        if (this.props.uploadData) {
            for (var k in this.props.uploadData) {
                form.append(k, this.props.uploadData[k]);
            }
        }
        form.append("file", file);
        xhr = new XMLHttpRequest();
        xhr.open("POST", this.props.uploadURL, true);
        xhr.upload.onprogress = function (event) {
            var progress = (event.loaded / event.total) * 100;
            return attachment.setUploadProgress(progress);
        };
        xhr.onload = function () {
            var href, url;
            if (xhr.status >= 200 && xhr.status < 300) {
                url = href = xhr.responseText;
                return attachment.setAttributes({
                    url: url,
                    href: href
                });
            }
        };
        return xhr.send(form);
    };
    TrixEditor.prototype.render = function () {
        var _this = this;
        var props = this.props;
        var attributes = {
            id: "editor-" + this.id,
            input: "input-" + this.id,
            class: "" + (props.className ? props.className : "")
        };
        if (props.autoFocus) {
            attributes["autoFocus"] = props.autoFocus.toString();
        }
        if (props.placeholder) {
            attributes["placeholder"] = props.placeholder;
        }
        if (props.toolbar) {
            attributes["toolbar"] = props.toolbar;
        }
        return (React.createElement("div", { id: "trix-editor-top-level", ref: function (d) { return (_this.d = d); }, style: { position: "relative" } },
            React.createElement("trix-editor", attributes),
            React.createElement("input", { type: "hidden", id: "input-" + this.id, value: this.props.value })));
    };
    return TrixEditor;
}(React.Component));
exports.TrixEditor = TrixEditor;
//# sourceMappingURL=react-trix.js.map