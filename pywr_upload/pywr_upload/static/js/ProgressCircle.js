/*
 *
 *
 */

const svgNS = "http://www.w3.org/2000/svg"


class ProgressCircle extends HTMLElement{
    static get defaultStyle(){
        return `
          :host {
            display: block;
            margin: 4px 0px;
          }
          svg {
            vertical-align: middle;
          }
          circle {
            transition: "stroke-dashoffset 0.2s linear";
            strokeDashoffset: 0;
          }
          .fore {
            stroke: #43DB00;
            transform-origin: center;
            transform: rotate(-90deg);
          }
          .back {
            stroke: #E0E0E0;
          }
          circle.error {
            stroke: crimson;
          }
          .progress-text {
            padding: 8px;
          }
        `;
    }

    static get defaultOptions(){
        return {
            size: 24,
            strokeWidth: "0.3rem"
        };
    }

    constructor(){
        super();

        const options = ProgressCircle.defaultOptions;
        const shadow = this.attachShadow({mode: "open"});

        const style = document.createElement("style");
        style.textContent = ProgressCircle.defaultStyle;
        shadow.append(style);

        const svg = document.createElementNS(svgNS, "svg");
        const circBack = document.createElementNS(svgNS, "circle");
        const circFore = document.createElementNS(svgNS, "circle");
        circBack.classList.add("back");
        circFore.classList.add("fore");
        svg.append(circBack, circFore);

        shadow.append(svg);
        const textSpan = document.createElement("span");
        textSpan.classList.add("progress-text");
        textSpan.textContent = "default text";
        shadow.append(textSpan);

        this.percent = 0;
        this.options = options;
        this.shadow = shadow;
        this.svg = svg;
        this.textSpan = textSpan;
        this.circle = circFore;
        this.circle.addEventListener("transitionend", this.emitComplete.bind(this));
    }

    emitComplete(){
        if(this.isComplete){
            this.dispatchEvent(new Event("progress-complete"));
        }
    }

    async transitionComplete(e){
        return new Promise(resolve => {
            this.addEventListener("progress-complete", function etl(e){
                this.removeEventListener("progress-complete", etl);
                resolve();
            });
        });
    }

    connectedCallback(){
        this.svg.setAttribute("width", this.options.size);
        this.svg.setAttribute("height", this.options.size);
        this.svg.setAttribute("viewport", `0 0 ${this.options.size} ${this.options.size}`);
        this.svg.setAttribute("version", "1.1");
        this.svg.setAttribute("xmlns", svgNS);

        const circFore = this.svg.querySelector("circle.fore");
        const circBack = this.svg.querySelector("circle.back");

        const r = 4*this.options.size/10;
        const dashStride = 2*r*Math.PI;
        for(const circle of [circFore, circBack]){
            circle.setAttribute("cx", this.options.size/2.0);
            circle.setAttribute("cy", this.options.size/2.0);
            circle.setAttribute("r", r);
            circle.setAttribute("shape-rendering", "geometricPrecision");
            circle.setAttribute("stroke-dasharray", dashStride);
            circle.setAttribute("fill", "transparent");
            circle.setAttribute("stroke-width", this.options.strokeWidth);
            circle.style.strokeDashoffset = 0;
            circle.style.transition = "stroke-dashoffset 0.5s linear";
        }
        circFore.style.strokeDashoffset = dashStride;
        this.circum = dashStride;
    }

    setPercent(percent){
        if(percent < 0 || percent > 100)
            return;

        this.circle.style.strokeDashoffset = this.circum*(1.0-percent/100.0);
        this.percent = percent;
    }

    setText(text){
        this.textSpan.textContent = text;
    }

    setErrorState(){
        this.circle.classList.add("error");
    }

    get isComplete(){
        return this.percent == 100;
    }
}

customElements.define("progress-circle", ProgressCircle);
export {ProgressCircle};
