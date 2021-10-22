
d3.json("airports.json", d3.autoType).then(data => {
        console.log('airport',data);

    d3.json("world-110m.json").then(data1=>{
            console.log('world',data1) 



    const width = 400;
    const height = 400;




    let visType = d3.select("input[name=type]:checked").node().value;

    const svg = d3
        .select("body")
        .append("svg")
        .attr("viewBox", [0,0, width, height]);
    
    const countries = topojson.feature(data1, data1.objects.countries)
        .features;
    const projection = d3.geoMercator()
    .fitExtent([[0,0],[width,height]],
        topojson.feature(data1, data1.objects.countries)
    );

    const path = d3.geoPath().projection(projection);

    const maps = svg
        .selectAll("path")
        .data(countries)
        .join("path");

    svg
        .append("path")
        .datum(topojson.mesh(data1,data1.objects.countries))
        .attr("d",path)
        .attr("fill","none")
        .attr("stroke", "white")
        .attr("class","subunit-boundary");




    let z = [];
    for(let passengers of Object.entries(data.nodes)){
        z.push(passengers[1].passengers)
    }
    const size = d3
        .scaleLinear()
        .domain(d3.extent(z))
        .range([5,8]);
        
    const sim = d3
        .forceSimulation(data.nodes)
         
        .force("charge", d3.forceManyBody())
        //.force("center", d3.forceCenter())
        .force("x",d3.forceX(width/2))
        .force("y",d3.forceY(height/2))
        .force("link",d3.forceLink(data.links))
         
        
        

    sim.on("tick", function() {
            nodes
              .attr("cx", d => d.x)
              .attr("cy", d => d.y);

            links
              .attr("x1", d => d.source.x)
              .attr("y1", d => d.source.y)
              .attr("x2", d => d.target.x)
              .attr("y2", d => d.target.y);
        
          
        
         });


        const drag = d3
            .drag()
            .filter(event => visType === "force")
            .on("start", event => {
            if (!event.active) sim.alphaTarget(0.3).restart();
            event.subject.fx = event.x;
            event.subject.fy = event.y;
            })
            .on("drag", event => {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            })
            .on("end", event => {
            if (!event.active) sim.alphaTarget(0.0);
                event.subject.fx = null;
                event.subject.fy = null;
            });

        

   

    const links = svg
        .selectAll("line")
        .data(data.links)
        .join("line")
        .attr("x1", function(d){
            return d.source.x
        })
        .attr("y1",function(d){
            return d.source.y
        })
        .attr("x2",function(d) {
            return d.target.x
        })
        .attr("y2",function(d){
            return d.target.y
        })
        .attr("fill", "gray")
        .attr("stroke", "gray")

    const nodes = svg
        .selectAll("circle")
        .data(data.nodes)
        .join("circle")
        .attr("fill", "orange")
        //.attr("stroke", "black")
        .attr("cx", function(d){
            console.log(d.x)
            return d.x
        })
        .attr("cy", function(d){

            return d.y
        })
        .attr("r", d =>  size(d.passengers))
        
    

   
    
    nodes.append("title")
          .text(d=>d.name);

    function switchLayout(){
        if (visType ==="map"){
            sim.stop()
            maps.attr("d",path);

            nodes.transition().duration(500)
                .attr("cx",function(d){
                    d.x = projection([d.longitude, d.latitude])[0];
                    return d.x
                })
                .attr("cy",function(d){
                    d.y = projection([d.longitude, d.latitude])[1];
                    return d.y
                })
            maps.transition().duration(500)
                    .attr("opacity",1);

            links.transition().duration(500)
                    .attr("x1", d=>d.source.x)
                    .attr("y1", d=>d.source.y)
                    .attr("x2", d=>d.target.x)
                    .attr("y2", d=>d.target.y)

        } else{
            sim.alpha(1.0).restart();

            maps.transition().duration(500)
                .attr("opacity",0);
        }

        nodes.call(drag)

        
    }

    d3.selectAll("input[name=type]").on("change",event =>{
        visType = event.target.value;
        switchLayout();
    })
















        
        });
    
    

        

    

});