/*
 *
 *
 */

const svgNS = "http://www.w3.org/2000/svg"


class ProgressCircle{
    static get default_config(){
        return {
            size: 24,
            bgStroke: "#E0E0E0",
            normalStroke: "#43DB00",
            errorStroke: "#43DB00",
            strokeWidth: "0.3em"
        }
    }

    constructor(container, options){
        if(container instanceof HTMLElement){
            this.container = container;
        }else if(typeof container === "string"){
            this.container = document.getElementById(container)
        }

        if(!options || Object.entries(options).length == 0){
            options = ProgressCircle.default_config;
        }

        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", options.size);
        svg.setAttribute("height", options.size);
        svg.setAttribute("viewport", `0 0 ${options.size} ${options.size}`);
        svg.setAttribute("version", "1.1");
        svg.setAttribute("xmlns", svgNS);
        svg.style.display = "block";
        const circBG = document.createElementNS(svgNS, "circle");
        const circFG = document.createElementNS(svgNS, "circle");

        const r = 4*options.size/10;
        const dashStride = 2*r*Math.PI;
        for(const circle of [circFG, circBG]){
            circle.setAttribute("cx", options.size/2.0);
            circle.setAttribute("cy", options.size/2.0);
            circle.setAttribute("r", r);
            circle.setAttribute("shape-rendering", "geometricPrecision");
            circle.setAttribute("stroke-dasharray", dashStride);
            circle.setAttribute("fill", "transparent");
            circle.setAttribute("stroke-width", options.strokeWidth);
            circle.style.strokeDashoffset = 0;
            circle.style.transition = "stroke-dashoffset 0.5s linear";
        }
        circBG.style.stroke = options.bgStroke;
        circFG.style.strokeDashoffset = dashStride;
        circFG.style.stroke = options.normalStroke;
        circFG.style.transform = "rotate(-90deg)";
        circFG.style.transformOrigin = "center";

        svg.append(circBG);
        svg.append(circFG);

        this.percent = 0;
        this.options = options;
        this.svg = svg;
        this.circle = circFG;
        this.circum = dashStride;
        this.container.append(svg);
    }

    setPercent(percent){
        if(percent < 0 || percent > 100)
            return;

        this.circle.style.strokeDashoffset = this.circum*(1.0-percent/100.0);
        this.percent = percent;
    }

    get isComplete(){
        return this.percent == 100;
    }
}

export {ProgressCircle};
