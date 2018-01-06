// Made by Alan O'Cul -- AKA Masteralan or MasterAlan2001
// Basic forcefield script; can be called from by any entity

var Forcefields = {
	list: [],
	
	GenerateField: function(pos, diameter, follow, speed, hp) {
		diameter = diameter || 250;
		pos = pos || [0,0];
		var ff = Instance.New("Image", "Forcefield", true, [diameter, diameter], pos, 0, 4, "Forcefield.png");
		
		ff.Follow = follow || undefined;
		Damaging.SetupDamaging(ff, false, hp || 50);
		ff.Diameter = diameter;
		ff.D = 1;
		ff.Tick = 0;
		
		ff.Velocity = Physics.SetupPhysics(ff, false, 1.25, 0, false, false);
		ff.Velocity.r = speed || 180;
		
		Forcefields.list.push(ff);
		
		ff.Dispell = function() {
			Physics.RemovePhysics(ff);
			
			var n = Forcefields.list.indexOf(ff);
			if (n !== -1) {
				Forcefields.list.splice(n, 1);
			};
			
			ff.Destroy();
			
			return undefined
		};
		
		return ff
	},
	
	StepForcefields: function(step) {
		var f = Forcefields.list;
		if (f.length == 0) {return};
		for (i = 0; i < f.length; i++) {
			var ff = f[i];

			if (ff.Follow !== undefined) {
				ff.Position = f[i].Follow.Position
			};
			
			ff.Tick = ff.Tick + step;
			if (ff.Tick > 1){ff.Tick--};
			
			var c = (-(Math.pow(ff.Tick,2)) + ff.Tick)/2 + 1;
			
			var d = ff.Diameter*c;
			ff.Size = [d,d];
			
			if (ff.Health <= 0) {
				ff.Destroy();
			};
		}
	}
};

StepFunctions.push(Forcefields.StepForcefields);