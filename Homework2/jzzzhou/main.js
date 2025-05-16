const width = window.innerWidth;
const height = window.innerHeight;

let boxLeft = 0, boxTop = 0;
let boxMargin = {left: 60, top: 90, bottom: 80, right: 60};

let chordLeft = width * 0.6, chordTop = 0;
let chordMargin = {left: 60, top: 90, bottom: 80, right: 60};

let streamLeft = 0, streamTop = height / 2;
let streamMargin = {left: 60, top: 90, bottom: 80, right: 80};

let boxRight = chordLeft, boxBottom = height / 2;
let chordRight = width, chordBottom = height / 2;
let streamRight = width, streamBottom = height;

const types = [
    "Normal", "Fighting", "Flying", "Rock", "Ground", "Steel", "Poison", "Bug",
    "Grass", "Water", "Fire", "Ice", "Electric", 
    "Dark", "Psychic", "Ghost", "Dragon", "Fairy"
];

const typeColor = [
    "silver", "orangered", "skyblue", "darkkhaki", "saddlebrown", "steelblue", "darkviolet", "olive",
    "limegreen", "dodgerblue", "crimson", "cyan", "gold",
    "dimgrey", "hotpink", "mediumpurple", "royalblue", "plum"
];

// plots
d3.csv("data/pokemon_alopez247.csv").then(rawData =>{
    let allData = rawData.map(d => {
        return {
            "Name": d.Name,
            "Generation": d.Generation,
            "PrimaryType": d.Type_1,
            "SecondaryType": d.Type_2,
            "BST": d.Total,
        };
    });

    const typeColorMap = d3.scaleOrdinal()
        .domain(types)
        .range(typeColor);

    const svg = d3.select("svg");

    // Box Plot
    const gbox = svg.append("g")
        .attr("width", boxRight - boxLeft)
        .attr("height", boxBottom - boxTop)
        .attr("translate", `translate(${boxLeft}, ${boxTop})`);

    // Process Box Plot Data
    let boxData = types.map(function(d){
        let k = allData.filter(j => j.PrimaryType == d).map(j => Number(j.BST)).sort();
        return {
            PrimaryType: d,
            Stats: {
                max: d3.max(k),
                min: d3.min(k),
                median: d3.median(k),
                quart1st: d3.quantile(k, 0.25),
                quart3rd: d3.quantile(k, 0.75),
            }
        }
    });

    console.log(boxData);

    // Box Y axis
    const boxmaxbst = 800;
    const boxminbst = 0;
    const boxy = d3.scaleLinear()
        .domain([boxminbst, boxmaxbst])
        .range([boxBottom - boxMargin.bottom, boxTop + boxMargin.top]);
    

    // Box X axis
    const boxx = d3.scaleBand()
        .domain(types)
        .range([boxLeft + boxMargin.left, boxRight - boxMargin.right])
        .padding(0.3);

    // Title
    const boxtext = gbox.append("text")
        .attr("x", (boxRight + boxLeft) / 2)
        .attr("y", boxTop + boxMargin.top - 24)
        .attr("text-anchor", "middle")
        .text("BST Statistics By Primary Type")
        .style("font-size", `24px`)
        .style("font-color", `black`)

    // Y-axis graph lines
    let bstaxisRange = d3.range(boxminbst, boxmaxbst+1, 50);
    const boxplotlines = gbox.append("g")
        .selectAll("boxLines")
        .data(bstaxisRange)
        .join("line")
            .attr("x1", boxLeft + boxMargin.left)
            .attr("x2", boxRight - boxMargin.right)
            .attr("y1", d => boxy(d) + 0.5)
            .attr("y2", d => boxy(d) + 0.5)
            .attr("stroke", "grey")
            .attr("stroke-width", `1px`)

    // Extrema lines
    const boxlines = gbox.append("g")
        .selectAll("extremaLines")
        .data(boxData)
        .join("line")
            .attr("x1", d => boxx(d.PrimaryType) + boxx.bandwidth() / 2)
            .attr("x2", d => boxx(d.PrimaryType) + boxx.bandwidth() / 2)
            .attr("y1", d => boxy(d.Stats.max))
            .attr("y2", d => boxy(d.Stats.min))
            .attr("stroke", "black")
            .attr("stroke-width", `1px`);

    // Quartile boxes
    const boxboxes = gbox.append("g")
        .selectAll("boxes")
        .data(boxData)
        .join("rect")
            .attr("x", d => boxx(d.PrimaryType))
            .attr("y", d => boxy(d.Stats.quart3rd))
            .attr("width", boxx.bandwidth())
            .attr("height", d => boxy(d.Stats.quart1st) - boxy(d.Stats.quart3rd))
            .attr("fill", d => typeColorMap(d.PrimaryType))
            .attr("stroke", "black")
            .attr("stroke-width", `1px`);

    // Median lines
    const boxmed = gbox.append("g")
        .selectAll("medianLines")
        .data(boxData)
        .join("line")
            .attr("x1", d => boxx(d.PrimaryType) + boxx.bandwidth())
            .attr("x2", d => boxx(d.PrimaryType))
            .attr("y1", d => boxy(d.Stats.median))
            .attr("y2", d => boxy(d.Stats.median))
            .attr("stroke", "black")
            .attr("stroke-width", `1px`);

    // Y-axis
    const boxaxy = gbox.append("g")
        .call(d3.axisLeft(boxy).tickValues(bstaxisRange))
        .attr("transform", `translate(${boxLeft + boxMargin.left}, 0)`)

    // X-axis
    const boxaxx = gbox.append("g")
        .call(d3.axisBottom(boxx))
        .attr("transform", `translate(0, ${boxBottom - boxMargin.bottom})`)
        .selectAll("text")
            .attr("transform", `translate(0, 2)`)
    

    // Chord Diagram
    const gh = svg.append("g")
        .attr("width", boxRight - boxLeft)
        .attr("height", boxBottom - boxTop)
        .attr("translate", `translate(${boxLeft}, ${boxTop})`);

    const chordData = [...Array(types.length)].map(function(){
        return Array(types.length).fill(0);
    });

    console.log(chordData)

    let elemMap = new Map();
    for (let i = 0; i < types.length; i++)
        elemMap.set(types[i], i);

    allData.forEach(d => {
        let k = d.SecondaryType ? d.SecondaryType : d.PrimaryType;
        chordData[elemMap.get(d.PrimaryType)][elemMap.get(k)]++; 
    });
    
    console.log(chordData)

    }).catch(function(error){
    console.log(error);
});