import * as React from "react";
import { BoxSizingProperty } from "csstype";

export interface TrixEditorProps {
  autoFocus?: boolean;
  placeholder?: string;
  toolbar?: string;
  value?: string;
  uploadURL?: string;
  uploadData?: { [key: string]: string };
  className?: string;

  onEditorReady?: (editor: any) => void;
  onChange: (html: string, text: string) => void;
}

export interface TrixEditorState {}

export interface Editor {
  getSelectedRange: () => Array<number>;
  setSelectedRange: (range: Array<number>) => void;
  getClientRectAtPosition: (pos: number) => Rect;
  expandSelectionInDirection: (direction: "forward" | "backward") => void;
  insertString: (s: string) => void;
}

export interface Rect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export class TrixEditor extends React.Component<
  TrixEditorProps,
  TrixEditorState
> {
  private id: string;
  private container: any = null;
  private editor: Editor = null;
  private d: HTMLDivElement = null;
  constructor(props: TrixEditorProps) {
    super(props);

    this.id = this.generateId();

    this.state = {};
  }
  private generateId(): string {
    let timestamp = Date.now();
    let uniqueNumber = 0;

    (() => {
      // If created at same millisecond as previous
      if (timestamp <= uniqueNumber) {
        timestamp = ++uniqueNumber;
      } else {
        uniqueNumber = timestamp;
      }
    })();
    return "T" + timestamp.toString();
  }
  componentDidMount() {
    let props = this.props;

    this.container = document.getElementById(`editor-${this.id}`);
    //this.container = this.d && this.d.children && this.d.children.length >= 2 ? this.d.children[1] : null;
    //this.editor = this.d;
    if (this.container) {
      this.container.addEventListener(
        "trix-initialize",
        () => {
          this.editor = this.container.editor;
          if (!this.editor) {
            console.error("cannot  find trix editor");
          }

          if (props.onEditorReady && typeof props.onEditorReady == "function") {
            props.onEditorReady(this.editor);
          }
        },
        false
      );
      this.container.addEventListener(
        "trix-change",
        this.handleChange.bind(this),
        false
      );

      if (props.uploadURL) {
        this.container.addEventListener(
          "trix-attachment-add",
          this.handleUpload.bind(this)
        );
      }
    } else {
      console.error("editor not found");
    }
  }
  componentWillUnmount() {
    this.container.removeEventListener("trix-initialize", this.handleChange);
    this.container.removeEventListener("trix-change", this.handleChange);

    if (this.props.uploadURL) {
      this.container.removeEventListener(
        "trix-attachment-add",
        this.handleUpload
      );
    }
  }
  private handleChange(e: any) {
    const props = this.props;
    const text: string = e.target.innerText;

    if (props.onChange) {
      props.onChange(e.target.innerHTML, text);
    }
  }
  private handleUpload(e: any) {
    var attachment = e.attachment;
    if (attachment.file) {
      return this.uploadAttachment(attachment);
    }
  }
  private uploadAttachment(attachment: any) {
    var file, form, xhr;
    file = attachment.file;
    form = new FormData();
    // add any custom data that were passed
    if (this.props.uploadData) {
      for (var k in this.props.uploadData) {
        form.append(k, this.props.uploadData[k]);
      }
    }
    //form.append("Content-Type", "multipart/form-data");
    form.append("file", file);
    xhr = new XMLHttpRequest();
    xhr.open("POST", this.props.uploadURL, true);
    xhr.upload.onprogress = event => {
      var progress = (event.loaded / event.total) * 100;
      return attachment.setUploadProgress(progress);
    };
    xhr.onload = () => {
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
  }
  render() {
    let props = this.props;

    var attributes: { [key: string]: string } = {
      id: `editor-${this.id}`,
      input: `input-${this.id}`,
      class: `${props.className ? props.className : ""}`
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
    return (
      <div
        id="trix-editor-top-level"
        ref={d => (this.d = d)}
        style={{ position: "relative" }}
      >
        {React.createElement("trix-editor", attributes)}
        <input type="hidden" id={`input-${this.id}`} value={this.props.value} />
      </div>
    );
  }
}
