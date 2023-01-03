/*
 *
 *
 */

class ParseResult{

    constructor(container, filename, filesize, result, options){
        if(container instanceof HTMLElement){
            this.container = container;
        }else if(typeof container === "string"){
            this.container = document.getElementById(container)
        }
        this.filename = filename;
        this.filesize = filesize;

        this.makeHeaderRow(result);
    }

    makeHeaderRow(result){
        const header = document.createElement("div");
        header.setAttribute("id", "parse-header");
        const summary = document.createElement("div");
        summary.setAttribute("id", "parse-summary");
        const fileInfo = document.createElement("div");
        fileInfo.setAttribute("id", "parse-file-info");
        fileInfo.innerText = `${this.filename} (${this.filesize} bytes)`;
        const parseStatus = document.createElement("div");
        parseStatus.setAttribute("id", "parse-file-status");
        const validState = result.parse_results.errors == 0 ? "Valid" : "Invalid";
        const errorPlural = result.parse_results.errors > 1 ? "s" : "";
        const warnPlural = result.parse_results.warnings > 1 ? "s" : "";
        parseStatus.innerText = `${validState}: ${result.parse_results.errors} error`
                               +`${errorPlural}, ${result.parse_results.warnings} warning`
                               +`${warnPlural}`;

        summary.append(fileInfo);
        summary.append(parseStatus);
        header.append(summary);
        this.header = header
        this.container.append(header);

        this.makeComponentTabs(result);

        if(result.parse_results.errors > 0){
            this.makeComponents(result);
        }
    }

    makeComponents(result){
        const frag = document.createDocumentFragment();
        for(const [component, errors] of Object.entries(result.errors)){
            if(component.toLowerCase() === "network")
                continue;
            const compHeader = document.createElement("div");
            compHeader.setAttribute("id", `${component}-header`);
            compHeader.classList.add("component-header");
            const plural = errors.length > 1 ? "s" : "";
            compHeader.textContent = `${component} ${errors.length} error${plural}`
            const compList = document.createElement("ul");
            for(const error of errors){
                const compLine = document.createElement("li");
                const ruleDiv = document.createElement("div");
                const ruleName = document.createElement("span");
                const ruleText = document.createElement("span");
                const excerpt = document.createElement("div");
                excerpt.textContent = error.value;

                ruleName.textContent = error.rule;
                ruleText.textContent = error.exception;
                ruleDiv.append(ruleName);
                ruleDiv.append(ruleText);
                ruleDiv.append(excerpt);
                compLine.append(ruleDiv);
                compList.append(compLine);
            }
            compHeader.append(compList);
            frag.append(compHeader);
        }
        this.header.append(frag);
    }

    makeComponentTabs(result){
        const tabComponents = new Set([...Object.keys(result.errors)], [...Object.keys(result.warnings)]);
        tabComponents.delete("network");

        const tabContainer = document.createElement("div");
        tabContainer.setAttribute("id", "tabs");
        tabContainer.style.display = "inline-flex";

        const panelContainer = document.createElement("div");
        panelContainer.setAttribute("id", "panels");

        this.tabs = [];
        this.panels = [];
        for(const component of tabComponents){
            const tab = document.createElement("button");
            tab.setAttribute("id", `${component}-tab`);
            tab.classList.add("tab");
            tab.textContent = `${component[0].toUpperCase()}${component.slice(1)}`;
            tabContainer.append(tab);
            this.tabs.push(tab);

            const panel = document.createElement("div");
            panel.setAttribute("id", `${component}-panel`)
            panel.classList.add("panel");
            panel.style.display = "none";
            this.panels.push(panel);

        }
        this.header.append(tabContainer);
        this.activateTab(0);
    }

    tabClick(e){
        const idx = this.tabs.indexOf(e.target);
        activateTab(idx);
    }

    activateTab(idx){
        for(let i=0; i<this.tabs.length; i++){
            const isActive = i === idx ? 1 : 0;
            this.tabs[i].setAttribute("active", isActive);
            this.panels[i].setAttribute("active", isActive);
        }
    }

    toggleErrors(e){
    }
}

export {ParseResult};
