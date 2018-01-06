// Made by Alan O'Cull --- AKA Masteralan or Masteralan2001
// This is a basic humanoid module for easier API basing

var Humanoid = {
	Objects: [],

	SetupHumanoid: function(obj, ai, phys, magic, stam) {	//0 for no AI (easiest) and 100 for hardest
		ai = ai || 0;
		if (phys !== true && phys !== false) {phys = true};
		obj.IsHumanoid = true;

		magic = magic || false;
		if (stam !== true && stam !== false) {stam = true};

		Damaging.SetupDamaging(obj, 100, 1, 0, 0, 1, 0, 0);
		
		var objSX = obj.Size[0];
		var objSY = obj.Size[1];
		if (obj.Velocity !== undefined && obj.Velocity.HitboxSize !== undefined){objSX = obj.Velocity.HitboxSize[0]; objSY = obj.Velocity.HitboxSize[1]};

		var hum = {
			MoveSpeed: 500,
			XLerpRate: .625,
			Direction: 0,
			Sprinting: false,
			SprintMultiplier: 2,	//MoveSpeed Multiplier that is automatically applied while sprinting
			SpeedToJumpMultiplier: 1.25,	//Going at full sprint will increase your jump power by this much, not moving at all is a multiplier of 1;

			JumpPower: 750,
			MaxJumps: 1,
			AirControl: .0125,
			Jumping: 0,
			TSLJ: 0,			//Time since last jump, acts as a nice timeout so players don't rapidly use all their double jumps

			Forcefield: undefined,

            Dead: false,
            DespawnOnDeath: true,

			Stun: 0,	//Current stun level, in numbers
			Stunned: 0,
			StunThreshold: 100,
			StunLoss: 3,	//Amount of stun lost per second (until stunned)
			StunLossStunned: 10,	//Amount of stun lost per second while stunned

			Temperature: 0
		};

		if (magic == true){
			obj.Mana = 100;
			obj.MaxMana = 100;
			obj.ManaRegeneration = 1.5;

			hum.ForcefieldManaCost = 8;
			hum.ForcefieldManaRate = 8;
		};
		if (stam == true){
			obj.Stamina = 100;
			obj.MaxStamina = 100;
			obj.StaminaRegeneration = 2;

			hum.SprintStaminaRate = 8;
			hum.JumpStaminaCost = 5;
			hum.JumpExtraStaminaCost = 8;
		}

		hum.Move = function(dir, one) {
			if (hum.Stunned == true){return};

			if (one !== true && one !== false) {one = true};

			if (dir !== 0 && one == true) {
				hum.Direction = (dir/Math.abs(dir));	//Makes it 1 or 0
			} else {
				hum.Direction = dir;
			}
		};
		hum.Jump = function(jump) {
			if (hum.Stunned == true) {return};
			
			function CanJump(extra){
				if (extra == true){
					if (obj.Stamina !== undefined && obj.Stamina < hum.JumpExtraStaminaCost) {	//Stamina Check
						return false
					} else if (obj.Stamina !== undefined) {
						obj.Stamina = obj.Stamina - hum.JumpExtraStaminaCost;
						return true
					};
				} else {
					if (obj.Stamina !== undefined && obj.Stamina < hum.JumpStaminaCost) {	//Stamina Check
						return false
					} else if (obj.Stamina !== undefined) {
						obj.Stamina = obj.Stamina - hum.JumpStaminaCost;
						return true
					};
				};
				return false
			};
			function DoJump(){
				var additive = 0;
				if (obj.Velocity !== undefined){
					additive = ((Math.abs(obj.Velocity.x)/(hum.MoveSpeed*hum.SprintMultiplier))*(hum.SpeedToJumpMultiplier-1))*hum.JumpPower;
					if (hum.Direction == 0 || additive < 0){
						additive = 0;
					};
				};
				
				obj.Velocity.y = -(hum.JumpPower + additive);
				hum.TSLJ = 0;	//Time Since Last Jump

				if (obj.Class == "Sprite") {	//Animations
					Animations.SetAnimation(obj, obj.NPCA, "Jump");
					obj.NextAnim = "Fall";
				};
				return
			};
			

			if (obj.Velocity.falling == false) {	//On-Ground Jump
				if(CanJump(false) !== true){return};
				
				//Actual Stuff
				hum.Jumping = 1;
				DoJump();
			} else if (hum.Jumping > 0 && hum.Jumping < hum.MaxJumps && hum.TSLJ >= 0.25) {	//Mid-Air Jumps
				if(CanJump(true) !== true){return};

				//Actual Jumping and Such
				hum.Jumping++;
				DoJump();
			};
		};
		hum.Shield = function(val) {
			if (val !== true && val !== false) {
				if (hum.Forcefield !== undefined){
					val = false
				} else {val = true}
			};

			if (val == true && hum.Forcefield == undefined) {

				if (hum.ForcefieldManaCost !== undefined && obj.Mana !== undefined){	//Uses mana? Check!
					if (obj.Mana < hum.ForcefieldManaCost){		//Not enough mana, no ff fo u
						return false
					} else {
						obj.Mana = obj.Mana - hum.ForcefieldManaCost;	//Leach a lot of mana on the spot so players don't spam
					};
				};

				hum.Forcefield = Forcefields.GenerateField(obj.Position, Vector.Magnitude(obj.Size)*1.1, obj);
				return true			//Yes we made a forcefield good job team

			} else if (val == false && hum.Forcefield !== undefined) {
				hum.Forcefield.Dispell();
				hum.Forcefield = undefined;
				return false
			};
			
			return false
		};

        hum.DeathDespawn = function(){
			hum.Dead = true;

			var smokeBase = Instance.New("Prop", "SmokeParticle", false, [50,50], obj.Position, 0, 8);
			Particle.Emit(smokeBase, 50, [50,250], [0,1], 25, undefined, [-360,360], [-45, 45], 0.0625, .1, [1,.5,.125], [1,.75,.25,0], [2,3], false);
			smokeBase.Destroy();
	
			n = Humanoid.Objects.indexOf(obj);
			if (n !== -1) {
				Humanoid.Objects.splice(n, 1);
			};
	
			Animations.SetAnimation(obj, obj.NPCA, "Death");
			obj.NextAnim = "Dead";
	
			return
		};



		if (ai > 0){
			var intel = ai;
			ai = {
				Intelligence: intel,
				ViewDistance: 2500,
				MinRangeBase: objSX*1.125,
				MaxRangeBase: objSX*2,

				LowHealth: 1/3,
				LowestHealth: 1/5
			};
			hum.AI = ai;
			
			if (obj.Weapon !== undefined){
				ai.MaxRangeBase = objSX/3 + obj.Weapon.BaseRangeX/1.25;
				//ai.MinRangeBase = obj.Size[0]/3;
			};
			console.log(ai.MaxRangeBase);
			console.log(ai.MinRangeBase);

			ai.StepAI = function(step){
				//FireRaycast: function(start, offset, ccwnc, ignore, showDebug);

				// Find Enemies //
				var enemies = [];
				var hs = Humanoid.Objects;
				for (var i = 0; i < hs.length; i++){
					if ((hs[i].TeamTag == undefined || hs[i].TeamTag !== obj.TeamTag) && Vector.Distance(hs[i].Position, obj.Position) <= ai.ViewDistance){
						enemies.push(hs[i]);
					};
				};


				// Pick Best Target //
				if (enemies.length <= 0){return};
				var target = enemies[0];
				if (target == undefined){return};


				// Distance and Direction Factors //
				var targetSX = target.Size[0];
				if (target.Velocity !== undefined && target.Velocity.HitboxSize !== undefined){targetSX = target.Velocity.HitboxSize[0]};
				var objSX = obj.Size[0];
				if (obj.Velocity !== undefined && obj.Velocity.HitboxSize !== undefined){objSX = obj.Velocity.HitboxSize[0]};
				
				var dist = Vector.Distance(target.Position, obj.Position);
				if (dist !== 0 && (dist > 0) == false && (dist < 0) == false){
					console.log("Distance is undefined!");
					dist = 0;
				};
				var dir = Vector.Direction(target.Position, obj.Position);

				var jump = false;
				if (-dir[1] >= 0.3){jump = true};
				dir = dir[0]/Math.abs(dir[0]);

				// Movement //
				if (target.Humanoid.Forcefield !== undefined){
					dist = dist/5;
				};
				
				if (dist >= ai.MaxRangeBase*2 && obj.Stamina > obj.MaxStamina/3){
					hum.Direction = dir;
					hum.Sprinting = true;
				} else if (dist >= ai.MaxRangeBase && (ai.Intelligence >= 30 && (obj.WeaponStats !== undefined && obj.WeaponStats.Coolingdown !== true) || obj.WeaponStats == undefined)){
					hum.Direction = dir;
				} else if (dist <= ai.MinRangeBase){
					//||(ai.Intelligence >= 50 && (target.WeaponStats == undefined || (target.WeaponStats.CoolingDown == false && dist <= target.Weapon.BaseRangeX)))
					hum.Direction = -dir;

					if (obj.Health/obj.MaxHealth <= ai.LowHealth){
						hum.Sprinting = true;
					};
				} else {
					if (obj.MirroredX == true && dir > 0){hum.Direction = dir}
					else if (obj.MirroredX !== true && dir < 0){hum.Direction = dir}
					else {hum.Direction = 0};
					hum.Sprinting = false;
				};
				
				if (target !== undefined && dist <= ai.MaxRangeBase*1.5 && dist >= ai.MinRangeBase){
					if (obj.Weapon !== undefined && target.Humanoid.Forcefield == undefined){
						console.log("hah");
						Weapons.UseWeapon(obj.Weapon, obj, [dir,0], hum.MoveSpeed);
					};
				};


				// Jumping //
				if (jump == true){
					hum.Jump(true);
				};

				return
			};
		};

		obj.Humanoid = hum;
		Humanoid.Objects.push(obj);
		return hum;
	},







	HandleHumanoids: function(step) {
		for (i = 0; i < Humanoid.Objects.length; i++) {
			var obj = Humanoid.Objects[i];
			var hum = obj.Humanoid;

               if (obj.Health <= 0 && hum.DespawnOnDeath == true){
                    hum.DeathDespawn();


               } else {
     			if (hum.AI !== undefined){
     				hum.AI.StepAI(step);
     			};

     			if (hum.Jumping > 0 && obj.Velocity.falling == false) {
     				hum.Jumping = 0;
     				if (obj.Class == "Sprite"){
     					Animations.SetAnimation(obj, obj.NPCA, "Idle");	//IdleLand
     					//obj.NextAnim = "Idle";
     				};
     			};
     			hum.TSLJ = hum.TSLJ + step;

     			if (hum.Stunned == false && hum.Stun >= hum.StunThreshold) {
     				hum.Stunned = true;
     			} else if (hum.Stunned == false && hum.Stun !== 0) {
     				hum.Stun = hum.Stun - hum.StunLoss*step;

     				if (hum.Stun <= 0) {
     					hum.Stun = 0
     				}
     			} else if (hum.Stunned == true) {
     				hum.Stun = hum.Stun - hum.StunLossStunned*step;

     				if (hum.Stun <= 0) {
     					hum.Stunned = false;
     					hum.Stun = 0
     				}
     			};


     			var dir = hum.Direction;
     			if (hum.Stunned == true && dir !== 0){
     				dir = 0;
     				hum.Direction = 0;
     			};
     			if (dir > 0){obj.MirroredX = false};
     			if (dir < 0){obj.MirroredX = true};

     			if (hum.Stunned !== true){
     				var speedDiv = 1;
     				if (hum.Forcefield !== undefined) {speedDiv = speedDiv/2};
     				if (hum.Sprinting == true){speedDiv = speedDiv*2};
     				var c = obj.Velocity.floorFriction*2;

     				if (obj.Velocity.falling == true) {
     					c = hum.AirControl
     				} else if (c > 1) {c = 1};

     				obj.Velocity.x = Lerp(obj.Velocity.x, dir*hum.MoveSpeed*speedDiv, c/(1-step));
					
					if (obj.CurrentAnimation !== "Jump" && obj.CurrentAnimation !== "Fall"){
						if (Math.abs(obj.Velocity.x) > 25){
							if (obj.CurrentAnimation !== "Run"){
								Animations.SetAnimation(obj, obj.NPCA, "Run");
							};
							
							obj.Speed = (Math.abs(obj.Velocity.x)/hum.MoveSpeed)/2;
						} else if (obj.CurrentAnimation == "Run"){
							Animations.SetAnimation(obj, obj.NPCA, "Idle");
							obj.Speed = 1;
						}
					} else {obj.Speed = 1;}
     			};



     			if (obj.Mana !== undefined){
     				//Forcefielding
     				if (hum.Forcefield !== undefined){
     					if (obj.Mana > 0){
     						obj.Mana = obj.Mana - hum.ForcefieldManaRate*step;
     						if (obj.Mana < 0){obj.Mana = 0};
     					};
     					if (obj.Mana <= 0){			//Not enough mana!
     						hum.Shield(false);	//Dispel forcefield
     					};

     				//Mana Regen
     				} else if (obj.Mana < obj.MaxMana) {
     					obj.Mana = obj.Mana + step*obj.ManaRegeneration;
     					if (obj.Mana > obj.MaxMana) {
     						obj.Mana = obj.MaxMana;
     					}
     				};
     			};

     			//Stamina Regen
     			if (obj.Stamina !== undefined){
     				if (obj.Stamina < obj.MaxStamina && (hum.Sprinting == false || (hum.Sprinting == true && hum.Direction == 0))) {
     					obj.Stamina = obj.Stamina + step*obj.StaminaRegeneration;
     					if (obj.Stamina > obj.MaxStamina) {
     						obj.Stamina = obj.MaxStamina;
     					}
     				} else if (hum.Sprinting == true && hum.Direction !== 0){
     					if (obj.Stamina > 0){
     						obj.Stamina = obj.Stamina - hum.SprintStaminaRate*step;
     					};
     					if (obj.Stamina <= 0){
     						obj.Stamina = 0;
     						hum.Sprinting = false;
     					}
     				}
     			}
     		}
          }
	}
};
StepFunctions.push(Humanoid.HandleHumanoids);


/*
var enemy = Instance.New("Sprite", "Shade", true, [50,50], [0,250], 0, 4);
enemy.Opacity = 0.75;
enemy.ASR = [0.35,0.35];
enemy.NPCA = "Shade";
enemy.Weapon = Weapons.GeneratedWeapons[1];

Animations.SetAnimation(enemy, "Shade", "Idle");
Physics.SetupPhysics(enemy, false, 0);
enemy.Velocity.y = 250;
var ehum = Humanoid.SetupHumanoid(enemy, 1, false, true, true);
enemy.Velocity.HitboxSize = [150,290];




*/
