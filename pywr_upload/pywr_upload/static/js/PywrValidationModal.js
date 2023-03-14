/*
 * PywrValidationModal component: <pywr-validation-modal>
 */

import {ProgressCircle} from "./ProgressCircle.js";
import {ParseResult} from "./ParseResult.js";

const parserEP = "http://46.105.98.40:5000/parse";

class PywrValidationModal extends HTMLElement{
    static get tmplText(){
        return `
      <div class="modal-dialog">
        <div class="file-container">
          <label for="file-input">Select file:</label>
          <span id="filename">No file selected</span>
          <input type="file" id="file-input">
        </div>
        <div id="status-container"></div>
        <div id="result-container"></div>
      </div>
      `;
    }

    constructor(){
        super();
    }

    connectedCallback(){
        const shadow = this.attachShadow({mode: "open"});
        const template = document.createElement("template");
        template.innerHTML = PywrValidationModal.tmplText;

        const styleUrl = this.getAttribute("styleUrl");
        const style = document.createElement("link");
        style.setAttribute("rel", "stylesheet");
        style.setAttribute("type", "text/css");
        style.setAttribute("href", styleUrl);

        shadow.appendChild(style);
        shadow.appendChild(template.content.cloneNode(true));
        this.parentElement.classList.add("pvm-container");

        const finp = shadow.getElementById("file-input");
        const fname = shadow.getElementById("filename");
        const stat = shadow.getElementById("status-container");
        finp.addEventListener("change", this.parseProcess.bind(this));

        this.finp = finp;
        this.fname = fname;
        this.stat = stat;
        this.shadow = shadow;
    }

    async parseProcess(){
        this.resetUi();
        this.shadow.querySelector("div.file-container label").textContent = "Selected file:";
        const fileProgress = document.createElement("progress-circle");
        const parseProgress = document.createElement("progress-circle");
        const fp = this.finp.files[0];

        let network, report = null;

        fileProgress.setText("Reading Pywr file...");
        this.stat.append(fileProgress);
        parseProgress.setText("Validating Pywr network...");
        this.fname.innerText = fp.name;
        console.log(fp);

        const result = await this.readFile(fp, fileProgress);
        await fileProgress.transitionComplete();
        try{
            network = JSON.parse(result);
            fileProgress.setText(`${fp.name} (${fp.size} bytes)`);
        }catch(e){
            fileProgress.setErrorState();
            fileProgress.setText(`File ${fp.name} is not valid JSON`);
            throw e;
        }
        this.stat.append(parseProgress);
        try{
            const response = await this.parserPost(network, parseProgress);
            await parseProgress.transitionComplete();
            report = JSON.parse(response);
            const validState = report.parse_results.errors == 0 ? "Valid" : "Invalid";
            const errorPlural = report.parse_results.errors == 1 ? "" : "s";
            const warnPlural = report.parse_results.warnings == 1 ? "" : "s";
            const statusText = `${validState}: ${report.parse_results.errors} error`
                              +`${errorPlural}, ${report.parse_results.warnings} warning`
                              +`${warnPlural}`;
            parseProgress.setText(statusText);
        }catch(error){
            parseProgress.setErrorState();
            parseProgress.setText(error);
            console.error(error);
        }
        this.shadow.querySelector("div.file-container").append(this.makeReportLink(report));
        if(report.parse_results.errors > 0){
            parseProgress.setErrorState();
        }
        if(report.parse_results.errors > 0 || report.parse_results.warnings > 0){
            const resultContainer = this.shadow.getElementById("result-container");
            const parse = new ParseResult(resultContainer, report);
        }else if(report.parse_results.errors == 0){
            // allow server upload
        }
    }

    readFile(fp, progress){
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.addEventListener("load", e => {
                // Manual event required for Windows Firefox
                reader.dispatchEvent(new CustomEvent("progress", {detail: {loaded: 1, total: 1}}));
                resolve(e.target.result);
            });

            reader.addEventListener("progress", e => {
                const percent = e.detail ? e.detail.loaded/e.detail.total*100.0 : e.loaded/e.total*100.0;
                progress.setPercent(percent);
                console.log(`Progress: ${percent.toFixed(2)}`);
            });

            reader.addEventListener("error", e => {
                reject(e);
            });

            reader.readAsText(fp);
        });
    }

    parserPost(network, progress){
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const payload = {
                compression: null,
                data: network
            };

            xhr.addEventListener("load", function(){
                if(xhr.status == 200){
                    resolve(xhr.response);
                }else{
                    reject(Error(xhr.statusText));
                }
            });

            xhr.addEventListener("error", function(){
                reject(Error("Upload error"));
            });

            xhr.upload.addEventListener("progress", function(e){
                const percent = e.loaded/e.total*100.0;
                console.log(`Progress: ${percent.toFixed(2)}`);
                progress.setPercent(percent);
            });

            xhr.open("POST", parserEP);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify(payload));
        });
    }

    makeReportLink(report){
        const reportData = new Blob([JSON.stringify(report, null, 2)], {type: "text/json"});
        const url = URL.createObjectURL(reportData);
        const link = document.createElement("a");
        const filename = this.finp.files[0].name;
        link.href = url;
        link.classList.add("report-link");
        link.style.fontSize = "smaller";
        link.style.float = "right";
        link.download = `${filename}_report.json`;
        link.textContent = "Download parser report";

        return link;
    }

    resetUi(){
        this.shadow.getElementById("status-container").replaceChildren();
        this.shadow.getElementById("result-container").replaceChildren();
        const reportLink = this.shadow.querySelector("a.report-link");
        if(reportLink)
            reportLink.remove();
    }
}

customElements.define("pywr-validation-modal", PywrValidationModal);
export {PywrValidationModal};
