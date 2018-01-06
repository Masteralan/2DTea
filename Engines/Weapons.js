// Made by Alan O'Cull -- AKA Masteralan or MasterAlan2001
// Weapon script; deals with hitboxes, swords, etc

var Weapons = {
     GeneratedWeapons: [],

     GenerateWeapon: function(name, baseDMG, baseRangeX, baseRangeY, baseKnockback, maxCombo, maxComboDMG, maxComboSpeed, chainCombo, dmgRNG, cooldown){
		if (chainCombo !== true && chainCombo !== false){
			chainCombo = true;
		};
	
		var wep = {
			Name: name || "Unnamed Weapon",
			Melee: true,
			Speed: 1,
			Cooldown: cooldown || 1.25,
			//obj.WeaponStats.		CoolingDown: false,
			//obj.WeaponStats.		CurrentCooldown: 0,
	
			BaseDMG: baseDMG || 12.5,
			DMGRange: dmgRNG || 3,
			DMGType: "Normal",
	
			BaseRangeX: baseRangeX || 250,
			BaseRangeY: baseRangeY || 250,
			BaseKnockback: baseKnockback || 50,
	
			MaxCombo: maxCombo || 3,                    //Maximum number of attacks in a combo; affects all of the following:
			ComboDMG: maxComboDMG || 10,                //How much more damage attacks deal by the end of the combo
			ComboSpeed: maxComboSpeed || 1.25,          //How much attacks speed up by the end of the combo
			ChainCombo: chainCombo                      //Do you keep chaining even after completing a full combo?
		};
	
		Weapons.GeneratedWeapons.push(wep);
		return wep
	},


	UseWeapon: function(wep, owner, dir, force){	//Weapon, Object, Direction, Force of Knockback
		if(wep == undefined || owner == undefined || (owner.WeaponStats !== undefined && owner.WeaponStats.CoolingDown == true)){return};
		var pos = [owner.Position[0] + (wep.BaseRangeX/2)*dir[0], owner.Position[1]];
		
		var hit = Damaging.Hitbox(pos, false, [wep.BaseRangeX, wep.BaseRangeY]);
		Damaging.RenderHitbox(hit);
		
		var hObj = Damaging.GetHit(hit);
		var hits = [];
		for (var i = 0; i < hObj.length; i++){
			if (hObj[i] !== undefined && hObj[i].hit !== owner){
				hits.push(hObj[i].hit);
			};
		};
		
		// Damage Calculations
		var dmg = wep.BaseDMG + Random(-wep.DMGRange/2,wep.DMGRange/2) + (wep.MaxCombo-1)/3;
		var tdmg = 0;
		for (var i = 0; i < hits.length; i++){
			Damaging.DealDamage(hits[i], dmg, owner, wep.DMGType);
		};
		
		
		
		var wep2 = owner.WeaponStats;
		if (wep2 == undefined){wep2 = {}; owner.WeaponStats = wep2};
		
		wep2.CoolingDown = true;
		wep2.CurrentCooldown = wep.Cooldown;
		
		
		function StepCooldown(step){
			if (wep2.CoolingDown == true){
				wep2.CurrentCooldown = wep2.CurrentCooldown - wep.Speed*step;
				if (wep2.CurrentCooldown <= 0){
					wep2.CurrentCooldown = 0;
					wep2.CoolingDown = false;
				};
			};
			
			if (wep2.CoolingDown == false){
				SpliceFromTable(StepCooldown, StepFunctions);
			};
			
			return
		};
		StepFunctions.push(StepCooldown);
		
		
        return tdmg
     }
};
//Weapons.GenerateWeapon("Drewblade", 12.5, 125, 5, 12.5, 2, false, 3);
