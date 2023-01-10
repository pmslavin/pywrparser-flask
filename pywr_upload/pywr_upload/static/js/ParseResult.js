/*
 *
 *
 */

class ParseResult{

    constructor(container, result, options){
        if(container instanceof HTMLElement){
            this.container = container;
        }else if(typeof container === "string"){
            this.container = document.getElementById(container)
        }
        this.filename = result.filename;
        this.filesize = result.filesize;

        this.makeHeaderRow(result.report);
    }

    makeHeaderRow(result){
        const header = document.createElement("div");
        header.setAttribute("id", "parse-header");
        const summary = document.createElement("div");
        summary.setAttribute("id", "parse-summary");
        const fileInfo = document.createElement("div");
        fileInfo.setAttribute("id", "parse-file-info");
        summary.append(fileInfo);
        header.append(summary);
        this.header = header
        this.container.append(header);

        this.makeComponentTabs(result);
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
            panel.append(this.makeRuleTable(errors, "error"));
        }
        if(warnings){
            panel.append(this.makeRuleTable(warnings, "warning"));
        }
        return panel;
    }

    makeRuleTable(rules, category){
        const table = document.createElement("table");
        table.classList.add(`${category}-rule-table`);
        const tHead = document.createElement("thead");
        const thRow = document.createElement("tr");
        const tBody = document.createElement("tbody");
        thRow.classList.add("rule-header-row");
        const openState = document.createElement("th");
        openState.innerHTML = "&#x2796"; // heavy minus
        openState.classList.add("open-state", "open");
        openState.addEventListener("click", this.showHideRules.bind(this));
        const ruleHeaderText = document.createElement("th");
        ruleHeaderText.classList.add("rule-header-text");
        const plural = rules.length === 1 ? "" : "s";
        ruleHeaderText.textContent = `${rules.length} ${category}${plural}`;

        thRow.append(openState, ruleHeaderText,
                     document.createElement("th"),
                     document.createElement("th"));
        tHead.append(thRow);
        table.append(tHead, tBody);
        for(const rule of rules){
            const ruleRow = document.createElement("tr");
            const ruleName = document.createElement("td");
            const ruleText = document.createElement("td");
            const excerptRow = document.createElement("tr");
            const excerpt = document.createElement("td");
            ruleName.classList.add("rule-name");
            ruleName.textContent = rule.rule;
            ruleText.classList.add("rule-text");
            ruleText.textContent = rule.exception;
            ruleText.setAttribute("colspan", 2);
            excerpt.classList.add("excerpt");
            excerpt.textContent = rule.value;
            excerpt.setAttribute("colspan", 3);
            excerptRow.append(excerpt);
            ruleRow.append(ruleName, ruleText);
            tBody.append(ruleRow);
            tBody.append(excerptRow);
        }
        return table;
    }

    showHideRules(e){
        const tbody = e.target.closest("table").querySelector("tbody");
        if(e.target.classList.contains("open")){
            e.target.innerHTML = "&#x2795"; // heavy plus
            e.target.classList.replace("open", "closed");
            for(const row of tbody.children){
                row.style.display = "none";
            }
        }else if(e.target.classList.contains("closed")){
            e.target.classList.replace("closed", "open");
            e.target.innerHTML = "&#x2796"; // heavy minus
            for(const row of tbody.children){
                row.style.display = "table-row";
            }
        }
    }
}

export {ParseResult};
