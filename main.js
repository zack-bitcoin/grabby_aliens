var main = (function(){
    var div = document.createElement("div");
    document.body.appendChild(div);
    var display = document.createElement("div");
    div.appendChild(display);

    var speed_of_light = text_input("speed of light", div);
    speed_of_light.value = 3;
    div.appendChild(br());
    var alien_spread_speed = text_input("how fast aliens spread", div);
    alien_spread_speed.value = 2;
    div.appendChild(br());
    var dimensions_number = text_input("how many dimensions (1, 2, or 3)", div);
    dimensions_number.value = 3;
    div.appendChild(br());
    var odds_of_life = text_input("how frequently new life appears", div);
    odds_of_life.value = 2;
    div.appendChild(br());
    var number_of_planets = text_input("how many locations in the universe where life can happen", div);
    number_of_planets.value = 500;
    div.appendChild(br());
    var go_button = button_maker("go", function(){
        var M = model_maker(
            parseFloat(speed_of_light.value, 10),
            parseFloat(alien_spread_speed.value, 10),
            parseInt(dimensions_number.value, 10),
            parseFloat(odds_of_life.value, 10),
            parseInt(number_of_planets.value, 10));
        var S = simulate(M);
        var time_locations = tl(S);
        display.innerHTML = "there are "
            .concat(S.length)
            .concat(" many civilizations <br> ")
        //.concat(JSON.stringify(M));
            .concat(tl(S));
    });
    div.appendChild(go_button);
    function tl(S) {
        if(S.length === 0){
            return("");
        };
        return("time: "
               .concat(S[0].t.toFixed(4))
               .concat(" where: ")
               .concat(S[0].v.map(function(x){
                   return(" ".concat(x.toFixed(4)))
               }).reduce(function(a, b){
                   return(a.concat(b))
               }, ""))
               .concat(" many colonies: ")
               .concat(S[0].colonies.length)
               .concat("<br>")
               .concat(tl(S.slice(1))));
    };
    function br() {
        return document.createElement("br");
    };
    function button_maker(val, fun) {
        var button = document.createElement("input");
        button.type = "button";
        button.value = val;
        button.onclick = fun;
        return button;
    };
    function text(a) {
        var x2 = document.createElement("h8");
        x2.innerHTML = a;
        return x2;
    };
    function text_input(query, div) {
        var x = document.createElement("INPUT");
        x.type = "text";
        var q = text(query);
        div.appendChild(q);
        div.appendChild(x);
        return x;
    };
    function planet_maker(d, n){
        //d, number of dimentions of the space. {1, 2, 3}
        //n, used to set the odds of any individual planet creating life in a unit of time.
        var location = [];
        for(var i = 0; i<d; i++){
            location[i] = Math.random();
        }; 
        return({
            t: Math.pow(Math.random(), 1/(1+n)),//time at which this planet generates life, if no other extra terrestrials have already colonized it.
            v: location,//location of this planet
            colonies: []
        });
    };
    function distance(planet1, planet2){
        var v1 = planet1.v;
        var v2 = planet2.v;
        var accumulator = 0;
        for(var i = 0; i<v1.length; i++){
            var d = Math.abs(v1[i] - v2[i]);
            if(d > 1/2){
                d = 1-d;//for this simulation each dimention is a loop. a torus. 
            };
            accumulator += (d*d);
        };
        return(Math.sqrt(accumulator));
    };

    function model_maker(c, s, d, n, N){
        //c, speed of light. The bounds of the model are set to 1, so to increase the size of the model, you decrease the speed of light.
        //s, the portion of the speed of light that aliens travel at to colonize the universe
        //d, number of dimensions of the space the aliens can live in. {1, 2, 3}
        //n, used to set the odds of any individual planet creating life in a unit of time.
        //N, number of locations that could create life. we call them "planets" in this javascript.
        if(c <= 0){
            display.innerHTML = "speed of light should be positive";
            return(0);
        };
        if(s <= 0){
            display.innerHTML = "aliens should be growing, not shrinking";
            return(0);
        };
        if(s > c) {
            display.innerHTML = "the aliens can't spread faster than the speed of light";
            return(0);
        };
        if(!((d === 1)
             || (d === 2)
             || (d === 3))){
            display.innerHTML("only 1 2 or 3 dimensions are supported. 1 dimention for filaments of galaxies. 2 dimentions for galactic disks. 3 dimentions for smaller and larger regions.");
            return(0);
        };
        var planets = [];
        for(var i = 0; i<N; i++){
            planets[i] = planet_maker(d, n);
        };
        planets = planets.sort(
            function(a, b){
                return(a.t - b.t)
            });
        return({
            planets: planets,
            c: c,
            s: s,
            d: d});
    };
    function discovery_time(p1, p2, s) {
        return(p1.t + (distance(p1, p2)/s));
    };
    function simulate(model){
        var p = model.planets;
        var s = model.s;
        var civs = [];
        var new_civ;
        for(var i = 0; i<p.length; i++){
            var civ_origin = p[i].t;
            //console.log(civ_origin);
            new_civ = true;
            for(var j = 0; j<civs.length; j++){
                var d = discovery_time(civs[j], p[i], s);
                //console.log(d);
                if(d<civ_origin){
                    civs[j].colonies.push(p[i].v);
                    new_civ = false;
                    j = civs.length;
                };
            };
            if(new_civ){
                civs.push(p[i]);
            };
        };
        return(civs);
    };
    function test(){
        var M = model_maker(0.5, 0.4, 1, 0.1, 1000);
        console.log(JSON.stringify(M));
        var S = simulate(M);
        console.log(JSON.stringify(S));
        console.log(S.length);
    };
    return({
        model: model_maker,
        simulate: simulate,
        test: test
    });
})();
