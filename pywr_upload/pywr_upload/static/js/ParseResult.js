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
        fileInfo.textContent = `${this.filename} (${this.filesize} bytes)`;
        const parseStatus = document.createElement("div");
        parseStatus.setAttribute("id", "parse-file-status");
        const validState = result.parse_results.errors == 0 ? "Valid" : "Invalid";
        const errorPlural = result.parse_results.errors == 1 ? "" : "s";
        const warnPlural = result.parse_results.warnings == 1 ? "" : "s";
        parseStatus.innerText = `${validState}: ${result.parse_results.errors} error`
                               +`${errorPlural}, ${result.parse_results.warnings} warning`
                               +`${warnPlural}`;

        summary.append(fileInfo);
        summary.append(parseStatus);
        header.append(summary);
        this.header = header
        this.container.append(header);

        this.makeComponentTabs(result);

        //if(result.parse_results.errors > 0){
        //    this.makeComponents(result);
        //}
    }

    makeComponents(result){
        const frag = document.createDocumentFragment();
        for(const [component, errors] of Object.entries(result.errors)){
            if(component.toLowerCase() === "network")
                continue;
            const compHeader = document.createElement("div");
            compHeader.setAttribute("id", `${component}-header`);
            compHeader.classList.add("component-header");
            const plural = errors.length == 1 ? "" : "s";
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
            const tabText = document.createElement("span");
            tabText.textContent = `${component[0].toUpperCase()}${component.slice(1)}`;
            tabText.style.padding = "0px 6px 0px 0px";
            tab.append(tabText);
            const componentErrors = result.errors[component];
            const componentWarnings = result.warnings[component];
            if(componentErrors && componentErrors.length > 0){
                tab.append(this.makeCountTablet(componentErrors.length, "errors"));
            }
            if(componentWarnings && componentWarnings.length > 0){
                tab.append(this.makeCountTablet(componentWarnings.length, "warnings"));
            }
            tabContainer.append(tab);
            this.tabs.push(tab);

            const panel = this.makePanel(component, result);
            panelContainer.append(panel);
            this.panels.push(panel);

        }
        for(const tab of this.tabs){
            tab.addEventListener("click", this.tabClick.bind(this));
        }
        this.header.append(tabContainer);
        this.header.append(panelContainer);
        this.activateTab(0);
    }

    tabClick(e){
        let idx = this.tabs.indexOf(e.target);
        if(idx === -1){
            // The click was caught by a child of the tab
            idx = this.tabs.indexOf(e.target.parentElement);
        }
        this.activateTab(idx);
    }

    activateTab(idx){
        for(let i=0; i<this.tabs.length; i++){
            const isActive = i === idx ? 1 : 0;
            this.tabs[i].setAttribute("active", isActive);
            this.panels[i].setAttribute("active", isActive);
        }
    }

    makeCountTablet(count, category){
        const tablet = document.createElement("div");
        tablet.classList.add(`${category}-count-tablet`);
        const bgColour = category.toLowerCase() === "errors" ? "crimson" : "#E38614";
        const tabletStyle = {
            "display": "inline-block",
            "border-radius": '50%',
            "width": '10px',
            "line-height": '10px',
            "text-align": 'center',
            "font-size": '10px',
            "margin": '1px 1px 1px 1px',
            "padding": '2px',
            "background-color": bgColour,
            "color": '#ffffff',
            "font-weight": 'bold'
        };
        tablet.textContent = count;
        Object.assign(tablet.style, tabletStyle);
        return tablet;
    }

    makePanel(component, result){
        const panel = document.createElement("div");
        panel.setAttribute("id", `${component}-panel`)
        panel.classList.add("panel");
        const errors = result.errors[component];
        const warnings = result.warnings[component];
        if(errors){
            const errorHeader = document.createElement("div");
            errorHeader.classList.add("panel-header");
            errorHeader.classList.add("panel-error-header");
            const errorOpenState = document.createElement("span");
            errorOpenState.innerHTML = "&#x2796";
            errorOpenState.style.margin = "0px 4px";
            errorOpenState.classList.add("open");
            errorHeader.append(errorOpenState);
            const errorHeaderText = document.createElement("span");
            const plural = errors.length == 1 ? "" : "s";
            errorHeaderText.textContent = `${errors.length} error${plural}`;
            errorHeader.append(errorHeaderText);

            const errList = document.createElement("ul");
            errList.style = "background-color: none";
            for(const error of errors){
                const errLine = document.createElement("li");
                const ruleDiv = document.createElement("div");
                const ruleName = document.createElement("span");
                const ruleText = document.createElement("span");
                //const excerpt = document.createElement("div");
                //excerpt.textContent = error.value;

                ruleName.textContent = error.rule;
                ruleName.classList.add("rule-name");
                ruleText.textContent = error.exception;
                ruleText.classList.add("rule-text");
                ruleDiv.append(ruleName);
                ruleDiv.append(ruleText);
                //ruleDiv.append(excerpt);
                errLine.append(ruleDiv);
                errList.append(errLine);
            }
            errorHeader.append(errList);
            panel.append(errorHeader);
        }
        if(warnings){
            const warningHeader = document.createElement("div");
            warningHeader.classList.add("panel-header");
            warningHeader.classList.add("panel-warning-header");
            const warningOpenState = document.createElement("span");
            warningOpenState.innerHTML = "&#x2796";
            warningOpenState.style.margin = "0px 4px";
            warningOpenState.classList.add("open");
            warningHeader.append(warningOpenState);
            const warningHeaderText = document.createElement("span");
            const plural = warnings.length == 1 ? "" : "s";
            warningHeaderText.textContent = `${warnings.length} warning${plural}`;
            warningHeader.append(warningHeaderText);

            const warnList = document.createElement("ul");
            for(const warning of warnings){
                const warnLine = document.createElement("li");
                const ruleDiv = document.createElement("div");
                const ruleName = document.createElement("span");
                const ruleText = document.createElement("span");
                //const excerpt = document.createElement("div");
                //excerpt.textContent = error.value;

                ruleName.textContent = warning.rule;
                ruleName.classList.add("rule-name");
                ruleText.textContent = warning.exception;
                ruleText.classList.add("rule-text");
                ruleDiv.append(ruleName);
                ruleDiv.append(ruleText);
                //ruleDiv.append(excerpt);
                warnLine.append(ruleDiv);
                warnList.append(warnLine);
            }
            warningHeader.append(warnList);
            panel.append(warningHeader);
        }

        return panel;
    }
}

export {ParseResult};
