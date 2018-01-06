// Made by Alan O'Cull; AKA Masteralan or MasterAlan2001
// Realistic Physics Engine

// Value Setup

var Physics = {
	Meter = 150,	//How many pixels = 1 meter IRL
	BiomassRatio = ((1.7*150)/68),	//I'm 5 feet 5 inches and weight ~68 kg
	SolidDensity = .25,		//Average density of a solid
	
	MassOfEarth: (5.972 * Math.pow(10, 24)),	//Mass of Earth in kilograms
	EarthGravity: true,
	
	GravitySources: [],		//Formatted as [position, mass, object];	If object exsists then it will ignore position and mass and substitute them for the object's properties instead
	Props: [],
	
	GetDistance: function(num){
		if (num == undefined){return 0};
		var m = num/Physics.Meter;
		var f = m*0.9144*3;
		var i = (f-Math.floor(f));
		f = f-i;
		i = i*12;
		console.log("Pixel distance " + num + " is equivalent to:");
		console.log(m + " meters");
		console.log(f + " feet and " + i + " inches");
		return m
	},
	FireRaycast: function(start, offset, ccwnc, ignore, showDebug){
		if (start == undefined || offset == undefined){return};
		
		var dir = Vector.Subtract(start, offset);
		//var m = Vector.Magnitude(dir);
		dir = Vector.Unit(offset)[1];
		
		var xMin = start[0];
		var xMax = start[0]+offset[0];
		var yMin = start[1];
		var yMax = start[1]+offset[1];
		
		if (xMin > xMax){	//Minimum is really maximum! Swap variables.
			var s = xMax;	//Saves variable
			xMax = xMin;	//Does the old switch-er-roo
			xMin = s;
		};
		if (yMin > yMax){
			var s = yMax;
			yMax = yMin;
			yMin = s;
		};
		
		//Formula: y = dir*x + start[1];
		function GetY(x){
			return (dir*x + start[1]);
		};
		
		var hit = [];
		
		if (ccwnc !== true && ccwnc !== false){ccwnc = false};	//Can collide with non-collideable
		for (var i = 0; i < PhysicsProps.length; i++) {
			var obj = PhysicsProps[i].prop;
			
			var doObj = true;
			if (ccwnc == false && PhysicsProps[i].collision == false){doObj == false};
			
			if (ignore !== undefined && doObj == true){
				for (var x = 0; x < ignore.length; x++){
					if (ignore[x] == obj){
						doObj = false;
						break;
					};
				};
			};
			
			
			// Optimizations //
			if (doObj == true){
				var hb = Vector.GetHitboxCorners(obj.Vertices);
				for (var x = 0; x < hb.length; x++){
					hb[x] = Vector.Add(hb[x], obj.Position);
				};
				
				if (hb[2][0] < xMin || hb[0][0] > xMax){
					doObj = false;
				};
			};
			
			
			// Actual Raycast //
			if (doObj == true){
				var v = obj.Vertices;
				for (var x = 0; x < v.length; x++){
					var p1 = v[x];
					var p2 = v[x+1];
					if (p2 == undefined){p2 = v[0]};
					
					if (p1[1] < p2[1]){
						var s = p2;
						p2 = p1;
						p1 = s;
					};
					
					p1 = Vector.Add(p1, obj.Position);
					p2 = Vector.Add(p2, obj.Position);
					
					if ((p1[0] >= xMin && p1[0] <= xMax) || (p2[0] >= xMin && p2[0] <= xMax)){
						var px = (p1[0]+p2[0])/2;
						var y = GetY(px);
						
						if (y >= p2[1] && y <= p1[1]){
							hit.push([obj, [px, y]]);
						};
					};
				};
			};
		};
		
		var result = undefined;
		if (hit.length > 0){
			result = hit[0];
			if (hit.length > 1){
				for (var i = 0; i < hit.length; i++){
					if (Vector.Distance(start, (hit[i])[1]) < Vector.Distance(start, result[1])){
						result = hit[i];
					};
				};
			};
		} else {
			result = [undefined, Vector.Add(start, offset)];
		};
		
		/*if (showDebug == true){
			console.log("Running raycast!");
			console.log("Slope of Raycast: " + dir);
			console.log("Domain Min: " + xMin + "; Domain Max: " + xMax);
			console.log("Result Hit: " + result[0]);
			console.log("Result Intersect: " + result[1]);
			
			var d = Vector.Distance(start, );
			
			var line = Instance.New("Prop", "RayDebug Line", true, [5,5], result[1], 0, 6, "#ffffff", "#000000", .5);
			var startP = Instance.New("Prop", "RayDebug Start", true, [5,5], start, 0, 6, "#ffffff");
			var endP = Instance.New("Prop", "RayDebug End", true, [5,5], result[1], 0, 6, "#ffffff");
			
			line.Destroy(10000);
			startP.Destroy(10000);
			endP.Destroy(10000);
		};*/
		
		return result;
	},
	
	SetupObject: function(obj, anchored, mass, friction, elasticity, collideable, gravity){
		anchored = anchored || false;
		mass = mass || (obj.Size[0]*obj.Size[1])*Physics.SolidDensity;
		if (obj.Humanoid !== undefined){mass = ((obj.Size[0]/125)*obj.Size[1])/Physics.BiomassRatio};	//Meh method for getting approximate mass of a biological object
		
		var p = {
			Velocity: [0,0],
			LastPos: obj.Position || [0,0],
			NewPos: obj.Position || [0,0],
			
			Mass: 250,
			Elasticity: .75,
			Friction: .125
		};
		obj.Physics = p;
		return p;
	},
	
	
	CollideObjects: function(obj1, obj2, step, frictional){
		var p1 = obj1.Physics;
		var p2 = obj2.Physics;
		
		var m1 = Vector.MultiplyNum([p1.Velocity, p1.Velocity], p1.Mass);
		var m2 = Vector.MultiplyNum([p2.Velocity, p2.Velocity], p2.Mass);
		var ms = Vector.Add(m1, m2);
		
		if ((p1.Elasticity == 0 || p2.Elasticity == 0) && frictional !== true){
			var velo = Vector.DivideNum(Vector.Add(m1, m2), p1.Mass + p2.Mass);
			p2.Velocity = velo;
			p1.Velocity = velo;
			
		} else if (frictional == true) {
			var fric = (p1.Friction + p2.Friction)/2;	//Technically this is how it would be IRL; 2 surfaces of different ruggednesses interlock
			
			if (p1.Friction == 0 || p2.Friction == 0){	//Frictionless surfaces can still occur
				//fric = 0
				return		//Frictionless, next calculations are useless. Move along.
			};
			
			var fm1 = Vector.MultiplyNum(m1, fric*step);		//Find how much momentum is transferred to other object (perfect system)
			var fm2 = Vector.MultiplyNum(m2, fric*step);
			
			p2.Velocity = Vector.DivideNum(Vector.Add(Vector.Subtract(m2, fm2), fm1), p2.Mass);		//Loses own momentum given to other object, gains momentum given by other object
			p1.Velocity = Vector.DivideNum(Vector.Add(Vector.Subtract(m1, fm1), fm2), p1.Mass);		//Same format here
			
		} else {
			p2.Velocity = Vector.MultiplyNum(Vector.DivideNum(m1, p2.Mass), p2.Elasticity);
			p1.Velocity = Vector.MultiplyNum(Vector.DivideNum(m2, p1.Mass), p1.Elasticity);
		};
		
		return
	},
	StepVelocities: function(step){
		var p = Physics.Props;
		for (var i = 0; i < p.Length; i++){
			p[i].Physics.LastPos = p[i].Position;
			p[i].Physics.NewPos = Vector.Add(p[i].Position, Vector.MultiplyNum(p[i].Physics.Velocity, step));
			p[i].Position = p[i].Physics.NewPos;
		};
	},
	StepPhysics: function(step){
		Physics.StepVelocities(step);
		
		for (var i = 0; i < Physics.Props.length; i++){
			var o = Physics.Props[i];
			var v = o.Vertices;
			var interactions = [];
			
			for (var x = 0; x < v.length; x++){
				
			}
		};
		
		return
	}
};



