// Chord Diagram Source: https://observablehq.com/@d3/chord-diagram

const width = window.innerWidth;
const height = window.innerHeight;

let boxLeft = width * 0.5, boxTop = height / 2;
let boxMargin = {left: 30, top: 90, bottom: 80, right: 60};

let chordLeft = 0, chordTop = 0;
let chordMargin = {left: 90, top: 100, bottom: 60, right: 90};

let streamLeft = width * 0.5, streamTop = 0;
let streamMargin = {left: 30, top: 90, bottom: 80, right: 80};

let legendLeft = width * 0.8, legendTop = 0;
let legendBottom = height / 2, legendRight = width;

let titleMargin = 64;

let boxRight = width, boxBottom = height;
let chordRight = width * 0.5, chordBottom = height;
let chordWidth = chordRight - chordMargin.right - chordLeft - chordMargin.left;
let chordHeight = chordBottom - chordMargin.bottom - chordTop - chordMargin.top;
let chordOuterRadius = Math.min(chordWidth, chordHeight) * 0.5;
let chordInnerRadius = chordOuterRadius - 20;
let streamRight = width * 0.8, streamBottom = height / 2;

const numGenerations = 6;

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
        .attr("y", boxTop + titleMargin)
        .attr("text-anchor", "middle")
        .text("\'Base Stat Total\' Statistics By Primary Type")
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
            .attr("stroke-width", `1px`)
        .append("title")
            .text(d => `${d.PrimaryType} BST
                Highest → ${d.Stats.max}
                Lowest → ${d.Stats.min}
                1st Quartile → ${d.Stats.quart1st}
                3rd Quartile → ${d.Stats.quart3rd}`);

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
        .attr("width", chordRight - chordLeft)
        .attr("height", chordBottom - chordTop)
        .attr("translate", `translate(${chordLeft}, ${chordTop})`);

    // Process data into a flow matrix
    let chordData = [...Array(types.length)].map(function(){
        return Array(types.length).fill(0);
    });

    let elemMap = new Map();
    for (let i = 0; i < types.length; i++)
        elemMap.set(types[i], i);

    allData.forEach(d => {
        let k = d.SecondaryType ? d.SecondaryType : d.PrimaryType;
        chordData[elemMap.get(d.PrimaryType)][elemMap.get(k)]++; 
    });
    
    // Chords
    const hchords = d3.chord()
        .padAngle(Math.PI / chordInnerRadius);

    const harcs = d3.arc()
        .innerRadius(chordInnerRadius)
        .outerRadius(chordOuterRadius);

    const hribbons = d3.ribbon()
        .radius(chordInnerRadius - 1)
        
    // Title
    const htitle = gh.append("text")
        .attr("x", (chordRight + chordLeft) / 2)
        .attr("y", chordTop + titleMargin)
        .text("Pokemon Type Distribution in Generation VI")
        .style("font-size", `36px`)
        .style("text-anchor", "middle")

    let hcx = (chordLeft + chordMargin.left + chordRight - chordMargin.right) / 2
    let hcy = (chordTop + chordMargin.top + chordBottom - chordMargin.bottom) / 2

    const chordGroups = gh.append("g")
        .selectAll()
        .data(hchords(chordData).groups)
        .join("g");
    
    // Outer arcs
    chordGroups.append("path")
        .attr("fill", d => typeColorMap(types[d.index]))
        .attr("fill-opacity", 0.9)
        .attr("d", harcs)
        .attr("transform", `translate(${hcx}, ${hcy})`)
    
    // Tooltip
    chordGroups.append("title")
        .text(d => `${types[d.index]} → ${d.value}`)

    // Ribbons
    const chordDiagram = gh.append("g")
        .selectAll("chord")
        .data(hchords(chordData))
        .join("path")
            .attr("d", hribbons)
            .attr("fill-opacity", 0.6)
            .style("mix-blend-mode", "multiply")
            .attr("fill", d => typeColorMap(types[d.source.index]))
            .attr("transform", `translate(${hcx}, ${hcy})`)
            .on("mouseover", function(){
                d3.select(this).style("fill-opacity", 0.9);
            })
            .on("mouseout", function(){
                d3.select(this).style("fill-opacity", 0.6);
            })
        .append("title")
            .text(d => {
                return (d.source.index == d.target.index ?
                `Mono-${types[d.source.index]}` : `${types[d.source.index]}, ${types[d.target.index]}`) +
                ` → ${d.source.value}`;
            })

    // Streamgraph
    const gs = svg.append("g")
        .attr("width", streamRight - streamLeft)
        .attr("height", streamBottom - streamTop)

    // Process to Stream Data
    let streamData = Array.from(Array(numGenerations)).map((_, i) => {
        let obj = {
            Generation: i + 1,
            Frequencies: new Array(types.length).fill(0)
        };
        return obj;
    })

    //console.log(streamData)

    allData.forEach(d => {
        for (let i = d.Generation; i < numGenerations+1; i++)
            streamData[i - 1].Frequencies[elemMap.get(d.PrimaryType)]++;
    })

    console.log(streamData)

    const series = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .order(d3.stackOrderNone)
        .keys(types)
        .value((obj, key) => obj.Frequencies[elemMap.get(key)])
        (streamData);

    console.log(series)


    const sx = d3.scaleLinear()
        .domain([1, numGenerations])
        .range([streamLeft + streamMargin.left, streamRight - streamMargin.right]);
    
    const sy = d3.scaleLinear()
        .domain([-400, 400])
        .range([streamBottom - streamMargin.bottom, streamTop + streamMargin.top]);
        
    const sarea = d3.area()
        .x(d => sx(d.data.Generation))
        .y0(d => sy(d[0]))
        .y1(d => sy(d[1]));
        
    const stack = gs.append("g")
        .selectAll("stack")
        .data(series)
        .join("path")
            .attr("fill", d => typeColorMap(d.key))
            .attr("d", sarea)
            //.attr("transform", `translate(${streamMargin.left}, ${0})`)
        .append("title")
        .text(d => {
            return `${d.key}`
        })

    const stitle = gs.append("text")
        .text("Primary Types Over Generations")
        .attr("x", ((streamRight - streamMargin.right) + (streamLeft + streamMargin.left))/2)
        .attr("y", streamTop + titleMargin)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")

    const saxx1 = gs.append("g")
        .call(d3.axisBottom(sx).tickValues([1, 2, 3, 4, 5, 6]).tickFormat(d3.format(".0f")))
        .attr("transform", `translate(0, ${streamBottom - streamMargin.bottom})`)
        .selectAll("text")
            .style("font-size", `13px`)
            .attr("transform", `translate(0, 6)`)
            .text(d => `Gen ${d}`)

    const saxxlabel = gs.append("text")
        .text("Generations")
        .attr("x", ((streamRight - streamMargin.right) + (streamLeft + streamMargin.left))/2)
        .attr("y", streamBottom - streamMargin.bottom + 50)
        .attr("text-anchor", "middle")
        .attr("font-size", `20px`)

    const saxylabel = gs.append("text")
        .text("Count")
        .attr("transform", `translate(${(streamLeft + streamMargin.left) - 35}, ${(streamTop + streamMargin.top + streamBottom - streamMargin.bottom) / 2}) rotate(-90)`)
        .attr("text-anchor", "middle")
        .attr("font-size", `20px`)
    
    const saxy1 = gs.append("g")
        .call(d3.axisLeft(sy).tickSizeOuter(0).tickSizeInner(0))
        .attr("transform", `translate(${streamLeft + streamMargin.left}, 0)`)
        .selectAll("text")
            .attr("transform", `translate(-6, 0)`)
            .text(d => Math.abs(d))

    const saxy2 = gs.append("g")
        .call(d3.axisRight(sy).tickValues([]).tickSizeOuter(0))
        .attr("transform", `translate(${streamRight - streamMargin.right}, 0)`)
        
    const saxx2 = gs.append("g")
        .call(d3.axisTop(sx).tickValues([]).tickSizeOuter(0))
        .attr("transform", `translate(0, ${streamTop + streamMargin.top})`)

    
    const testline = gs.append("line")
        .attr("x1", streamLeft + streamMargin.left)
        .attr("x2", streamLeft + streamMargin.left)
        .attr("y1", 0)
        .attr("y1", height)
        .attr("stroke", "black")
        .style("visibility", "hidden")

    }).catch(function(error){
    console.log(error);
});