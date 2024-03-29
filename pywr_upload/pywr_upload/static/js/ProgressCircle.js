/*
 *  ProgressCircle component: <progress-circle>
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
          .fore {
            stroke: #7F9CCB;
            transform-origin: center;
            transform: rotate(-90deg);
          }
          .back {
            stroke: #E0E0E0;
          }
          circle.error {
            stroke: crimson;
          }
          circle.complete {
            stroke: #43DB00;
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
    }

    emitComplete(){
        if(this.isComplete){
            this.completeEmitted = true;
            this.circle.classList.add("complete");
            this.dispatchEvent(new Event("progress-complete"));
        }
    }

    async transitionComplete(data){
        return new Promise(resolve => {
            if(this.completeEmitted){
                resolve(data);
            }else{
                this.addEventListener("progress-complete", function etl(){
                    this.removeEventListener("progress-complete", etl);
                    resolve(data);
                });
            }
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
        this.circum = dashStride;
        for(const circle of [circFore, circBack]){
            circle.setAttribute("cx", this.options.size/2.0);
            circle.setAttribute("cy", this.options.size/2.0);
            circle.setAttribute("r", r);
            circle.setAttribute("shape-rendering", "geometricPrecision");
            circle.setAttribute("stroke-dasharray", dashStride);
            circle.setAttribute("fill", "transparent");
            circle.setAttribute("stroke-width", this.options.strokeWidth);
            circle.setAttribute("stroke-dashoffset", 1.1);
        }
        circFore.setAttribute("stroke-dashoffset", dashStride);
        circFore.style.transition = "stroke-dashoffset 1s linear 0s";
        circFore.addEventListener("transitionend", this.emitComplete.bind(this), {capture: true});
        void this.offsetHeight;  // Prevent batching renders which can skip transition
    }

    setPercent(percent){
        if(percent < 0 || percent > 100)
            return;

        this.circle.setAttribute("stroke-dashoffset", this.circum*(1.0-percent/100.0));
        this.percent = percent;
    }

    setText(text){
        this.textSpan.textContent = text;
    }

    setErrorState(){
        this.setPercent(100);
        this.circle.classList.remove("complete");
        this.circle.classList.add("error");
    }

    get isComplete(){
        return this.percent == 100;
    }
}

customElements.define("progress-circle", ProgressCircle);
export {ProgressCircle};
